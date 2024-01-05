import {query} from 'express'
import {PrismaClient, Prisma} from '../../lib/index.js'

const prisma = new PrismaClient()

export const findAll = async (userId, query, fromRecord, pageSize, sortBy, desc) => {
  let conditions = []

  // if (userId) {
  //   conditions.push(Prisma.sql`userId = ${userId}`)
  // }
  // if (type) {
  //   conditions.push(Prisma.sql`type = ${type}`)
  // }
  // if (fromDate) {
  //   conditions.push(Prisma.sql`"createdAt" >= ${new Date(fromDate)}`)
  // }
  // if (toDate) {
  //   conditions.push(Prisma.sql`"createdAt" <= ${new Date(toDate)}`)
  // }

  // const where = conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty
  const notifications = await prisma.notifications.findMany({
    where: {
      ...(userId ? {id: userId} : {}),
      ...(query?.type ? {id: {in: query?.type.split(',')}} : {}),
      ...(query?.fromDate
        ? {
            postedAt: {
              gte: new Date(query?.fromDate),
            },
          }
        : {}),
      ...(query?.toDate
        ? {
            postedAt: {
              lte: new Date(query?.toDate),
            },
          }
        : {}),
    },
    skip: fromRecord,
    take: pageSize,
    orderBy: [{[sortBy]: desc}],
  })
  // const notifications = await prisma.$queryRaw`
  //   SELECT
  //     n.id,
  //     n."userId",
  //     n.type,
  //     u.name as "userName",
  //     u.email as "userEmail",
  //     u.roles as "userRoles",
  //     n."notifycationContent",
  //     n."contentIds",
  //     n.seen,
  //     n."createdAt",
  //     n."updatedAt"
  //   FROM (
  //     SELECT *
  //     FROM SMCC.notifications
  //     ${where}
  //     ORDER BY ${Prisma.raw('"' + sortBy + '"' + ' ' + desc)}
  //     OFFSET ${fromRecord} LIMIT ${pageSize}
  //   ) n INNER JOIN SMCC.users u ON n."userId" = u.id;
  // `

  // const total = await prisma.$queryRaw`
  //     SELECT
  //     COUNT(*)
  //     FROM SMCC.notifications
  //     ${where};
  //   `
  const total = await prisma.notifications.count({
    where: {
      ...(userId ? {id: userId} : {}),
      ...(query?.type ? {id: {in: query?.type.split(',')}} : {}),
      ...(query?.fromDate
        ? {
            postedAt: {
              gte: new Date(query?.fromDate),
            },
          }
        : {}),
      ...(query?.toDate
        ? {
            postedAt: {
              lte: new Date(query?.toDate),
            },
          }
        : {}),
    },
  })

  return notifications && notifications.length ? {docs: [notifications], total: total} : {docs: [], total: 0}
}

export const add = async (notifications) => {
  let saved
  try {
    let newData = {}
    for (const e in notifications) {
      newData[e] = notifications[e]
    }
    saved = await prisma.notifications.create({
      data: newData,
    })
  } catch (error) {
    console.log('Error when add notifications', error)
  }
  // const saved = await prisma.$queryRaw`
  //   INSERT INTO SMCC."notifications"(
  //     type,
  //     "userId",
  //     "notifycationContent",
  //     "contentIds"
  //   )
  //   VALUES (
  //     ${notifications.type},
  //     ${notifications.userId},
  //     ${notifications.notifycationContent},
  //     ${notifications.contentIds}
  //   )
  //   RETURNING *;
  // `;

  return saved ? [saved] : null
}

export const update = async (id, notification) => {
  let updated
  try {
    let updatedField = {}
    for (const e in notification) {
      updatedField[e] = notification[e]
    }
    updatedField.updatedAt = new Date()
    updated = await prisma.notifications.update({
      where: {
        id: id,
      },
      data: updatedField,
    })
  } catch (error) {
    console.log('Error when update notification:', error)
  }
  // const updated = await prisma.$queryRaw`
  //     UPDATE SMCC.notifications
  //     SET name        = ${notification.seen},
  //         "updatedAt" = ${notification.updatedAt ? new Date(notification.updatedAt) : new Date()}
  //     WHERE id        = ${id}
  //     RETURNING *;
  // `;

  return updated ? [updated] : null
}

export const remove = async (id) => {
  let notifications
  try {
    notifications = await prisma.notifications.delete({
      where: {
        id: id,
      },
    })
  } catch (error) {
    console.log('Error when delete notifications', error)
  }
  // const notifications = await prisma.$queryRaw`
  //   DELETE
  //   FROM SMCC.notifications
  //   WHERE id = ${id}
  //   RETURNING *;
  // `;

  return notifications ? [notifications] : null
}
