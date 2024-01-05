import * as NotificationRepo from "../repositories/Notification.repo.js";
import { Response, PagedResponse } from "../util/Response.js";
import { normalizePaging } from "../util/Paging.js";
import * as constants from "../config/constants.js";
import * as messages from "../config/messages.js";

export const getNotifications = async (req, res, next) => {
  try {
    const { page, from, pageSize } = normalizePaging(
      req.query.page,
      req.query.pageSize
    );
    const result = await NotificationRepo.findAll(
      req.userId || null,
      req.query,
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
  } catch ( err )
  {
    console.log('Error when get notification',err)
    req.log.error(messages.ERROR_GET_ALL_NOTIFICATION);
    next(err);
  }
};

// export const addNotification = async (req, res, next) => {
//   try {
//     const result = await NotificationRepo.add(req.body);
//     if (result) {
//       res.json(
//         new Response({
//           code: 200,
//           doc: result
//         })
//       );
//     } else {
//       res.json(
//         new Response({
//           code: 500,
//           message: messages.CREATE_NOTIFICATION_FAIL
//         })
//       );
//     }
//   } catch (err) {
//     req.log.error(messages.ERROR_CREATE_NOTIFICATION);
//     next(err);
//   }
// };

export const updateNotification = async (req, res, next) => {
  try {
    const result = await NotificationRepo.update(
      req.params.id,
      req.body
    );

    if (!result) {
      res.json(
        new Response({
          code: 404,
          message: messages.NOTIFICATION_NOT_FOUND
        })
      );
    } else {
      res.json(
        new Response({
          code: 200,
          doc: result
        })
      );
    }
  } catch (err) {
    req.log.error(messages.ERROR_UPDATE_NOTIFICATION);
    next(err);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const result = await NotificationRepo.remove(req.params.id);
    
    if (result) {
      res.json(
          new Response({
          code: 200,
          doc: result
        })
      );
    } else {
      res.json(
          new Response({
          code: 404,
          message: messages.NOTIFICATION_NOT_FOUND
        })
      );
    }
  } catch (err) {
    req.log.error(messages.ERROR_DELETE_NOTIFICATION);
    next(err);
  }
};