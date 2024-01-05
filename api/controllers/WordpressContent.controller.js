import * as WPContentRepo from '../repositories/WordpressContent.repo.js'
import {Response, PagedResponse} from '../util/Response.js'
import {normalizePaging} from '../util/Paging.js'
import * as constants from '../config/constants.js'
import * as messages from '../config/messages.js'
import {getContentWp} from 'libts/lib/getContentWp/index.js'
import {genSlug} from 'libts/lib/nlp/index.js'
import configKeys from '../config/keys.config.js'
export const getContents = async (req, res, next) => {
  try {
    const {page, from, pageSize} = normalizePaging(req.query.page, req.query.pageSize)
    const result = await WPContentRepo.findAll(
      req.query.title || null,
      req.query.authorId || null,
      req.query.fromDate || null,
      req.query.toDate || null,
      from,
      pageSize,
      req.query.sortBy || constants.DEFAULT_ORDER_BY_ATR,
      req.query.desc === 'true' ? constants.ORDER_BY_DESC : constants.DEFAULT_ORDER_BY_TYPE,
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
    req.log.error(messages.ERROR_GET_ALL_WORDPRESS_CONTENT)
    next(err)
  }
}
export const getContent = async (req, res, next) => {
  try {
    if (req.headers.Secreet == 'kwyZ6wJQdm') {
      const content = await WPContentRepo.findBySlug(req.params.slug)

      res.json(
        new Response({
          code: 200,
          doc: content,
        }),
      )
    }
  } catch (err) {
    console.log('Error when getting a content', err)
    req.log.error(messages.ERROR_GET_CONTENT)
    next(err)
  }
}
export const addContent = async (req, res, next) => {
  try {
    let dataAdded = req.body
    if (!dataAdded?.targetUrl.includes('http')) {
      dataAdded.targetUrl = 'https://' + dataAdded.targetUrl
    }
    if (!dataAdded.title || !dataAdded.content || !dataAdded.image) {
      const webInfor = await getContentWp(dataAdded.targetUrl)

      if (!dataAdded.title) {
        dataAdded.title = webInfor.title
      }
      if (!dataAdded.content) {
        dataAdded.content = webInfor.description
      }
      if (!dataAdded.image) {
        dataAdded.image = webInfor.imageLink
      }
    }
    // const domainGetIp = configKeys.domainGetIp

    dataAdded.url = genSlug(dataAdded.title)

    let saved
    try {
      saved = await WPContentRepo.add(dataAdded)

      const updateTargetUrl = dataAdded.url + saved[0].id
      saved = await WPContentRepo.update(saved[0].id, {url: updateTargetUrl})
    } catch (error) {
      console.log('Error when creat and update WPContent', error)
    }

    if (saved) {
      res.json(
        new Response({
          code: 200,
          doc: saved,
        }),
      )
    } else {
      res.json(
        new Response({
          code: 500,
          message: messages.CREATE_WORDPRESS_CONTENT_FAIL,
        }),
      )
    }
  } catch (err) {
    req.log.error(messages.ERROR_CREATE_WORDPRESS_CONTENT)
    next(err)
  }
}

export const updateContent = async (req, res, next) => {
  try {
    const updated = await WPContentRepo.update(req.params.id, req.body)

    if (!updated) {
      res.json(
        new Response({
          code: 404,
          message: messages.WORDPRESS_CONTENT_NOT_FOUND,
        }),
      )
    } else {
      res.json(
        new Response({
          code: 200,
          doc: updated,
        }),
      )
    }
  } catch (err) {
    req.log.error(messages.ERROR_UPDATE_WORDPRESS_CONTENT)
    next(err)
  }
}

export const deleteContent = async (req, res, next) => {
  try {
    const deleted = await WPContentRepo.remove(req.params.id)

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
          message: messages.WORDPRESS_CONTENT_NOT_FOUND,
        }),
      )
    }
  } catch (err) {
    req.log.error(messages.ERROR_DELETE_WORDPRESS_CONTENT)
    next(err)
  }
}
