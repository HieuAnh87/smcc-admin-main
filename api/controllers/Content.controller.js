import * as ContentRepo from '../repositories/Content.repo.js'
import * as AuthorRepo from '../repositories/Author.repo.js'
import { Response, PagedResponse } from '../util/Response.js'
import { normalizePaging } from '../util/Paging.js'
import * as constants from '../config/constants.js'
import * as messages from '../config/messages.js'
import * as FbAccountRepo from '../repositories/FbAccount.repo.js'
import * as SourceRepo from '../repositories/Source.repo.js'
import { editTelegramMessage, deleteTelegramMessage } from '../util/Notify.js'
import fs from 'fs'
import * as Content from '../repositories/Content.repo.js'
if (!fs.existsSync('screenShot')) {
  fs.mkdirSync('screenShot', { recursive: true })
}

// const browserToVisitWebsite = await  browser.newIncognitoPage()
// const page = await browserToVisitWebsite.newPage();
//
/**
 * Get content by id
 */
export const getContent = async (req, res, next) => {
  try {
    const content = await ContentRepo.findById(req.params.id)

    res.json(
      new Response({
        code: 200,
        doc: content,
      }),
    )
  } catch (err) {
    console.log('Error when getting a content', err)
    req.log.error(messages.ERROR_GET_CONTENT)
    next(err)
  }
}

/**
 * Get all contents
 */
export const getContents = async (req, res, next) => {
  try {
    const { page, from, pageSize } = normalizePaging(req.query.page, req.query.pageSize)
    const result = await ContentRepo.findAll(
      req.query,
      from,
      pageSize,
      req.query.sortBy ? req.query.sortBy : 'postedAt',
      req.query.desc === 'true' ? constants.ORDER_BY_DESC : 'asc',
    )
    res.json(
      new PagedResponse({
        code: 200,
        page: page,
        pageSize: pageSize,
        total: result.total,
        docs: result.docs,
      }),
    )
  } catch (err) {
    console.log('--------------------')
    console.log(err)
    req.log.error(messages.ERROR_GET_CONTENTS)
    next(err)
  }
}

export const getStatisticsContentForMonth = async (req, res, next) => {
  try {
    const rs = await ContentRepo.countContentPerDay();
    res.json(
      new Response({
        code: 200,
        doc: rs,
      }),
    )
  } catch (error) {
    next(error)
  }
}

export const getStatisticsContentForMonthPerSource = async (req, res, next) => {
  try {
    const rs = await ContentRepo.countContentForSourcePerDay();
    res.json(
      new Response({
        code: 200,
        doc: rs,
      }),
    )
  } catch (error) {
    next(error)
  }
}
export const getStatisticsContentForMonthPerTopic = async (req, res, next) => {
  try {
    const rs = await ContentRepo.countContentForTopicPerDay(req.query.topicId);
    res.json(
      new Response({
        code: 200,
        doc: rs,
      }),
    )
  } catch (error) {
    next(error)
  }
}

export const getStatistics = async (req, res, next) => {
  try {
    const rs = await ContentRepo.getStatistics(req.query.tid, req.query.sid, req.query.cid, req.query.start, req.query.end);
    res.json(
      new Response({
        code: 200,
        doc: rs,
      }),
    )
  } catch (error) {
    next(error)
  }
}

export const getStatBySource = async (req, res, next) => {
  try {
    const rs = await ContentRepo.getStatBySource(req.query.start, req.query.end);
    res.json(
      new Response({
        code: 200,
        doc: rs,
      }),
    )
  } catch (error) {
    next(error)
  }
}

export const getStatByCategory = async (req, res, next) => {
  try {
    const rs = await ContentRepo.getStatByCategory(req.query.start, req.query.end);
    res.json(
      new Response({
        code: 200,
        doc: rs,
      }),
    )
  } catch (error) {
    next(error)
  }
}

export const getStatByTopic = async (req, res, next) => {
  try {
    const rs = await ContentRepo.getStatByTopic(req.query.start, req.query.end);
    res.json(
      new Response({
        code: 200,
        doc: rs,
      }),
    )
  } catch (error) {
    next(error)
  }
}


// export const getContentsByCluster = async (req, res, next) => {
//   try {
//     const result = await ContentRepo.getFilterByCluster(req.query.cluster)
//     res.json(
//       new Response({
//         code: 200,
//         doc: result,
//       }),
//     )
//   } catch (error) {
//     console.log('Error when get outStanding: ', error)
//     req.log.error(messages.ERROR_GET_OUTSTANDING)
//     next(err)
//   }
// }
export const getTotalSourceHaveNewContent = async (req, res, next) => {
  try {
    const result = await ContentRepo.findTotalSourceHaveNewContent()
    res.json(
      new Response({
        code: 200,
        doc: result,
      }),
    )
  } catch (err) {
    next(err)
  }
}
export const getOutstanding = async (req, res, next) => {
  try {
    const result = await ContentRepo.getOutstanding(req.params?.type || null)
    res.json(
      new Response({
        code: 200,
        doc: result,
      }),
    )
  } catch (error) {
    console.log('Error when get outStanding: ', error)
    req.log.error(messages.ERROR_GET_OUTSTANDING)
    next(err)
  }
}
export const updateContent = async (req, res, next) => {
  try {
    // If content is added profile, take screenshot
    // const oldContent = await ContentRepo.findById(req.params.id)

    // if (oldContent && (!oldContent.profileIds  || oldContent.profileIds.length == 0) && req.body.profileIds.length) {
    //   if (oldContent.type == 'WEBSITE_POST') {
    // Take screenshot for website
    // await page.goto( oldContent.link, { waitUntil: 'networkidle2', timeout: 60000 } );
    // const d = new Date();
    // const path = `screenShot/website_${ oldContent.id }_${ d.toISOString() }.jpeg`;
    // await page.screenshot( { path: path , fullPage: true, type: 'jpeg' } );
    // req.body.screenShot = path;
    // } else if (oldContent.type == 'FB_POST') {
    // Take screenshot for facebook
    // const source = await SourceRepo.findById(oldContent.sourceId);

    // if (source && source.accountId) {
    //   const account = await FbAccountRepo.findById(source.accountId);

    //   if (account) {
    //     const fbPage = await browser.initialize(account);

    //     if (fbPage) {
    //       const loginSuccessful = await login(fbPage, account, prisma);

    //       if (loginSuccessful) {
    //         const cookies = JSON.parse(JSON.stringify(await fbPage.cookies()));
    //         account.cookies = JSON.stringify(cookies[0]);
    //         await FbAccountRepo.update(account.id, account);
    //       }

    //       await fbPage.goto( oldContent.link, { waitUntil: 'networkidle2', timeout: 60000 } );
    //       const d = new Date();
    //       const path = `screenShot/facebook_${ oldContent.id }_${ d.toISOString() }.jpeg`;
    //       await page.screenshot( { path: path, fullPage: true, type: 'jpeg' } );
    //       req.body.screenShot = path;
    //     }
    //   }
    // }
    // }
    // }

    const content = await ContentRepo.update(req.params.id, null, req.body)

    if (!content) {
      res.json(
        new Response({
          code: 404,
          message: messages.CONTENT_NOT_FOUND,
        }),
      )
    } else {
      if (req.body.userHandle == 'skippedPost') {
        await deleteTelegramMessage(content[0].idTeleGroup)
      } else if (req.body.userHandle == 'handledPost') {
        await editTelegramMessage(content[0].idTeleGroup, content[0].contentTeleNoti)
      }
      res.json(
        new Response({
          code: 200,
          doc: content,
        }),
      )
    }
  } catch (err) {
    console.log('Error when update contents', err)
    req.log.error(messages.ERROR_UPDATE_CONTENT)
    next(err)
  }
}
export const updateMultilContent = async (req, res, next) => {
  try {
    let contents = await ContentRepo.updateMultil(req.body.ids, req.body.userHandleType)
    res.json(
      new Response({
        code: 200,
        doc: contents,
      }),
    )
  } catch (err) {
    console.log('Error when update multil contents', err)
    req.log.error(messages.ERROR_UPDATE_CONTENT)
    next(err)
  }
}
export const deleteContent = async (req, res, next) => {
  try {
    const deleted = await ContentRepo.remove(req.params.id)

    if (deleted) {
      res.json(
        new Response({
          code: 200,
          doc: deleted,
        }),
      )
    } else {
      res.json(
        new Response({
          code: 404,
          message: messages.CONTENT_NOT_FOUND,
        }),
      )
    }
  } catch (err) {
    req.log.error(messages.ERROR_DELETE_CONTENT)
    next(err)
  }
}
