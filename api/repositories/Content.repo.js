import { Prisma } from "../../lib/index.js"
import { PrismaClient } from "@prisma/client"
import { findByContentId } from "./Comment.repo.js"
import * as TopicRepo from "./Topic.repo.js"
import * as TagRepo from "./Tag.repo.js"
import * as ProfileRepo from "./Profile.repo.js"
import * as Category from "./Category.repo.js"
import { updateHandledTelegramMessage, deleteTelegramMessage } from "../util/Notify.js"
import checkTextSimilarity from "libts/lib/textSimilarity/index.js"
const prisma = new PrismaClient()

export const findAll = async (query, fromRecord, pageSize, sortBy, desc) => {
  let contentsResult

  const fieldSearch = ["link", "textContent", "title"]
  const arrSearch = []
  if (query.search) {
    fieldSearch.forEach((e) => {
      // Bỏ cái này vì nó nặng quá load lâu, search đơn giản thôi
      // arrSearch.push({
      //   [e]: {
      //     search: query?.search.split(' ').join(' & '),
      //   },
      // })
      arrSearch.push({
        [e]: {
          contains: query?.search,
          mode: "insensitive",
        },
      })
    })
  }

  try {
    const whereCondition = {
      ...(query?.search
        ? {
          OR: arrSearch,
        }
        : {}),
      ...(query?.contentIds ? { id: { in: query?.contentIds.split(",") } } : {}),
      ...(query?.tagIds ? { tagIds: { hasSome: query?.tagIds.split(",") } } : {}),
      ...(query?.profileIds ? { profileIds: { hasSome: query?.profileIds.split(",") } } : {}),
      ...(query?.topicIds ? { topicIds: { hasSome: query?.topicIds.split(",") } } : {}),
      ...(query?.authorId ? { authorId: { in: query?.authorId.split(",") } } : {}),
      ...(query?.sourceId ? { sourceId: { in: query?.sourceId.split(",") } } : {}),
      ...(query?.categoryId ? {
        source: {
          category: {
            id: { in: query?.categoryId.split(",") }
          }
        }
      } : {}),
      ...(query?.type ? { type: { in: query?.type.split(",") } } : {}),
      ...(query?.fromDate && query?.toDate
        ? {
          postedAt: {
            gte: new Date(query?.fromDate),
            lte: new Date(query?.toDate),
          },
        }
        : {}),
      ...(query?.fromDate && !query?.toDate
        ? {
          postedAt: {
            gte: new Date(query?.fromDate),
          },
        }
        : {}),
      ...(!query?.fromDate && query?.toDate
        ? {
          postedAt: {
            lte: new Date(query?.toDate),
          },
        }
        : {}),
      ...(query?.process ? { process: eval(query?.process) } : {}),
      ...(query?.userHandle ? { userHandle: { in: query?.userHandle.split(",") } } : {}),
    }
    contentsResult = await prisma.$transaction([
      prisma.contents.count({
        where: whereCondition,
      }),
      prisma.contents.findMany({
        where: whereCondition,
        skip: fromRecord,
        take: pageSize,
        orderBy: [{ [sortBy]: desc }],
        include: {
          sources: {
            select: {
              id: true,
              name: true,
              link: true,
              avatar: true,
              type: true,
              status: true,
              isQuality: true,
              metaInfo: true,
              categoryId: true,
            },
          },
          authors_authorsTocontents_authorId: {
            select: {
              id: true,
              name: true,
              link: true,
              avatar: true,
            },
          },
        },
      }),
    ])
  } catch (error) {
    console.log("Error when get content from db", error)
  }

  // const contents = await prisma.$queryRaw`
  //     SELECT
  //         c.id,
  //         c."sourceId",
  //         s.name as "sourceName",
  //         s.link as "sourceLink",
  //         s.avatar as "sourceAvatar",
  //         s.type as "sourceType",
  //         s.status as "sourceStatus",
  //         c."authorId",
  //         a.name as "authorName",
  //         a.link as "authorLink",
  //         a.avatar as "authorAvatar",
  //         c."topicIds",
  //         c.link,
  //         c.type,
  //         c."textContent",
  //         c."editedTextContent",
  //         c."tagIds",
  //         c."imageContents",
  //         c."videoContents",
  //         c.likes,
  //         c.shares,
  //         c.comments as "commentCount",
  //         c."totalReactions",
  //         c."reactionsPerHour",
  //         c."commentIds",
  //         c.status,
  //         c."postedAt",
  //         c."process",
  //         c."userHandle",
  //         c."tagIds",
  //         c."profileIds",
  //         c."violationContent",
  //         c."violationEnactment",
  //         c.title,
  //         c."screenShot",
  //         c."meta",
  //         c."renderedContent",
  //         c."createdAt",
  //         c."updatedAt"
  //     FROM SMCC.contents c LEFT JOIN SMCC.authors a ON c."authorId" = a.id LEFT JOIN SMCC.sources s ON c."sourceId" = s.id
  //     ${where}
  //     ORDER BY ${Prisma.raw('c."' + sortBy + '"' + ' ' + desc)}
  //     OFFSET ${fromRecord} LIMIT ${pageSize};
  //   `
  // const total = await prisma.$queryRaw`
  //     SELECT
  //         COUNT(*)
  //     FROM SMCC.contents c
  //     ${where};
  //   `
  if (contentsResult.length > 1 && contentsResult[1].length > 0) {
    const nomContents = []
    for (const content of contentsResult[1]) {
      const normalizeResult = await normalizeContentInfo(content)

      if (normalizeResult) {
        nomContents.push(normalizeResult)
      }
    }
    return { docs: nomContents, total: contentsResult[0] }
  }
  return { docs: [], total: 0 }
}
// export const getFilterByCluster = async (ids) => {
//   let param = '';
//   if(ids == "cluster1"){
//     param = "'--J-0PrbN0g', '--KtTIz3pY4', '--_1_LwIgpA'"
//   }
//   const contents = await prisma.$queryRaw`
//     SELECT *
//     FROM SMCC.contents
//     WHERE "id" in (${param});
//   `
//   return contents && contents.length ? { docs: contents, total: contents.length } : { docs: [], total: 0 }
// }
export const findById = async (id) => {
  // const contents = await prisma.$queryRaw`
  //   SELECT
  //       c.id,
  //       c."sourceId",
  //       s.name as "sourceName",
  //       s.link as "sourceLink",
  //       s.avatar as "sourceAvatar",
  //       s.type as "sourceType",
  //       s.status as "sourceStatus",
  //       c."authorId",
  //       a.name as "authorName",
  //       a.link as "authorLink",
  //       a.avatar as "authorAvatar",
  //       c."topicIds",
  //       c.link,
  //       c.type,
  //       c."textContent",
  //       c."editedTextContent",
  //       c."tagIds",
  //       c."imageContents",
  //       c."videoContents",
  //       c.likes,
  //       c.shares,
  //       c.comments as "commentCount",
  //       c."totalReactions",
  //       c."reactionsPerHour",
  //       c."commentIds",
  //       c.status,
  //       c."postedAt",
  //       c."process",
  //       c."userHandle"
  //       c."tagIds",
  //       c."profileIds",
  //       c."violationContent",
  //       c."violationEnactment",
  //       c.title,
  //       c."screenShot",
  //       c.meta,
  //       c."renderedContent",
  //       c."createdAt",
  //       c."updatedAt"
  //   FROM SMCC.contents c LEFT JOIN SMCC.authors a ON c."authorId" = a.id LEFT JOIN SMCC.sources s ON c."sourceId" = s.id
  //   WHERE c.id = ${id};
  // `
  let content
  try {
    content = await prisma.contents.findUnique({
      where: {
        id: id,
      },
      include: {
        sources: {
          select: {
            id: true,
            name: true,
            link: true,
            avatar: true,
            type: true,
            status: true,
            categoryId: true,
          },
        },
        authors_authorsTocontents_authorId: {
          select: {
            id: true,
            name: true,
            link: true,
            avatar: true,
          },
        },
      },
    })
  } catch (error) {
    console.log("Error when get a content from db", error)
  }
  if (content) {
    return normalizeContentInfo(content)
  }
  return null
}

export const findByIds = async (ids) => {
  const contents = await prisma.$queryRaw`
    SELECT *
    FROM SMCC.contents
    WHERE id = ANY(${ids});
  `

  const total = await prisma.$queryRaw`
    SELECT 
      COUNT(*)
    FROM SMCC.contents
    WHERE id = ANY(${ids});
  `

  return contents && contents.length ? { docs: contents, total: total[0].count } : { docs: [], total: 0 }
}

export const findTotalSourceHaveNewContent = async () => {
  const totalFacebookSource = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT "sourceId") FROM SMCC.contents WHERE type = 'FB_POST' AND DATE("createdAt") = CURRENT_DATE
  `
  const totalWebsiteSource = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT "sourceId") FROM SMCC.contents WHERE type = 'WEBSITE_POST' AND DATE("createdAt") = CURRENT_DATE
  `
  return {
    totalFacebookSource: totalFacebookSource[0] ? totalFacebookSource[0].count : 0,
    totalWebsiteSource: totalWebsiteSource[0] ? totalWebsiteSource[0].count : 0,
  }
}
export const getOutstanding = async (type) => {
  const list100 = await prisma.contents.findMany({
    where: { ...(type ? { type: type } : {}) },

    orderBy: {
      postedAt: "desc",
    },
    take: 100,
  })
  const postPayload = list100.map((e) => ({ id: e.id, text: e.textContent }))

  const data = await checkTextSimilarity(postPayload)
  const listId = Object.values(data).map((e) => e[0])
  const result = await prisma.contents.findMany({
    where: {
      id: { in: listId },
    },
    orderBy: {
      postedAt: "desc",
    },
  })
  return result
}
export const update = async (id, teleId, content) => {
  let updated
  try {
    let updatedField = {}
    for (const e in content) {
      updatedField[e] = content[e]
    }
    updatedField.updatedAt = new Date()
    if (id) {
      updated = await prisma.contents.update({
        where: {
          id: id,
        },
        data: updatedField,
      })
      if (content?.userHandle === "skippedPost") {
        try {
          await deleteTelegramMessage(updated.idTeleGroup)
        } catch (error) { }
      } else if (content?.userHandle === "handledPost") {
        try {
          await updateHandledTelegramMessage(updated.idTeleGroup)
        } catch (error) { }
      }
    } else if (teleId) {
      updated = await prisma.contents.update({
        where: {
          idTeleGroup: teleId,
        },
        data: updatedField,
      })
    }
  } catch (error) {
    console.log("Error when update content:", error)
  }

  // const updated = await prisma.$queryRawUnsafe`
  //   UPDATE SMCC.contents
  //   SET "tagIds"             = ${content.tagIds},
  //       "topicIds"           = ${content.topicIds},
  //       "profileIds"         = ${content.profileIds},
  //       "editedTextContent"  = ${content.editedTextContent},
  //       ${content.title?'"title"= :content.title,':''}
  //       "violationContent"   = ${content.violationContent},
  //       "violationEnactment" = ${content.violationEnactment},
  //       "screenShot"         = ${content.screenShot},
  //       "process"         = ${content.process},
  //       meta                 = ${content.meta},
  //       "updatedAt"          = ${content.updatedAt ? new Date(content.updatedAt) : new Date()}
  //   WHERE id                 = ${id}
  //   RETURNING *;
  // `;

  return updated ? [updated] : null
}
export const updateMultil = async (ids, userHandleType) => {
  const contents = await prisma.contents.updateMany({
    where: {
      id: { in: ids },
    },
    data: {
      userHandle: userHandleType,
      ...(userHandleType === "handledPost" && {
        violationEnactment:
          "Vi phạm điểm a, d, e khoản 1, Điều 5 Nghị định 72/2013/NĐ-CP ngày 15/7/2013 của Chính phủ về quản lý, cung cấp, sử dụng dịch vụ Internet và thông tin trên mạng.",
      }),
    },
  })
  if (userHandleType == "skippedPost") {
    await Promise.all(
      contents.map(async (content) => {
        if (content.idTeleGroup) {
          await deleteTelegramMessage(content.idTeleGroup)
        }
      }),
    )
  }

  return contents || []
}
export const remove = async (id) => {
  let deleted
  try {
    deleted = await prisma.contents.delete({
      where: {
        id: id,
      },
    })
  } catch (error) {
    console.log("Error when delete contents", error)
  }
  // const deleted = await prisma.$queryRaw `
  //   DELETE
  //   FROM SMCC."contents"
  //   WHERE id = ${id}
  //   RETURNING *;
  // `;

  return deleted ? [deleted] : null
}

const normalizeContentInfo = async (content) => {
  // Get comments of content
  const comments = await findByContentId(content.id)

  // Get topics info
  const topicsInfo = []
  for (const id of content.topicIds) {
    const topic = await TopicRepo.findById(id)
    if (topic) {
      topicsInfo.push(topic)
    }
  }

  // If this content is not in topic, remove it
  if (!topicsInfo.length) {
    await remove(content.id).catch((err) => console.log("Error delete content"))

    return null
  }

  // Get tags info
  const tagsResult = await TagRepo.findByIds(content.tagIds)

  if (content.tagIds && tagsResult.docs.length != content.tagIds.length) {
    content.tagIds = tagsResult.docs.map((t) => t.id)

    await update(content.id, content)
  }

  // Get profiles info
  const profilesResult = await ProfileRepo.findByIds(content.profileIds)

  if (content.profileIds && profilesResult.docs.length != content.profileIds.length) {
    content.profileIds = profilesResult.docs.map((p) => p.id)

    await update(content.id, content)
  }
  const category = await Category.findById(content.sources.categoryId);
  return {
    id: content.id,
    sourceInfo: {
      id: content.sourceId,
      name: content.sources?.name,
      link: content.sources?.link,
      avatar: content.sources?.avatar,
      type: content.sources?.type,
      status: content.sources?.status,
      isQuality: content.sources?.isQuality,
      metaInfo: content.sources?.metaInfo,
      category: category
    },
    authorInfo: {
      id: content.authorId,
      name: content.authors_authorsTocontents_authorId?.name,
      link: content.authors_authorsTocontents_authorId?.link,
      avatar: content.authors_authorsTocontents_authorId?.avatar,
    },
    topicsInfo: topicsInfo,
    link: content.link,
    type: content.type,
    category: content.category,
    textContent: content.textContent,
    imageContents: content.imageContents,
    videoContents: content.videoContents,
    likes: content.likes,
    shares: content.shares,
    views: content.views,
    commentCount: content.commentCount,
    commentInfos: comments || [],
    totalReactions: content.totalReactions,
    reactionsPerHour: content.reactionsPerHour,
    status: content.status,
    postedAt: content.postedAt,
    process: content.process,
    userHandle: content.userHandle,
    blockRequire: content.blockRequire,
    viettelBlocked: content.viettelBlocked,
    fptBlocked: content.fptBlocked,
    idTeleGroup: content.idTeleGroup,
    vnptBlocked: content.vnptBlocked,
    editedTextContent: content.editedTextContent,
    violationContent: content.violationContent,
    violationEnactment: content.violationEnactment,
    tagsInfo: tagsResult.docs || [],
    profilesInfo: profilesResult.docs || [],
    title: content.title,
    screenShot: content.screenShot,
    meta: content.meta,
    metaInfo: content.metaInfo,
    violationTimes: content.violationTimes,
    renderedContent: content.renderedContent,
    createdAt: content.createdAt,
    updatedAt: content.updatedAt,
  }
}

export const countContentPerDay = async () => {
  const today = (new Date()).getDate()
  const rs = [];
  for (let i = 59; i >= 0; i--) {
    const ii = i.toString()
    const totalPerDay = await prisma.$queryRaw`
      select Count(*) from smcc.contents where DATE("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE '+7') = (CURRENT_DATE - ${i}::INTEGER)
      `
    //const totalPerDay = await prisma.$queryRaw`SELECT COUNT(DISTINCT "sourceId") FROM SMCC.contents WHERE type = 'WEBSITE_POST' AND DATE("createdAt") = CURRENT_DATE`
    console.log(totalPerDay)
    rs.push({
      date: new Date(new Date().setDate(new Date().getDate() - i)).toLocaleString('en-GB').split(",")[0],
      total: totalPerDay[0].count
    })
  }
  return rs
}

export const countContentForSourcePerDay = async (sourceId) => {
  if (!sourceId) {
    sourceId = 'e6eb122a-1dff-41d3-ae85-25a0f08d7ce4'
  }
  const today = (new Date()).getDate()
  const rs = [];
  for (let i = 0; i < today; i++) {
    const ii = i.toString()
    const totalPerDay = await prisma.$queryRaw`
    SELECT
      s."id" AS sourceId,
	  s."link" AS sourceLink,
      s."name" AS sourceName,
      DATE(c."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE '+7'),
      COUNT(c."id") AS totalContentsPerDay 
    FROM
      smcc.sources s
    JOIN
      smcc.contents c ON s."id" = c."sourceId"
    where DATE(c."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE '+7') = (CURRENT_DATE - ${i}::INTEGER) GROUP BY
      s."id",
	  s."link",
      s."name",
      DATE(c."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE '+7')
    ORDER BY
	    totalContentsPerDay desc,
        s."link",
        DATE(c."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE '+7')
      
      `
    //const totalPerDay = await prisma.$queryRaw`SELECT COUNT(DISTINCT "sourceId") FROM SMCC.contents WHERE type = 'WEBSITE_POST' AND DATE("createdAt") = CURRENT_DATE`
    //  console.log(totalPerDay)
    rs.push({
      date: new Date(new Date().setDate(new Date().getDate() - i)).toLocaleString('en-GB').split(",")[0],
      total: totalPerDay
    })
  }
  const rss = filterAndFormatBySourceId(rs, sourceId);
  return rss
}
export const countContentForTopicPerDay = async (topicId) => {
  let filter = '';
  if (!topicId) {
    topicId = '429b7e93-6574-4fc9-9279-5d92b6dec7d1'
  }
  const today = (new Date()).getDate()
  const rs = [];
  for (let i = 0; i < today; i++) {
    const ii = i.toString()
    const totalPerDay = await prisma.$queryRaw`
    SELECT
      t."id" AS topicId,
	  t."name" AS topicName,
      t."keywords" AS keywords,
      DATE(c."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE '+7'),
      COUNT(c."id") AS totalContentsPerTopic 
    FROM
      smcc.topics t
    JOIN
      smcc."_TopicsOnContents" toc 
	  ON t."id" = toc."topicId"
	JOIN smcc.contents c
      ON c."id" = toc."contentId"
    where DATE(c."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE '+7') = (CURRENT_DATE - ${i}::INTEGER) GROUP BY
      t."id",
      t."name",
      DATE(c."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE '+7')
    ORDER BY
	    totalContentsPerTopic desc,
        t."name",
        DATE(c."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE '+7')
      `
    //const totalPerDay = await prisma.$queryRaw`SELECT COUNT(DISTINCT "sourceId") FROM SMCC.contents WHERE type = 'WEBSITE_POST' AND DATE("createdAt") = CURRENT_DATE`
    //  console.log(totalPerDay)
    rs.push({
      date: new Date(new Date().setDate(new Date().getDate() - i)).toLocaleString('en-GB').split(",")[0],
      total: totalPerDay
    })
  }
  const rss = filterAndFormatByTopicId(rs, topicId)
  return rss
}
export const getStatistics = async (tid, sid, cid, start, end) => {
  const conditions = [];
  if (tid) {
    conditions.push(Prisma.sql` t."id" = ${tid} `)
  }
  if (sid) {
    conditions.push(Prisma.sql` s."id" = ${sid} `)
  }
  if (cid) {
    conditions.push(Prisma.sql` cate."id" = ${cid} `)
  }
  if (start) {
    conditions.push(Prisma.sql`c."createdAt" >= ${new Date(start)}`);
  }
  if (end) {
    conditions.push(Prisma.sql`c."createdAt" <= ${new Date(end)}`);
  }
  const where = conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty;
  console.log(where)
  const totalPerDay = await prisma.$queryRaw`
  SELECT
  t."id" AS topicId,
t."name" AS topicName,
s."id" AS sourceId,
s."name" AS sourceName,
s."link" AS sourceLink,
cate."id" AS categoryId,
cate."name" categoryName,
  DATE(c."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE '+7'),
  COUNT(c."id") AS totalContentsPerTopic 
FROM
  smcc.topics t
JOIN
  smcc."_TopicsOnContents" toc 
ON t."id" = toc."topicId"
JOIN smcc.contents c
  ON c."id" = toc."contentId"
JOIN smcc.sources s
ON s."id" = c."sourceId" 
JOIN smcc.categories cate ON  cate.id = s."categoryId" 
     ${where}   
     GROUP BY
     t."id",
     t."name",
   s."id",
 cate."id",
     DATE(c."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE '+7')
   ORDER BY
   DATE(c."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE '+7'),
     totalContentsPerTopic desc,
     t."name"  
        `
  //const totalPerDay = await prisma.$queryRaw`SELECT COUNT(DISTINCT "sourceId") FROM SMCC.contents WHERE type = 'WEBSITE_POST' AND DATE("createdAt") = CURRENT_DATE`
  //  console.log(totalPerDay)
  const rs = calculateTotalPerDay(totalPerDay)
  const rss = fillMissingDatesWithZero(rs);
  return rss;
}
export const getStatBySource = async (start, end) => {
  const conditions = [];
  if (start) {
    conditions.push(Prisma.sql`c."createdAt" >= ${new Date(start)}`);
  }
  if (end) {
    conditions.push(Prisma.sql`c."createdAt" <= ${new Date(end)}`);
  }
  const where = conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty;
  console.log(where)
  const total = await prisma.$queryRaw`SELECT
  s."id" AS sourceId,
  s."name" AS sourceName,
  s."link" AS sourceLink,
    COUNT(c."id") AS totalContentsPerTopic 
From smcc.contents c
JOIN smcc.sources s
  ON s."id" = c."sourceId" 
${where} 
GROUP BY
  s."id"       
  ORDER BY
    totalContentsPerTopic desc`;
  return total;
}

export const getStatByCategory = async (start, end) => {
  const conditions = [];
  if (start) {
    conditions.push(Prisma.sql`c."createdAt" >= ${new Date(start)}`);
  }
  if (end) {
    conditions.push(Prisma.sql`c."createdAt" <= ${new Date(end)}`);
  }
  const where = conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty;
  console.log(where)
  const total = await prisma.$queryRaw`SELECT
  cate."name",
    COUNT(c."id") AS totalContentsPerTopic 
From smcc.contents c
JOIN smcc.sources s
  ON s."id" = c."sourceId" 
JOIN smcc.categories cate 
  ON cate.id = s."categoryId"
${where} 
GROUP BY
  cate."name"      
  ORDER BY
    totalContentsPerTopic desc`;
  return total;
}

export const getStatByTopic = async (start, end) => {
  const conditions = [];
  if (start) {
    conditions.push(Prisma.sql`c."createdAt" >= ${new Date(start)}`);
  }
  if (end) {
    conditions.push(Prisma.sql`c."createdAt" <= ${new Date(end)}`);
  }
  const where = conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty;
  console.log(where)
  const total = await prisma.$queryRaw`SELECT
  t."id" AS topicId,
t."name" AS topicName,
  COUNT(c."id") AS totalContentsPerTopic 
FROM
  smcc.topics t
JOIN
  smcc."_TopicsOnContents" toc 
ON t."id" = toc."topicId"
JOIN smcc.contents c
  ON c."id" = toc."contentId"
  ${where}
GROUP BY
  t."id",
  t."name"
ORDER BY
  totalContentsPerTopic desc,
  t."name"`;
  return total;
}



const filterBySourceId = (arr, sourceId) => {
  const result = [];

  for (const item of arr) {
    const filteredTotal = item.total.filter(totalItem => totalItem.sourceid === sourceId);

    if (filteredTotal.length > 0) {
      const filteredItem = {
        date: item.date,
        total: filteredTotal
      };
      result.push(filteredItem);
    }
  }

  return result;
};

const filterByTopicId = (arr, topicId) => {
  const result = [];

  for (const item of arr) {
    const filteredTotal = item.total.filter(totalItem => totalItem.topicid === topicId);

    if (filteredTotal.length > 0) {
      const filteredItem = {
        date: item.date,
        total: filteredTotal
      };
      result.push(filteredItem);
    }
  }

  return result;
};

const filterAndFormatBySourceId = (arr, sourceId) => {
  const result = [];

  for (const item of arr) {
    const filteredTotal = item.total.find(totalItem => totalItem.sourceid === sourceId);

    if (filteredTotal) {
      const formattedItem = {
        date: item.date,
        sourceid: filteredTotal.sourceid,
        total: filteredTotal.totalcontentsperday,
        sourcelink: filteredTotal.sourcelink,
        sourcename: filteredTotal.sourcename,
        totalcontentsperday: filteredTotal.totalcontentsperday
      };
      result.push(formattedItem);
    }
  }

  return result;
};

const filterAndFormatByTopicId = (arr, topicId) => {
  const result = [];

  for (const item of arr) {
    const filteredTotal = item.total.find(totalItem => totalItem.topicid === topicId);

    if (filteredTotal) {
      const formattedItem = {
        date: item.date,
        topicid: filteredTotal.topicid,
        total: filteredTotal.totalcontentspertopic,
        keywords: filteredTotal.keywords,
        topicname: filteredTotal.topicname,
      };
      result.push(formattedItem);
    }
  }

  return result;
};


function calculateTotalPerDay(data) {
  const totalsPerDay = {};

  data.forEach((item) => {
    const date = item.date;
    const total = item.totalcontentspertopic;

    if (totalsPerDay[date]) {
      totalsPerDay[date] += total;
    } else {
      totalsPerDay[date] = total;
    }
  });

  // Convert the totalsPerDay object into an array of objects
  const result = Object.keys(totalsPerDay).map((date) => ({
    date,
    total: totalsPerDay[date],
  }));

  return result;
}


function fillMissingDatesWithZero(arr) {
  // Extract all unique date strings from the original array
  const uniqueDates = [...new Set(arr.map(item => item.date))];

  // Convert date strings to Date objects
  const dateObjects = uniqueDates.map(dateStr => new Date(dateStr));

  // Find the date range
  const minDate = new Date(Math.min(...dateObjects));
  const maxDate = new Date(Math.max(...dateObjects));

  // Generate an array of all dates within the range
  const allDates = [];
  for (let currentDate = minDate; currentDate <= maxDate; currentDate.setDate(currentDate.getDate() + 1)) {
    allDates.push(new Date(currentDate));
  }

  // Create a new array filling in missing dates with total = 0
  const finalArr = allDates.map(date => {
    const dateStr = date.toISOString().split('T')[0];
    const totalObj = arr.find(item => item.date === dateStr);
    const total = totalObj ? totalObj.total : 0;
    return { date: dateStr, total: total };
  });

  return finalArr;
}