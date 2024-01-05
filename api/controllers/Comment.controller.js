import * as CommentRepo from "../repositories/Comment.repo.js";
import { PagedResponse } from "../util/Response.js";
import * as messages from "../config/messages.js";

export const getCommentsOfContent = async (req, res, next) => {
    try {
        const comments = await CommentRepo.findByContentId(
            req.params.contentId
        );
        res.json(
            new PagedResponse({
                code: 200,
                total: comments.length,
                docs: comments
            })
        );
    } catch (err) {
        req.log.error(messages.ERROR_GET_COMMENTS_OF_CONTENT);
        next(err);
    }
};
