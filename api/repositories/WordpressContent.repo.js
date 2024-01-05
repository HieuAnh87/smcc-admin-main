import {PrismaClient, Prisma} from '../../lib/index.js'

const prisma = new PrismaClient()

export const findAll = async (title, authorId, fromDate, toDate, fromRecord, pageSize, sortBy, desc) => {
  const conditions = []

  if (title) {
    conditions.push(Prisma.sql`LOWER(title) LIKE '%' || ${title.toLowerCase()} || '%'`)
  }
  if (authorId) {
    conditions.push(Prisma.sql`"authorId" = ${authorId}`)
  }
  if (fromDate) {
    conditions.push(Prisma.sql`"createdAt" >= ${new Date(fromDate)}`)
  }
  if (toDate) {
    conditions.push(Prisma.sql`"createdAt" <= ${new Date(toDate)}`)
  }

  const where = conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty
  const results = await prisma.$queryRaw`
    SELECT
      w.id,
      w.title,
      w.image,
      w.content,
      w."targetUrl",
      w."detailInfor",
      w."authorId",
      a.name as "authorName",
      a.avatar as "authorAvatar",
      a.link as "authorLink",
      w.url
    FROM (
      SELECT *
      FROM SMCC."wordpressContents"
      ${where}
      ORDER BY ${Prisma.raw('"' + sortBy + '"' + ' ' + desc)}
      OFFSET ${fromRecord} LIMIT ${pageSize}
    ) w LEFT JOIN SMCC.authors a ON w."authorId" = a.id;
  `

  const total = await prisma.$queryRaw`
    SELECT 
      COUNT(*)
    FROM SMCC."wordpressContents"
    ${where};
  `

  return results && results.length ? {docs: results, total: total[0].count} : {docs: [], total: 0}
}

export const findBySlug = async (slug) => {
  let result
  try {
    result = await prisma.wordpressContents.findUnique({
      where: {
        url: slug,
      },
    })
  } catch (error) {
    console.log('Error when get slug from wordpressContent ', error)
  }
  return result
}

export const add = async (content) => {
  let saved

  try {
    let newData = {}
    for (const e in content) {
      newData[e] = content[e]
    }
    saved = await prisma.wordpressContents.create({
      data: newData,
    })
  } catch (error) {
    console.log('Error when add content', error)
  }
  // const saved = await prisma.$queryRaw`
  //   INSERT INTO SMCC."wordpressContents"(
  //     title,
  //     image,
  //     content,
  //     "authorId"
  //   )
  //   VALUES (
  //     ${content.title},
  //     ${content.image},
  //     ${content.content},
  //     ${content.authorId}
  //   )
  //   RETURNING *;
  // `;

  return saved ? [saved] : null
}

export const update = async (id, content) => {
  let updated
  try {
    let updatedField = {}
    for (const e in content) {
      updatedField[e] = content[e]
    }
    updatedField.updatedAt = new Date()
    updated = await prisma.wordpressContents.update({
      where: {
        id: id,
      },
      data: updatedField,
    })
  } catch (error) {
    console.log('Error when update wordpressContents:', error)
  }
  // const updated = await prisma.$queryRaw`
  //     UPDATE SMCC."wordpressContents"
  //     SET title       = ${content.title},
  //         image       = ${content.image},
  //         content     = ${content.content},
  //         "authorId"  = ${content.authorId},
  //         "updatedAt" = ${content.updatedAt ? new Date(content.updatedAt) : new Date()}
  //     WHERE id        = ${id}
  //     RETURNING *;
  // `;

  return updated ? [updated] : null
}

export const remove = async (id) => {
  let deleted
  try {
    deleted = await prisma.wordpressContents.delete({
      where: {
        id: id,
      },
    })
  } catch (error) {
    console.log('Error when delete wordpressContents', error)
  }
  // const deleted = await prisma.$queryRaw`
  //     DELETE
  //     FROM SMCC."wordpressContents"
  //     WHERE id = ${id}
  //     RETURNING *;
  // `;

  return deleted ? [deleted] : null
}
