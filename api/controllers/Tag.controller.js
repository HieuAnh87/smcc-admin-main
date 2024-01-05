import * as TagRepo from "../repositories/Tag.repo.js";
import { Response, PagedResponse } from "../util/Response.js";
import { normalizePaging } from "../util/Paging.js";
import * as constants from "../config/constants.js";
import * as messages from "../config/messages.js";

export const getTags = async (req, res, next) => {
  try {
    const { page, from, pageSize } = normalizePaging(
      req.query.page,
      req.query.pageSize
    );
    const result = await TagRepo.findAll(
      req.query.name || null,
      req.query.fromDate || null,
      req.query.toDate || null,
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
    req.log.error(messages.ERROR_GET_ALL_TAGS);
    next(err);
  }
};

export const addTag = async (req, res, next) => {
  try {
    const tag = await TagRepo.add(req.body);
    if (tag) {
      res.json(
        new Response({
          code: 200,
          doc: tag
        })
      );
    } else {
      res.json(
        new Response({
          code: 500,
          message: messages.CREATE_TAG_FAIL
        })
      );
    }
  } catch (err) {
    req.log.error(messages.ERROR_CREATE_TAG);
    next(err);
  }
};

export const updateTag = async (req, res, next) => {
  try {
    const tag = await TagRepo.update(
      req.params.id,
      req.body
    );

    if (!tag) {
      res.json(
        new Response({
          code: 404,
          message: messages.TAG_NOT_FOUND
        })
      );
    } else {
      res.json(
        new Response({
          code: 200,
          doc: tag
        })
      );
    }
  } catch (err) {
    req.log.error(messages.ERROR_UPDATE_TAG);
    next(err);
  }
};

export const deleteTag = async (req, res, next) => {
  try {
    // Not remove default tag
    if (req.params.id === 'bafe7c3e-106c-4ebd-89c8-27f64de0c668' || req.params.id === '878aa7a3-8691-49b9-8018-2159a8b55175') {
      res.json(
        new Response({
          code: 200,
          doc: {}
        })
      );
    }

    const tag = await TagRepo.remove(req.params.id);
    
    if (tag) {
      res.json(
          new Response({
          code: 200,
          doc: tag
        })
      );
    } else {
      res.json(
          new Response({
          code: 404,
          message: messages.TAG_NOT_FOUND
        })
      );
    }
  } catch (err) {
    req.log.error(messages.ERROR_DELETE_TAG);
    next(err);
  }
};