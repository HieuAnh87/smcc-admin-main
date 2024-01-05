import * as NotificationSettingRepo from "../repositories/NotificationSetting.repo.js";
import { Response, PagedResponse } from "../util/Response.js";
import { normalizePaging } from "../util/Paging.js";
import * as constants from "../config/constants.js";
import * as messages from "../config/messages.js";

export const getSettings = async (req, res, next) => {
  try {
    // const { page, from, pageSize } = normalizePaging(
    //   req.query.page,
    //   req.query.pageSize
    // );
    const result = await NotificationSettingRepo.findAll(
      req.userId
    );

    res.json(
      new Response({
        code: 200,
        doc: result
      })
    );
  } catch ( err )
  {
    console.log('Error when get notification settings',err)
    req.log.error(messages.ERROR_GET_NOTIFICATION_SETTING);
    next(err);
  }
};

export const updateSetting = async (req, res, next) => {
  try {
    const result = await NotificationSettingRepo.update(
      req.params.id,
      req.body
    );

    if (!result) {
      res.json(
        new Response({
          code: 404,
          message: messages.NOTIFICATION_SETTING_NOT_FOUND
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
    req.log.error(messages.ERROR_UPDATE_NOTIFICATION_SETTING);
    next(err);
  }
};
