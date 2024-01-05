import { PrismaClient, Prisma } from "../../lib/index.js";

const prisma = new PrismaClient();

export const findByContentId = async (contentId) => {
  let comments = await prisma.$queryRaw`
        SELECT
            c.id,
            c."authorId",
            a.name as "authorName",
            a.link as "authorLink",
            a.avatar as "authorAvatar",
            c."contentId",
            c."textContent",
            c."imageContent",
            c."videoContent",
            c.link,
            c.likes,
            c.status,
            c."postedAt",
            c."createdAt",
            c."updatedAt"
        FROM SMCC.comments c INNER JOIN SMCC.authors a ON c."authorId" = a.id
        WHERE c."contentId" = ${contentId}
    `;

  if (comments && comments.length) {
    comments = comments.map((comment) => {
      return normalizeCommentInfo(comment);
    });
    return comments;
  }
  return null;
};

const normalizeCommentInfo = (comment) => {
  return {
    id: comment.id,
    authorInfo: {
      id: comment.authorId,
      name: comment.authorName,
      link: comment.authorLink,
      avatar: comment.authorAvatar,
    },
    contentId: comment.contentId,
    textContent: comment.textContent,
    imageContent: comment.imageContent,
    videoContent: comment.videoContent,
    link: comment.link,
    likes: comment.likes,
    status: comment.status,
    postedAt: comment.postedAt,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
};
