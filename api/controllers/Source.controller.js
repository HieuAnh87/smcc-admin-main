import { gotScraping } from "got-scraping"
import * as SourceRepo from "../repositories/Source.repo.js"
import { Response, PagedResponse } from "../util/Response.js"
import { normalizePaging } from "../util/Paging.js"
import * as constants from "../config/constants.js"
import * as messages from "../config/messages.js"
import * as urlUtil from "../util/Url.js"
import { crawlerSockets } from "../websocket/index.js"

export const getSources = async (req, res, next) => {
  try {
    const { page, from, pageSize } = normalizePaging(req.query.page, req.query.pageSize)
    const result = await SourceRepo.findAll(
      req.query.tagIds || null,
      req.query.profileIds || null,
      req.query.name || null,
      req.query.type || null,
      req.query.status || null,
      from,
      pageSize,
      req.query.sortBy || constants.DEFAULT_ORDER_BY_ATR,
      req.query.desc === "true" ? constants.ORDER_BY_DESC : constants.DEFAULT_ORDER_BY_TYPE,
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
    req.log.error(messages.ERROR_GET_ALL_SOURCES)
    next(err)
  }
}

export const getSourceById = async (req, res, next) => {
  try {
    const source = await SourceRepo.findById(req.params.id)

    res.json(
      new Response({
        code: 200,
        doc: source,
      }),
    )
  } catch (err) {
    req.log.error(messages.ERROR_GET_SOURCE_BY_ID)
    next(err)
  }
}

export const addSources = async (req, res, next) => {
  try {
    console.log(req.body);
    // Remove duplicate
    req.body.links = Array.from(new Set(req.body.links.split(constants.CHAR_TO_SPLIT_TEXT)))
    // Extract facebook or website link. Trim and remove empty value
    let facebookLinks = []
    let websiteLinks = []
    let youtubeLinks = []
    let tiktokLinks = []
    for (let link of req.body.links) {
      if (link.indexOf("http") == -1) {
        link = "https://" + link
      }
      const urlProfile = urlUtil.verifyUrl(link)
      if (urlProfile && urlProfile.hostname.indexOf("facebook.com") > -1) {
        facebookLinks.push(urlProfile.origin + urlProfile.pathname)
      } else if (urlProfile && urlProfile.hostname.indexOf("youtube.com") > -1) {
        youtubeLinks.push(urlProfile.origin + urlProfile.pathname)
      } else if (urlProfile) {
        if (websiteLinks.indexOf(urlProfile) == -1) {
          websiteLinks.push(urlProfile)
        }
      }
    }

    let validLinks = []
    let invalidLinks = []
    // Verify and insert website links
    if (websiteLinks.length) {
      await Promise.allSettled(
        websiteLinks.map(async (link) => {
          // Insert source info to database
          const hostname = new URL(link).hostname
          const url = new URL(link)
          let source = null
          try {
            source = await SourceRepo.add({
              link: link.href,
              name: url ? url.hostname.replace("www.", "") : link,
              avatar: hostname ? "https://icon.horse/icon/" + hostname : "https://icon.horse/icon/google.com",
              type: "WEBSITE",
              status: "LIVE",
              //isTopic: url.pathname === "/" ? false : true,
              categoryId: req.body.categoryId
            })
          } catch (err) {
            invalidLinks.push(link)
          }

          if (source) {
            validLinks.push(link)
          } else {
            invalidLinks.push(link)
          }
        }),
      )
    }
    // if (youtubeLinks.length) {
    //   await Promise.allSettled(
    //     youtubeLinks.map(async (link) => {
    //       // Insert source info to database
    //       const hostname = new URL(link).hostname
    //       let source = null
    //       try {
    //         source = await SourceRepo.add({
    //           link: link,
    //           name: hostname ? hostname : link,
    //           avatar: hostname ? "https://icon.horse/icon/" + hostname : "https://icon.horse/icon/google.com",
    //           type: "YOUTUBE",
    //           status: "LIVE",
    //         })
    //       } catch (err) {
    //         invalidLinks.push(link)
    //       }

    //       if (source) {
    //         validLinks.push(link)
    //       } else {
    //         invalidLinks.push(link)
    //       }
    //     }),
    //   )
    // }
    // Verify and insert facebook links
    if (facebookLinks.length) {
      try {
        console.log("New facebook links: ", facebookLinks)
        const { newSources, invalidUrls } = await new Promise((resolve, reject) => {
          if (crawlerSockets.fbCrawler) {
            crawlerSockets.fbCrawler.emit("check_source_req", facebookLinks)
            crawlerSockets.fbCrawler.once("check_source_res", (result) => {
              console.log("result from socket: ", result)
              resolve(result)
            })
            crawlerSockets.fbCrawler.once("error", (error) => {
              console.log("Error socket: ", error)
              reject(error)
            })
          } else {
            console.log("No crawler socket available")
            reject("No crawler socket")
          }
        })

        invalidLinks.push(...invalidUrls)

        for (const info of newSources) {
          try {
            const source = await SourceRepo.add(info)
            if (source) {
              validLinks.push(info.link)
            }
          } catch (error) {
            invalidLinks.push(info.link)
            console.log("Error when add source to db: ", error)
          }
        }
      } catch (err) {
        console.log("Error catch: ", err)
        invalidLinks.concat(facebookLinks)
      }
    }
    res.json(
      new Response({
        code: 200,
        doc: {
          success: validLinks,
          fail: invalidLinks,
        },
      }),
    )
  } catch (err) {
    req.log.error(messages.ERROR_CREATE_SOURCE)
    req.log.error(err)
    next(err)
  }
}

export const updateSource = async (req, res, next) => {
  try {
    const source = await SourceRepo.update(req.params.id, req.body)

    if (!source) {
      res.json(
        new Response({
          code: 404,
          message: messages.SOURCE_NOT_FOUND,
        }),
      )
    } else {
      res.json(
        new Response({
          code: 200,
          doc: source,
        }),
      )
    }
  } catch (err) {
    req.log.error(messages.ERROR_UPDATE_SOURCE)
    next(err)
  }
}

export const deleteSource = async (req, res, next) => {
  try {
    const source = await SourceRepo.remove(req.params.id)

    if (source) {
      res.json(
        new Response({
          code: 200,
          doc: source,
        }),
      )
    } else {
      res.json(
        new Response({
          code: 404,
          message: messages.SOURCE_NOT_FOUND,
        }),
      )
    }
  } catch (err) {
    req.log.error(messages.ERROR_DELETE_SOURCE)
    next(err)
  }
}


export const getSourceHaveLessContent = async (req, res, next) => {
  try {
    const rs = await SourceRepo.getSourceHaveLessContent();
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
