import * as FbAccountRepo from "../repositories/FbAccount.repo.js";
import { Response, PagedResponse } from "../util/Response.js";
import { normalizePaging } from "../util/Paging.js";
import * as constants from "../config/constants.js";
import * as messages from "../config/messages.js";
import { crawlerSockets } from '../websocket/index.js';

export const getFbAccounts = async (req, res, next) => {
  try {
    const { page, from, pageSize } = normalizePaging(
      req.query.page,
      req.query.pageSize
    );
    const result = await FbAccountRepo.findAll(
      req.query.name || null,
      req.query.email || null,
      req.query.status || null,
      from,
      pageSize,
      req.query.sortBy || constants.DEFAULT_ORDER_BY_ATR,
      req.query.desc === 'true' ? constants.ORDER_BY_DESC : constants.DEFAULT_ORDER_BY_TYPE
    );
    
    res.json(
      new PagedResponse({
        code: 200,
        page: page,
        pageSize: pageSize,
        total: result.total,
        docs: result.docs
      })
    );
  } catch (err) {
    req.log.error(messages.ERROR_GET_ALL_FBACCOUNTS);
    next(err);
  }
};

export const addFbAccount = async (req, res, next) => {
  try {
    if (!req.body.fbId && !req.body.email && !req.body.phone) {
      return res.json(
        new Response({
          code: 500,
          message: messages.CREATE_FBACCOUNT_FAIL
        })
      );
    }
    const account = await FbAccountRepo.add(req.body);
    if (account) {
      crawlerSockets?.fbCrawler?.emit('add_account')
      return res.json(
        new Response({
          code: 200,
          doc: account
        })
      );
    } else {
      return res.json(
        new Response({
          code: 500,
          message: messages.CREATE_FBACCOUNT_FAIL
        })
      );
    }
  } catch (err) {
    console.log(err)
    req.log.error(messages.ERROR_CREATE_FBACCOUNT);
    next(err);
  }
};

export const updateFbAccount = async (req, res, next) => {
  try {
    const account = await FbAccountRepo.update(
      req.params.id,
      req.body
    );

    if (!account) {
      res.json(
        new Response({
          code: 404,
          message: messages.FBACCOUNT_NOT_FOUND
        })
      );
    } else {
      res.json(
        new Response({
          code: 200,
          doc: account
        })
      );
    }
  } catch (err) {
    req.log.error(messages.ERROR_UPDATE_FBACCOUNT);
    next(err);
  }
};

export const deletFbAccount = async (req, res, next) => {
  try {
    const account = await FbAccountRepo.remove(req.params.id);
    if (account) {
      res.json(
        new Response({
          code: 200,
          doc: account
        })
      );
    } else {
      res.json(
        new Response({
          code: 404,
          message: messages.FBACCOUNT_NOT_FOUND
        })
      );
    }
  } catch (err) {
    req.log.error(messages.ERROR_DELETE_FBACCOUNT);
    next(err);
  }
};