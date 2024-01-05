import * as AuthorRepo from "../repositories/Author.repo.js";
import { PagedResponse, Response } from "../util/Response.js";
import { normalizePaging } from "../util/Paging.js";
import * as constants from "../config/constants.js";
import * as messages from "../config/messages.js";

export const getAuthors = async (req, res, next) => {
  try {
    const { page, from, pageSize } = normalizePaging(
      req.query.page,
      req.query.pageSize
    );
    const result = await AuthorRepo.findAll(
      req.query.tagIds || null,
      req.query.profileIds || null,
      req.query.name || null,
      from,
      pageSize,
      req.query.sortBy || constants.DEFAULT_ORDER_BY_ATR,
      req.query.desc ? constants.ORDER_BY_DESC : constants.DEFAULT_ORDER_BY_TYPE
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
    req.log.error(messages.ERROR_GET_ALL_AUTHORS);
    next(err);
  }
};

export const getAuthor = async (req, res, next) => {
  try {
    const author = await AuthorRepo.findById(req.params.id);

    res.json(
      new Response({
        code: 200,
        doc: author
      })
    );
  } catch (err) {
    req.log.error(messages.ERROR_GET_AUTHOR);
    next(err);
  }
};

export const updateAuthor = async (req, res, next) => {
  try {
    const author = await AuthorRepo.update(
      req.params.id,
      req.body
    );

    if (!author) {
      res.json(
        new Response({
          code: 404,
          message: messages.AUTHOR_NOT_FOUND
        })
      );
    } else {
      res.json(
        new Response({
          code: 200,
          doc: author
        })
      );
    }
  } catch (err) {
    req.log.error(messages.ERROR_UPDATE_AUTHOR);
    next(err);
  }
};
