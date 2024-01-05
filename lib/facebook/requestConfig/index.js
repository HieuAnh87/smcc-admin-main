import { SOURCE_TYPE } from "@prisma/client"

const configRequests = {}
const cachedConfigRequests = {
  configRequests,
  expires: Date.now(),
}

export const getRequestOptions = async (
  sourceType,
  targetId,
  userId,
  token,
  cookieJar,
  cursor
) => {
  if (cachedConfigRequests.expires < Date.now()) {
    await getNewRequestOptions(browserConfig.context)
    cachedConfigRequests.expires = Date.now() + 1000 * 60 * 60 * 24
  }
  let config;
  let variables;
  switch (sourceType) {
    case SOURCE_TYPE.FB_ACCOUNT:
    case "profile":
      config = cachedConfigRequests["profile"];
      variables = { userID: targetId };
      break;

    case SOURCE_TYPE.FB_PAGE:
    case "page":
      config = cachedConfigRequests["page"];
      variables = { pageID: targetId };
      break;

    case SOURCE_TYPE.FB_GROUP:
    case "group":
      config = cachedConfigRequests["group"];
      variables = { groupID: targetId };
      break;

    case "groupList":
      config = cachedConfigRequests["groupList"];
      variables = { userID: targetId };
      break;

    default:
      break;
  }

  if (config) {
    return {
      ...config.firstOptions,
      ...(cursor ? { ...config.nextOptions } : null),
      headers: {
        ...config.firstOptions.headers,
        ...(cursor ? { ...config.nextOptions.headers } : null),
      },
      cookieJar,
      body: new URLSearchParams({
        ...config.firstBody,
        ...(cursor ? { ...config.nextBody } : null),
        av: userId,
        __user: userId,
        fb_dtsg: token,
        doc_id: cursor ? config.nextDocId : config.firstDocId,
        variables: JSON.stringify({
          ...config.firstVariables,
          ...(cursor
            ? {
              ...config.nextVariables,
              id: targetId,
              cursor,
            }
            : null),
          ...variables,
        }),
      }).toString(),
    };
  } else {
    return null;
  }
};

const getNewRequestOptions = async (context) => {
  const page = await context.newPage()

  try {
    page.on('response', async (res) => {
      if (res.url().match(/https:\/\/www\.facebook\.com\/api\/graphql/)) {
        const req = res.request()
        const body = req.postDataJSON()
        console.log(body.fb_api_req_friendly_name)

        if (body?.fb_api_req_friendly_name === 'CometGroupDiscussionRootSuccessQuery') {
          configRequests['group'] = {
            ...configRequests['group'],
            firstHeaders: {
              'x-fb-friendly-name': 'CometGroupDiscussionRootSuccessQuery',
            },
            firstBody: body,
            firstVariables: {
              ...JSON.parse(body.variables),
              sortingSetting: 'CHRONOLOGICAL',
            },
          }
        }
        if (body?.fb_api_req_friendly_name === 'GroupsCometFeedRegularStoriesPaginationQuery') {
          configRequests['group'] = {
            ...configRequests['group'],
            nextHeaders: {
              'x-fb-friendly-name': 'GroupsCometFeedRegularStoriesPaginationQuery',
            },
            nextBody: body,
            nextVariables: {
              ...JSON.parse(body.variables),
              sortingSetting: 'CHRONOLOGICAL',
            },
          }
        }

        if (body?.fb_api_req_friendly_name === 'CometSinglePageContentContainerFeedQuery') {
          configRequests['page'] = {
            ...configRequests['page'],
            firstHeaders: {
              'x-fb-friendly-name': 'CometSinglePageContentContainerFeedQuery',
            },
            firstBody: body,
            firstVariables: JSON.parse(body.variables),
          }
        }

        if (body?.fb_api_req_friendly_name === 'CometModernPageFeedPaginationQuery') {
          configRequests['page'] = {
            ...configRequests['page'],
            nextHeaders: {
              'x-fb-friendly-name': 'CometModernPageFeedPaginationQuery',
            },
            nextBody: body,
            nextVariables: JSON.parse(body.variables),
          }
        }

        if (body?.fb_api_req_friendly_name === 'GroupsCometTabGroupMembershipDialogQuery') {
          configRequests['groupList'] = {
            ...configRequests['groupList'],
            firstHeaders: {
              'x-fb-friendly-name': 'GroupsCometTabGroupMembershipDialogQuery',
            },
            firstBody: body,
            firstVariables: JSON.parse(body.variables),
          }
        }

        if (body?.fb_api_req_friendly_name === 'GroupsCometTabGroupMembershipListPaginationQuery') {
          configRequests['groupList'] = {
            ...configRequests['groupList'],
            nextHeaders: {
              'x-fb-friendly-name': 'GroupsCometTabGroupMembershipListPaginationQuery',
            },
            nextBody: body,
            nextVariables: JSON.parse(body.variables),
          }
        }

        if (body?.fb_api_req_friendly_name === 'ProfileCometTimelineFeedQuery') {
          configRequests['profile'] = {
            ...configRequests['profile'],
            firstHeaders: {
              'x-fb-friendly-name': 'ProfileCometTimelineFeedQuery',
            },
            firstBody: body,
            firstVariables: JSON.parse(body.variables),
            nextHeaders: {
              'x-fb-friendly-name': 'ProfileCometTimelineFeedPaginationQuery',
            },
            nextBody: body,
            nextVariables: JSON.parse(body.variables),
          }
        }
      }
    })

    // get group list requests
    await page.goto('https://www.facebook.com/groups', {
      waitUntil: 'networkidle',
    })

    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('[role="navigation"] [role="button"]')).filter(
        (a) => a.querySelector('i') && !a.textContent,
      )
      if (elements && elements.length) {
        ; (elements[0]).click()
      }
    })

    await page.waitForTimeout(2000)

    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('[role="menu"] [role="menuitem"]'))
      if (elements && elements.length) {
        ; (elements.slice(-1)[0]).click()
      }
    })

    await page.waitForTimeout(2000)

    const firstGroup = page.locator('[role="dialog"] a[href^="/groups/"]')
    const box = await firstGroup?.first().boundingBox()
    if (box) {
      await page.mouse.move(box?.x + box?.width / 2, box?.y + box?.height / 2)
      for (let i = 0; i < 4; i++) {
        await page.waitForTimeout(1000)
        await page.mouse.wheel(0, 1000)
        await page.waitForTimeout(1000)
      }
    }

    // get group requests

    await Promise.all([firstGroup?.first().click(), page.waitForLoadState('networkidle')])
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('PageDown')
      await page.waitForTimeout(1000)
    }

    // get page requests
    await page.goto('https://www.facebook.com/pages/?category=liked', {
      waitUntil: 'networkidle',
    })

    const pageLinks = await page.$$('a[href^="https://www.facebook.com/"]')
    const pageHrefs = await Promise.all(pageLinks.map((link) => link.getAttribute('href')))
    const validPageLink = pageHrefs
      .filter((link) => link?.match('https://www.facebook.com/[a-z0-9.]+?/$') && !link.endsWith('notifications/'))
      .slice(-1)[0]

    await Promise.all([page.click(`a[href="${validPageLink}"]`), page.waitForLoadState('networkidle')])

    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('PageDown')
      await page.waitForTimeout(1000)
    }

    // get profile requests
    await page.goto('https://www.facebook.com/friends', {
      waitUntil: 'networkidle',
    })

    const profileLinks = await page.$$('a[href^="https://www.facebook.com/profile.php?id="]')
    const profileHrefs = await Promise.all(profileLinks.map((link) => link.getAttribute('href')))
    const validProfileLink = profileHrefs.slice(-1)[0]

    await Promise.all([page.click(`a[href="${validProfileLink}"]`), page.waitForLoadState('networkidle')])

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('PageDown')
      await page.waitForTimeout(1000)
    }
  } catch (error) {
    console.log('Error when get new requests config: ', error)
  } finally {
    await page.close()
  }
}
