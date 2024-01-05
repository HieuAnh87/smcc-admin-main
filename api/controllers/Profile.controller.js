import * as ProfileRepo from "../repositories/Profile.repo.js";
import * as ContentRepo from "../repositories/Content.repo.js";
import * as SourceRepo from "../repositories/Source.repo.js";
import * as AuthorRepo from "../repositories/Author.repo.js";
import { Response, PagedResponse } from "../util/Response.js";
import { normalizePaging } from "../util/Paging.js";
import * as constants from "../config/constants.js";
import * as messages from "../config/messages.js";

export const getProfiles = async (req, res, next) => {
  try {
    const { page, from, pageSize } = normalizePaging(
      req.query.page,
      req.query.pageSize
    );
    const result = await ProfileRepo.findAll(
      req.query.name || null,
      req.query.description || null,
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
    req.log.error(messages.ERROR_GET_ALL_PROFILES);
    next(err);
  }
};

export const getProfileById = async (req, res, next) => {
  try {
    const profile = await ProfileRepo.findById(req.params.id);
    
    res.json(
      new Response({
        code: 200,
        doc: profile
      })
    );
  } catch (err) {
    req.log.error(messages.ERROR_GET_PROFILES_BY_IDS);
    next(err);
  }
};

export const addProfile = async (req, res, next) => {
  try {
    const profile = await ProfileRepo.add(req.body);
    if (profile) {
      res.json(
        new Response({
          code: 200,
          doc: profile,
        })
      );
    } else {
      res.json(
        new Response({
          code: 500,
          message: messages.CREATE_PROFILE_FAIL,
        })
      );
    }
  } catch (err) {
    req.log.error(messages.ERROR_CREATE_PROFILE);
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const profile = await ProfileRepo.update(req.params.id, req.body);

    if (!profile) {
      res.json(
        new Response({
          code: 404,
          message: messages.PROFILE_NOT_FOUND,
        })
      );
    } else {
      res.json(
        new Response({
          code: 200,
          doc: profile,
        })
      );
    }
  } catch (err) {
    req.log.error(messages.ERROR_UPDATE_PROFILE);
    next(err);
  }
};

export const deleteProfile = async (req, res, next) => {
  try {
    const profile = await ProfileRepo.remove(req.params.id);

    if (profile) {
      // // Delete profile in content info
      // if (profile.contentids && profile.contentids.length > 0) {
      //   for (const id of profile.contentids) {
      //     const content = await ContentRepo.findById(id);
      //     if (content) {
      //       content.profileids = content.profileids.filter(profileId => profileId != profile._id);
      //       await ContentRepo.update(id, content);
      //     }
      //   }
      // }

      // // Delete profile in source info
      // if (profile.sourceids && profile.sourceids.length > 0) {
      //   for (const id of profile.sourceids) {
      //     const source = await SourceRepo.findById(id);
      //     if (source) {
      //       source.profileids = source.profileids.filter(profileId => profileId != profile._id);
      //       await SourceRepo.update(id, source);
      //     }
      //   }
      // }

      // // Delete profile in author info
      // if (profile.authorids && profile.authorids.length > 0) {
      //   for (const id of profile.authorids) {
      //     const author = await AuthorRepo.findById(id);
      //     if (author) {
      //       author.profileids = author.profileids.filter(profileId => profileId != profile._id);
      //       await AuthorRepo.update(id, author);
      //     }
      //   }
      // }

      res.json(
        new Response({
          code: 200,
          doc: profile,
        })
      );
    } else {
      res.json(
        new Response({
          code: 404,
          message: messages.PROFILE_NOT_FOUND,
        })
      );
    }
  } catch (err) {
    req.log.error(messages.ERROR_DELETE_PROFILE);
    next(err);
  }
};
