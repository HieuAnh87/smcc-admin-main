import * as CampaignRepo from "../repositories/Campaign.repo.js";
import { Response, PagedResponse } from "../util/Response.js";
import { normalizePaging } from "../util/Paging.js";
import * as constants from "../config/constants.js";
import * as messages from "../config/messages.js";
// import { checkPostUrl } from "../../lib/facebook/index.js";
import * as FbAccountRepo from "../repositories/FbAccount.repo.js";
// import browser from "../../crawler/crawlFacebook/bin/browser/index.js";
// import {
//   login,
//   commentPost,
//   reportPost,getCookieString
// } from "../../crawler/crawlFacebook/bin/actions/index.js";
import { PrismaClient } from "../../lib/index.js";
import * as urlUtil from "../util/Url.js";

const prisma = new PrismaClient();

export const getCampaigns = async (req, res, next) => {
  try {
    const { page, from, pageSize } = normalizePaging(
      req.query.page,
      req.query.pageSize
    );
    const result = await CampaignRepo.findAll(
      req.query.fromDate || null,
      req.query.toDate || null,
      from,
      pageSize,
      req.query.sortBy || constants.DEFAULT_ORDER_BY_ATR,
      req.query.desc === "true"
        ? constants.ORDER_BY_DESC
        : constants.DEFAULT_ORDER_BY_TYPE
    );

    res.json(
      new PagedResponse({
        code: 200,
        page: page,
        pageSize: pageSize,
        total: result.total,
        docs: result.docs,
      })
    );
  } catch (err) {
    req.log.error(messages.ERROR_GET_ALL_CAMPAIGNS);
    next(err);
  }
};

export const addCampaign = async (req, res, next) => {
  try {
    // Split urls and remove duplicate
    req.body.contentUrls = Array.from(
      new Set(req.body.contentUrls.split(constants.CHAR_TO_SPLIT_TEXT))
    );
    // Trim and remove empty valuegetCookieString
    req.body.contentUrls = req.body.contentUrls.filter((url) => {
      if (url && url.trim()) {
        return url.trim();
      }
    });

    // check if post url is valid
    const invalidUrls = [];
    for (const url of req.body.contentUrls) {
      const result = urlUtil.verifyUrl(url);
      if (!result) {
        invalidUrls.push(url);
      }
    }

    if (invalidUrls.length) {
      return res.json(
        new Response({
          code: 500,
          message: messages.POST_URL_NOT_VALID,
          doc: invalidUrls,
        })
      );
    } else {
      // Insert campaign to DB
      const campaign = await CampaignRepo.add(req.body).catch((err) => {
        return res.json(
          new Response({
            code: 500,
            message: messages.CREATE_CAMPAIGN_FAIL,
          })
        );
      });

      if (campaign) {
        return res.json(
          new Response({
            code: 200,
            doc: campaign,
          })
        );
      } else {
        return res.json(
          new Response({
            code: 500,
            message: messages.CREATE_CAMPAIGN_FAIL,
          })
        );
      }
    }
  } catch (err) {
    req.log.error(messages.ERROR_CREATE_CAMPAIGN);
    next(err);
  }
};

export const updateCampaign = async (req, res, next) => {
  try {
    // Split urls and remove duplicate
    req.body.contentUrls = Array.from(
      new Set(req.body.contentUrls.split(constants.CHAR_TO_SPLIT_TEXT))
    );
    // Trim and remove empty value
    req.body.contentUrls = req.body.contentUrls.filter((url) => {
      if (url && url.trim()) {
        return url.trim();
      }
    });

    // check if post url is valid
    const invalidUrls = [];
    for (const url of req.body.contentUrls) {
      const result = urlUtil.verifyUrl(url);
      if (!result) {
        invalidUrls.push(url);
      }
    }

    if (invalidUrls.length) {
      res.json(
        new Response({
          code: 500,
          message: messages.POST_URL_NOT_VALID,
          doc: invalidUrls,
        })
      );
    } else {
      const campaign = await CampaignRepo.update(req.params.id, req.body);

      if (!campaign) {
        res.json(
          new Response({
            code: 404,
            message: messages.CAMPAIGN_NOT_FOUND,
          })
        );
      } else {
        res.json(
          new Response({
            code: 200,
            doc: campaign,
          })
        );
      }
    }
  } catch (err) {
    req.log.error(messages.ERROR_UPDATE_CAMPAIGN);
    next(err);
  }
};

export const deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await CampaignRepo.remove(req.params.id);

    if (campaign) {
      res.json(
        new Response({
          code: 200,
          doc: campaign,
        })
      );
    } else {
      res.json(
        new Response({
          code: 404,
          message: messages.CAMPAIGN_NOT_FOUND,
        })
      );
    }
  } catch (err) {
    req.log.error(messages.ERROR_DELETE_CAMPAIGN);
    next(err);
  }
};

export const runCampaign = async (req, res, next) => {
  let page = null;
  let loginSuccessful = false;
  const interactions = req.body.interactions;
  let postInteractionInfo = [...req.body.contentUrls];
  postInteractionInfo = postInteractionInfo.map((url) => {
    return {
      url: url,
      interactions: 0,
    };
  });
  let repeatCount = 0;
  let isLastRepeat = false;
  const campaign = req.body;
  try {
    campaign.status = "RUNNING";

    await CampaignRepo.update(req.params.id, campaign).catch((err) => {
      return res.json(
        new Response({
          code: 500,
          message: messages.RUN_CAMPAIGN_FAIL,
        })
      );
    });

    // do {
    //   // Get accounts to interact with post
    //   const accounts = await FbAccountRepo.findAll(
    //     null,
    //     null,
    //     "LIVE",
    //     repeatCount * interactions,
    //     interactions,
    //     constants.DEFAULT_ORDER_BY_ATR,
    //     constants.DEFAULT_ORDER_BY_TYPE
    //   ).catch((err) => {
    //     return res.json(
    //       new Response({
    //         code: 500,
    //         message: messages.RUN_CAMPAIGN_FAIL,
    //       })
    //     );
    //   });

    //   if (accounts && accounts.length < interactions) {
    //     isLastRepeat = true;
    //   }

    //   if (accounts && accounts.length) {
    //     for (const account of accounts) {
    //       // Create browser
    //       page = await browser.initialize(account);
    //       if (!page) {
    //         continue;
    //       }
    //       // Set cookies if already has cookies
    //       // if (account.cookies && account.cookies.length) {
    //       //     await page.setCookie(...JSON.parse(account.cookies));
    //       // }
    //       // Login to facebook account
    //       loginSuccessful = await login(page, account, prisma);
    //       if (loginSuccessful) {
    //         const cookies = JSON.parse(JSON.stringify(await page.cookies()));
    //         account.cookies = JSON.stringify(cookies[0]);
    //         await FbAccountRepo.update(account.id, account);
    //       }
    //       if (page && loginSuccessful) {
    //         // Interact with post
    //         if (campaign.type === "COMMENT") {
    //           for (const post of postInteractionInfo) {
    //             // Random comment content
    //             const content =
    //               campaign.comments[
    //                 Math.floor(Math.random() * campaign.comments.length)
    //               ];
    //             const result = await commentPost(
    //               post.url,
    //               content,
    //               page,
    //               account
    //             );
    //             if (result) {
    //               post.interactions++;
    //             }
    //           }
    //         } else if (campaign.type === "REPORT") {
    //           for (const post of postInteractionInfo) {
    //             const result = await reportPost(post.url, page, account);

    //             if (result) {
    //               post.interactions++;
    //             }
    //           }
    //         }
    //       }

    //       // Remove success post
    //       postInteractionInfo = postInteractionInfo.filter(
    //         (post) => post.interactions < interactions
    //       );

    //       if (postInteractionInfo.length == 0) {
    //         break;
    //       }

    //       await page.browser().close();
    //     }
    //   }
    //   repeatCount++;
    // } while (postInteractionInfo.length && isLastRepeat === false);

    // Update campaign info
    campaign.runCount++;
    campaign.endedAt = new Date();

    if (postInteractionInfo.length == 0) {
      campaign.status = "SUCCESS";
    } else {
      campaign.status = "LOST";
    }

    await CampaignRepo.update(req.params.id, campaign).catch((err) => {
      return res.json(
        new Response({
          code: 500,
          message: messages.UPDATE_AFTER_RUN_CAMPAIGN_FAIL,
          doc: campaign,
        })
      );
    });

    return res.json(
      new Response({
        code: 200,
        doc: campaign,
      })
    );
  } catch (err) {
    req.log.error(messages.RUN_CAMPAIGN_FAIL);
    next(err);
  } finally {
    if (page) {
      await page.browser().close();
    }
  }
};
