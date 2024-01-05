import { Prisma } from "../../lib/index.js"
import { PrismaClient } from "@prisma/client"
import { findByContentId } from "./Comment.repo.js"
import * as TopicRepo from "./Topic.repo.js"
import * as TagRepo from "./Tag.repo.js"
import * as ProfileRepo from "./Profile.repo.js"
import { updateHandledTelegramMessage, deleteTelegramMessage } from "../util/Notify.js"
import checkTextSimilarity from "libts/lib/textSimilarity/index.js"
const prisma = new PrismaClient()

export const findAll = async () => {
  const rs = await prisma.$queryRaw`select * from smcc."categories"`
  //console.log(rs)
  return rs;
}

export const findById = async (id) => {
  console.log(id)
  if (!id || id == null) {
    return {};
  }
  const rs = await prisma.categories.findUnique({
    where: {
      id: id,
    }
  })
  console.log(rs)
  return rs;
}

export const add = async (campaign) => {
  let saved
  console.log(campaign)
  try {
    let newData = {}
    for (const e in campaign) {
      newData[e] = campaign[e]
    }
    saved = await prisma.categories.create({
      data: newData
    })
  } catch (error) {
    console.log("Error when add profile", error)

  }
  return saved ? [saved] : null;
};


export const update = async (id, profile) => {
  let updated
  try {
    let updatedField = {}
    for (const e in profile) {
      updatedField[e] = profile[e]
    }

    updated = await prisma.categories.update({
      where: {
        id: id
      },
      data: updatedField
    }
    )

  } catch (error) {
    console.log('Error when update profile:', error)
  }
  // const updated = await prisma.$queryRaw`
  //     UPDATE SMCC.profiles
  //     SET name         = ${profile.name},
  //         description  = ${profile.description},
  //         "sourceIds"  = ${profile.sourceIds},
  //         "authorIds"  = ${profile.authorIds},
  //         "contentIds" = ${profile.contentIds},
  //         "updatedAt"  = ${profile.updatedAt ? new Date(profile.updatedAt) : new Date()}
  //     WHERE id         = ${id}
  //     RETURNING *;
  // `;

  return updated ? [updated] : null;
};

export const remove = async (id) => {
  let account
  try {
    account = await prisma.categories.delete({
      where: {
        id: id,
      },
    })

  } catch (error) {
    console.log("Error when delete account", error)
  }
  // const account = await prisma.$queryRaw`
  //     DELETE
  //     FROM SMCC."fbAccounts"
  //     WHERE id = ${id}
  //     RETURNING *;
  // `;

  return account ? [account] : null;
};