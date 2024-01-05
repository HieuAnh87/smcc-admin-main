import { PrismaClient, Prisma } from "../../lib/index.js"
import * as TagRepo from "./Tag.repo.js"
import * as ProfileRepo from "./Profile.repo.js"

const prisma = new PrismaClient()

export const findAll = async (tagIds, profileIds, name, type, status, fromRecord, pageSize, sortBy, desc) => {
  let conditions = []

  if (tagIds) {
    tagIds = tagIds.split(",")
    conditions.push(Prisma.sql`${tagIds} && "tagIds"`)
  }
  if (profileIds) {
    profileIds = profileIds.split(",")
    conditions.push(Prisma.sql`${profileIds} && "profileIds"`)
  }
  if (name) {
    conditions.push(Prisma.sql`LOWER(name) LIKE '%' || ${name.toLowerCase()} || '%'`)
  }
  if (type) {
    conditions.push(Prisma.sql`type = ${type}`)
  }
  if (status) {
    conditions.push(Prisma.sql`status = ${status}`)
  }

  const where = conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}` : Prisma.empty

  const sources = await prisma.$queryRaw`
      SELECT *
      FROM SMCC.sources
      ${where}
      ORDER BY ${Prisma.raw('"' + sortBy + '"' + " " + desc)}
      OFFSET ${fromRecord} LIMIT ${pageSize};
    `

  // Get tags info
  for (const source of sources) {
    const tagsResult = await TagRepo.findByIds(source.tagIds)
    source.tagsInfo = tagsResult.docs

    if (source.tagIds && tagsResult.docs.length != source.tagIds.length) {
      source.tagIds = tagsResult.docs.map((t) => t.id)

      await update(source.id, source)
    }
  }

  // Get profiles info
  for (const source of sources) {
    const profilesResult = await ProfileRepo.findByIds(source.profileIds)
    source.profilesInfo = profilesResult.docs

    if (source.profileIds && profilesResult.docs.length != source.profileIds.length) {
      source.profileIds = profilesResult.docs.map((p) => p.id)

      await update(source.id, source)
    }
  }

  const total = await prisma.$queryRaw`
      SELECT 
      COUNT(*)
      FROM SMCC.sources
      ${where};
    `

  return sources && sources.length ? { docs: sources, total: total[0].count } : { docs: [], total: 0 }
}

export const findById = async (id) => {
  const sources = await prisma.$queryRaw`
    SELECT *
    FROM SMCC.sources
    WHERE id = ${id}
  `

  if (sources[0]) {
    // Get tags info
    const tagsResult = await TagRepo.findByIds(sources[0].tagIds)
    sources[0].tagsInfo = tagsResult.docs

    // Get profiles info
    const profilesResult = await ProfileRepo.findByIds(sources[0].profileIds)
    sources[0].profilesInfo = profilesResult.docs

    return sources[0]
  } else {
    return null
  }
}

export const findByIds = async (ids) => {
  const sources = await prisma.$queryRaw`
    SELECT *
    FROM SMCC.sources
    WHERE id = ANY(${ids});
  `

  const total = await prisma.$queryRaw`
    SELECT 
      COUNT(*)
    FROM SMCC.sources
    WHERE id = ANY(${ids});
  `

  return sources && sources.length ? { docs: sources, total: total[0].count } : { docs: [], total: 0 }
}

export const add = async (source) => {
  let saved
  try {
    let newData = {}
    for (const e in source) {
      newData[e] = source[e]
    }
    saved = await prisma.sources.upsert({
      where: {
        link: newData.link,
      },

      create: { ...newData, isCrawl: true },
      update: { ...newData, isCrawl: true },
    })
  } catch (error) {
    console.log("Error when add source", error)
  }
  return saved ? [saved] : null
}

export const update = async (id, source) => {
  let updated
  try {
    let updatedField = {}
    for (const e in source) {
      updatedField[e] = source[e]
    }
    updatedField.updatedAt = new Date()
    console.log(updatedField)
    updated = await prisma.sources.update({
      where: {
        id: id,
      },
      data: updatedField,
    })
  } catch (error) {
    console.log("Error when update source:", error)
  }
  // const updated = await prisma.$queryRaw`
  //   UPDATE SMCC.sources
  //   SET "tagIds"          = ${source.tagIds},
  //       "profileIds"      = ${source.profileIds},
  //       "type"            = ${source.type},
  //       "questionsToJoin" = ${source.questionsToJoin},
  //       "updatedAt"       = ${source.updatedAt ? new Date(source.updatedAt) : new Date()}
  //   WHERE id              = ${id}
  //   RETURNING *;
  //   `;

  return updated ? [updated] : null
}

export const remove = async (id) => {
  let source
  try {
    source = await prisma.sources.delete({
      where: {
        id: id,
      },
    })
  } catch (error) {
    console.log("Error when delete source", error)
  }
  // const source = await prisma.$queryRaw`
  //   DELETE
  //   FROM SMCC.sources
  //   WHERE id = ${id}
  //   RETURNING *;
  //   `;

  return source ? [source] : null
}


export const getSourceHaveLessContent = async () => {
  let today = (new Date()).toISOString().split('T')[0]
  let yesterday = (new Date(new Date().setDate(new Date().getDate() - 5))).toISOString().split('T')[0]

  const whereToday = Prisma.sql`where Date(c."createdAt")  = ${Prisma.sql`${new Date(today)}`}`
  const whereYesterday = Prisma.sql`where Date(c."createdAt")  = ${Prisma.sql`${new Date(yesterday)}`}`
  const totalToday = await prisma.$queryRaw`select s."id" AS sourceId,
  s."name" AS sourceName,
  s."link" AS sourceLink,
    COUNT(c."id") AS totalContentsPerTopic
From smcc.contents c
JOIN smcc.sources s
  ON s."id" = c."sourceId" 
${whereToday}
GROUP BY
  s."id"
  ORDER BY
    s."name"`


  const totalYesterday = await prisma.$queryRaw`select s."id" AS sourceId,
  s."name" AS sourceName,
  s."link" AS sourceLink,
    COUNT(c."id") AS totalContentsPerTopic
From smcc.contents c
JOIN smcc.sources s
  ON s."id" = c."sourceId" 
${whereYesterday}
GROUP BY
  s."id"
  ORDER BY
    s."name"`
  const increaseDecrease = calculateIncreaseDecrease(totalToday, totalYesterday);
  return increaseDecrease
}

function calculateIncreaseDecrease(today, yesterday) {
  // Create a map of yesterday's data for quick lookup
  const yesterdayData = new Map();
  yesterday.forEach(item => {
    yesterdayData.set(item.sourceid, item.totalcontentspertopic);
  });

  // Calculate increase/decrease and create a new array
  const result = today.map(item => {
    const yesterdayTotal = yesterdayData.get(item.sourceid) || 0;
    const increaseDecrease = (item.totalcontentspertopic) / (yesterdayTotal == 0 ? item.totalcontentspertopic : yesterdayTotal)
    return {
      sourceid: item.sourceid,
      sourcename: item.sourcename,
      sourcelink: item.sourcelink,
      increaseDecrease: increaseDecrease < 0.7 ? true : false,
    };
  });

  return result;
}