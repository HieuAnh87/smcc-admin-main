import * as HistoryRepo from '../repositories/History.repo.js'
import {Response, PagedResponse} from '../util/Response.js'
import {normalizePaging} from '../util/Paging.js'
import * as constants from '../config/constants.js'
import * as messages from '../config/messages.js'

export const getHistory = async (req, res, next) => {
  try {
    const {page, from, pageSize} = normalizePaging(req.query.page, req.query.pageSize)
    const result = await HistoryRepo.findAll(
      req.userId || null,
      req.query.screen || null,
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
    req.log.error(messages.ERROR_GET_HISTORY)
    next(err)
  }
}

export const addHistory = async (req, res, next) => {
  try {
    const history = await HistoryRepo.add({...req.body, userId: req.userId})
    if (history) {
      res.json(
        new Response({
          code: 200,
          doc: history,
        }),
      )
    } else {
      res.json(
        new Response({
          code: 500,
          message: messages.CREATE_HISTORY_FAIL,
        }),
      )
    }
  } catch (err) {
    req.log.error(messages.ERROR_CREATE_HISTORY)
    next(err)
  }
}

export const deleteHistory = async (req, res, next) => {
  try {
    const history = await HistoryRepo.remove(req.params.id)

    if (history) {
      res.json(
        new Response({
          code: 200,
          doc: history,
        }),
      )
    } else {
      res.json(
        new Response({
          code: 404,
          message: messages.HISTORY_NOT_FOUND,
        }),
      )
    }
  } catch (err) {
    req.log.error(messages.ERROR_DELETE_HISTORY)
    next(err)
  }
}
