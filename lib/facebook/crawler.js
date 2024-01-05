import { promisify } from 'util'
import moment from 'moment'
import sleep from 'sleep-promise'
import { CookieJar } from 'tough-cookie'
import { gotScraping } from 'got-scraping'
import { getRequestOptions } from './requestConfig/index.js'
import { getPostsFromResponse, normalizeResponse } from './parser.js'
import { parse } from 'node-html-parser'

export const getPostsFromSource = async (
  sourceType,
  targetId,
  account,
  cursor,
  lastCrawlTime,
  callback
) => {
  let requestOptions, res, results
  lastCrawlTime = lastCrawlTime || moment().add(-2, 'days')
  account.userId = account.id
  const url = 'https://www.facebook.com/api/graphql/'
  const cookieJar = new CookieJar()
  const cookies = account.cookies.split(';').map(c => c.trim())
  callback = callback || console.log
  for (const cookie of cookies) {
    // console.log(cookie)
    await cookieJar.setCookie(cookie, 'https://m.facebook.com')
    await cookieJar.setCookie(cookie, 'https://www.facebook.com')
  }
  try {
    if (!cursor) {
      res = await gotScraping.get('https://m.facebook.com', {
        headers: {
          accept: '*/*',
          'accept-language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
          'cache-control': 'no-cache',
          'content-type': 'application/x-www-form-urlencoded',
          pragma: 'no-cache',
          'sec-ch-prefers-color-scheme': 'light',
          'sec-ch-ua':
            '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Linux"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'viewport-width': '1337',
          Referer: 'https://www.facebook.com/',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
        },
        method: 'GET',
        throwHttpErrors: false,
        cookieJar
      }).text()
      // console.log('CHECK: ', res)
      const matchToken = res.match(/name="fb_dtsg" value="(.*?)"/)
      if (matchToken && matchToken[1]) {
        account.token = matchToken[1]
      } else {
        console.log(res)
        return null
      }
      requestOptions = await getRequestOptions(
        sourceType,
        targetId,
        account.userId,
        account.token,
        cookieJar
      )
      res = await gotScraping({ ...requestOptions, url }).text()
      res = normalizeResponse(res)
      if (res?.errorSummary) {
        console.log(res)
        return null
      }
      if (typeof res == 'string') {
        return null
      }

      results = getPostsFromResponse(res)
      callback(results)
    } else {
      results = { nextCursors: [cursor] }
    }
    while (
      !(
        results?.nextCursors?.length == 0 ||
        results.posts?.every(p => p.postedAt < lastCrawlTime)
      )
    ) {
      requestOptions = await getRequestOptions(
        sourceType,
        targetId,
        account.userId,
        account.token,
        cookieJar,
        results.nextCursors.pop()
      )
      res = await gotScraping({ ...requestOptions, url }).text()
      res = normalizeResponse(res)
      if (res?.errorSummary) {
        console.log(res)
        break
      }
      if (typeof res == 'string') {
        console.log(res)
        break
      }
      results = getPostsFromResponse(res)
      callback(results)
    }
    account.cookies = await cookieJar.getCookieString('https://www.facebook.com')
  } catch (error) {
    console.log(error)
  }
}

export const getSourceFromUrl = async (url, account) => {
  const cookieJar = new CookieJar()
  const setCookie = promisify(cookieJar.setCookie.bind(cookieJar))
  const cookies = account.cookies.split(';').map(c => c.trim())
  for (const cookie of cookies) {
    await setCookie(cookie, 'https://wwww.facebook.com')
    await setCookie(cookie, 'https://m.facebook.com')
  }
  const pattern = /^(https?:\/\/)?((www|(m(basic)?))\.)?(facebook|fb)\.com\//gi
  if (url.match(pattern)) {
    const href = url.replace(pattern, '').split('?')[0]
    // console.log(href)
    try {
      const { body } = await gotScraping({
        url: `https://m.facebook.com/${href}`, headers: {
          accept: '*/*',
          'accept-language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
          'cache-control': 'no-cache',
          'content-type': 'application/x-www-form-urlencoded',
          pragma: 'no-cache',
          'sec-ch-prefers-color-scheme': 'light',
          'sec-ch-ua':
            '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Linux"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'viewport-width': '1337',
          Referer: 'https://m.facebook.com/',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
        }, useHeaderGenerator: false, cookieJar
      })
      const html = parse(body)
      let profilePicture = html.querySelector('#timelineBody img.profpic.img')?.getAttribute('src') || html.querySelector('#m-timeline-cover-section a i.profpic')?.style?.backgroundImage?.match(/url\("(.+)"/)[1]
      let profileName = html.querySelector('#cover-name-root h3')?.textContent || html.querySelector('#m-timeline-cover-section strong')?.textContent

      const pagePicture = html.querySelector('#msite-pages-header-contents img')?.getAttribute('src')
      const pageName = html.querySelector('div[data-nt="FB:TEXT4"]')?.textContent

      let groupName = html.querySelector('.groupChromeView h1')?.textContent
      let groupPicture = html.querySelector('.groupChromeView a i')?.getAttribute('style')
        ?.match(/url\('(.+)'/)[1]
        ?.replace(/\\3a/g, ':').replace(/\\3d/g, '=').replace(/\\26/g, '&').replace(/\s/g, '').replace(/\\/g, '')

      if (!profileName && !profilePicture && !groupName && !groupPicture && !pageName && !pagePicture) {
        const matchCodes = body.match(/<!-- <div(.+?)<\/div> -->/g)
        if (matchCodes) for (let code of matchCodes) {
          code = code.replace('<!--', '').replace('-->', '').trim()
          const html = parse(code)
          profilePicture = html.querySelector('#timelineBody img.profpic.img')?.getAttribute('src') || html.querySelector('#m-timeline-cover-section a i.img.profpic')
            ?.getAttribute('style')
            ?.match(/url\('(.+)'/)[1]
            ?.replace(/\\3a/g, ':').replace(/\\3d/g, '=').replace(/\\26/g, '&').replace(/\s/g, '').replace(/\\/g, '')
          profileName = html.querySelector('#cover-name-root h3')?.textContent || html.querySelector('#m-timeline-cover-section strong')?.textContent

          groupName = html.querySelector('.groupChromeView h1')?.textContent
          groupPicture = html.querySelector('.groupChromeView a i')?.getAttribute('style')
            ?.match(/url\('(.+)'/)[1]
            ?.replace(/\\3a/g, ':').replace(/\\3d/g, '=').replace(/\\26/g, '&').replace(/\s/g, '').replace(/\\/g, '')
          if ((profileName && profilePicture) || (groupName && groupPicture)) {
            break
          }
        }
      }

      const idPattern = /(?<=entity_id:)\d+/gi
      const matchId = body.match(idPattern)

      if (matchId) {
        return {
          id: matchId[0],
          type: profileName ? 'FB_PROFILE' : pageName ? 'FB_PAGE' : 'FB_GROUP',
          avatar: profilePicture || pagePicture || groupPicture,
          name: profileName || pageName || groupName
        }
      } else {
        return null
      }
    } catch (error) {
      console.log(error)
    }
  }
  account.cookies = await cookieJar.getCookieString('https://www.facebook.com')
  return null
}

export const checkPostUrl = async (url, account, campaignType) => {
  const cookieJar = new CookieJar()
  const setCookie = promisify(cookieJar.setCookie.bind(cookieJar))
  const cookies = account.cookies.split(';').map(c => c.trim())
  for (const cookie of cookies) {
    await setCookie(cookie, 'https://wwww.facebook.com')
    await setCookie(cookie, 'https://m.facebook.com')
  }
  const pattern = /^(https?:\/\/)?((www|(m(basic)?))\.)?(facebook|fb)\.com\//gi
  if (url.match(pattern)) {
    const href = url.replace(pattern, '')
    try {
      const { body } = await gotScraping({
        url: `https://m.facebook.com/${href}`, headers: {
          accept: '*/*',
          'accept-language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
          'cache-control': 'no-cache',
          'content-type': 'application/x-www-form-urlencoded',
          pragma: 'no-cache',
          'sec-ch-prefers-color-scheme': 'light',
          'sec-ch-ua':
            '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Linux"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'viewport-width': '1337',
          Referer: 'https://m.facebook.com/',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
        }, useHeaderGenerator: false, cookieJar
      })
      const html = parse(body)
      const postContainer = html.querySelector('#m_story_permalink_view');
      if (postContainer) {
        return true
      } else {
        return false
      }
    } catch (error) {
      console.log(error)
    }
  }
  account.cookies = await cookieJar.getCookieString('https://www.facebook.com')
  return false
}

export const getGroupsOfAccount = async (
  sourceType,
  targetId,
  account,
  cursor,
  callback
) => {
  let requestOptions, res, results
  account.userId = account.id
  const url = 'https://www.facebook.com/api/graphql/'
  const cookieJar = new CookieJar()
  const cookies = account.cookies.split(';').map(c => c.trim())
  callback = callback || console.log
  const groups = []
  for (const cookie of cookies) {
    // console.log(cookie)
    await cookieJar.setCookie(cookie, 'https://m.facebook.com')
    await cookieJar.setCookie(cookie, 'https://www.facebook.com')
  }
  try {
    res = await gotScraping.get('https://m.facebook.com', {
      headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded',
        pragma: 'no-cache',
        'sec-ch-prefers-color-scheme': 'light',
        'sec-ch-ua':
          '".Not/A)Brand";v="99", "Google Chrome";v="94", "Chromium";v="94"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'viewport-width': '1920',
        Referer: 'https://www.facebook.com/groups/feed/',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.54 Safari/537.36'
      },
      method: 'GET',
      throwHttpErrors: false,
      cookieJar
    }).text()
    // console.log('CHECK: ', res)
    const matchToken = res.match(/name="fb_dtsg" value="(.*?)"/)
    if (matchToken && matchToken[1]) {
      account.token = matchToken[1]
    } else {
      console.log(res)
      return null
    }

    do {
      requestOptions = await getRequestOptions(
        sourceType,
        targetId,
        account.userId,
        account.token,
        cookieJar,
        cursor
      )
      res = JSON.parse(await gotScraping({ ...requestOptions, url }).text())

      const edges =
        res?.data?.nonAdminGroups?.groups_tab?.tab_groups_list?.edges ||
        res?.data?.viewer?.groups_tab?.tab_groups_list?.edges
      if (edges && edges.length) {
        for (const groupInfo of edges) {
          groups.push(groupInfo.node.id)
        }
      }
      // callback(res?.data?.nonAdminGroups?.groups_tab?.tab_groups_list?.page_info?.end_cursor)
      // callback(res)
      cursor =
        res?.data?.nonAdminGroups?.groups_tab?.tab_groups_list?.page_info?.end_cursor ||
        res?.data?.viewer?.groups_tab?.tab_groups_list?.page_info?.end_cursor
    } while (cursor)

    account.cookies = await cookieJar.getCookieString('https://www.facebook.com')

    return groups
  } catch (error) {
    console.log(error)
    return null
  }
}
