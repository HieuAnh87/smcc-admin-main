import {PrismaClient, Prisma} from '../../lib/index.js'

const prisma = new PrismaClient()

export const findAll = async (query, fromRecord, pageSize, sortBy, desc) => {
  // const conditions = []

  // if (fromDate) {
  //   conditions.push(Prisma.sql`"createdAt" >= ${new Date(fromDate)}`)
  // }
  // if (toDate) {
  //   conditions.push(Prisma.sql`"createdAt" <= ${new Date(toDate)}`)
  // }
  // if (fromUpdatedAt) {
  //   conditions.push(Prisma.sql`"updatedAt" >= ${new Date(fromUpdatedAt)}`)
  // }
  // if (intervalSearch) {
  //   conditions.push(Prisma.sql`"intervalSearch" = ${intervalSearch}`)
  // }

  // const where = conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty
  // const topics = await prisma.$queryRaw`
  //   SELECT *
  //   FROM SMCC.topics
  //   ${where}
  //   ORDER BY ${Prisma.raw('"' + sortBy + '"' + ' ' + desc)}
  //   OFFSET ${fromRecord} LIMIT ${pageSize};
  // `

  // const total = await prisma.$queryRaw`
  //   SELECT
  //     COUNT(*)
  //   FROM SMCC.topics
  //   ${where};
  // `
  let topicsResult
  try {
    const conditions = {
      ...(query?.intervalSearch ? {id: {type: {in: query?.intervalSearch.split(',')}}} : {}),
      ...(query?.fromDate
        ? {
            createdAt: {
              gte: new Date(query?.fromDate),
            },
          }
        : {}),
      ...(query?.toDate
        ? {
            createdAt: {
              lte: new Date(query?.toDate),
            },
          }
        : {}),
      ...(query?.fromUpdatedAt
        ? {
            updatedAt: {
              gte: new Date(query?.toDate),
            },
          }
        : {}),
    }
    topicsResult = await prisma.$transaction([
      prisma.topics.count({
        where: conditions,
      }),
      prisma.topics.findMany({
        where: conditions,
        skip: fromRecord,
        take: pageSize,
        orderBy: [{[sortBy]: desc}],
      }),
    ])
  } catch (error) {
    console.log('Error when get content from db', error)
  }
  return {docs: topicsResult[1] || [], total: topicsResult[0] || 0}
}

export const findById = async (id) => {
  const topics = await prisma.$queryRaw`
    SELECT *
    FROM SMCC.topics
    WHERE id = ${id}
  `

  return topics[0] ? topics[0] : null
}

export const add = async (topic) => {
  let saved
  try {
    let newData = {}
    for (const e in topic) {
      newData[e] = topic[e]
    }
    saved = await prisma.topics.create({
      data: newData,
    })
  } catch (error) {
    console.log('Error when add topic', error)
  }
  // const saved = await prisma.$queryRaw`
  //   INSERT INTO SMCC.topics(
  //     name,
  //     keywords,
  //     "screenShot",
  //     "isActiveCrawl"
  //   )
  //   VALUES (
  //     ${topic.name},
  //     ${topic.keywords},
  //     ${topic.screenShot},
  //     ${topic.isActiveCrawl}
  //   )
  //   RETURNING *;
  // `;

  return saved ? [saved] : null
}

export const update = async (id, topic) => {
  let updated
  try {
    let updatedField = {}
    for (const e in topic) {
      updatedField[e] = topic[e]
    }
    updatedField.updatedAt = new Date()
    updated = await prisma.topics.update({
      where: {
        id: id,
      },
      data: updatedField,
    })
  } catch (error) {
    console.log('Error when update topic:', error)
  }
  // const updated = await prisma.$queryRaw`
  //     UPDATE SMCC.topics
  //     SET name            = ${topic.name},
  //         keywords        = ${topic.keywords},
  //         "screenShot"   = ${topic.screenShot},
  //         "isActiveCrawl" = ${topic.isActiveCrawl},
  //         "updatedAt"     = ${topic.updatedAt ? new Date(topic.updatedAt) : new Date()}
  //     WHERE id            = ${id}
  //     RETURNING *;
  // `;

  return updated ? [updated] : null
}

export const remove = async (id) => {
  let topic
  try {
    topic = await prisma.topics.delete({
      where: {
        id: id,
      },
    })
  } catch (error) {
    console.log('Error when delete topic', error)
  }
  // const topic = await prisma.$queryRaw`
  //     DELETE
  //     FROM SMCC.topics
  //     WHERE id = ${id}
  //     RETURNING *;
  // `;

  return topic ? [topic] : null
}
