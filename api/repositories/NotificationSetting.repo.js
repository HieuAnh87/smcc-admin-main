import {PrismaClient, Prisma} from '../../lib/index.js'

const prisma = new PrismaClient()

export const findAll = async (userId) => {
  // const result = await prisma.$queryRaw`
  //   SELECT *
  //   FROM SMCC."settingNotify"
  //   WHERE "userId" = ${userId}
  // `;

  let result
  try {
    result = await prisma.settingNotify.findUnique({
      where: {
        userId: userId,
      },
    } )

  } catch ( error )
  {
    console.log('Error when get notification settings', error)
  }
  return result ? result : null
}

export const add = async (setting) => {
  let saved
  try {
    let newData = {}
    for (const e in setting) {
      newData[e] = setting[e]
    }
    saved = await prisma.settingNotify.create({
      data: newData,
    })
  } catch (error) {
    console.log('Error when add settingNotify', error)
  }
  //   const saved = await prisma.$queryRaw`
  //     INSERT INTO SMCC."settingNotify"(
  //       "userId"
  //     )
  //     VALUES (
  //       ${setting.userId}
  //     )
  //     RETURNING *;
  //   `;

  return saved ? [saved] : null
}

export const update = async (id, setting) => {
  let updated
  try {
    let updatedField = {}
    for (const e in setting) {
      updatedField[e] = setting[e]
    }
    updatedField.updatedAt = new Date()
    updated = await prisma.settingNotify.update({
      where: {
        id: id,
      },
      data: updatedField,
    })
  } catch (error) {
    console.log('Error when update setting:', error)
  }
  // const updated = await prisma.$queryRaw`
  //     UPDATE SMCC."settingNotify"
  //     SET telegram                     = ${setting.telegram},
  //         email                        = ${setting.email},
  //         webapp                       = ${setting.webapp},
  //         "totalContentOnNotification" = ${setting.totalContentOnNotification},
  //         "notifyInWorkTime"           = ${setting.notifyInWorkTime},
  //         "updatedAt"                  = ${setting.updatedAt ? new Date(setting.updatedAt) : new Date()}
  //     WHERE id      = ${id}
  //     RETURNING *;
  // `;

  return updated ? [updated] : null
}
