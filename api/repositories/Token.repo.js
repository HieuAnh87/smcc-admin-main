import {PrismaClient, Prisma} from '../../lib/index.js'

const prisma = new PrismaClient()

export const findByAccesstoken = async (accessToken) => {
  const tokens = await prisma.$queryRaw`
  SELECT *
  FROM SMCC.tokens
  WHERE "accessToken" = ${accessToken}
  `

  return tokens[0] ? tokens[0] : null

}

export const add = async (token) => {
  let saved
  try {
    let newData = {}
    for (const e in token) {
      newData[e] = token[e]
    }
    saved = await prisma.tokens.create({
      data: newData,
    })
  } catch (error) {
    console.log('Error when add token', error)
  }
  // const saved = await prisma.$queryRaw`
  //   INSERT INTO SMCC.tokens(
  //     "userId",
  //     "accessToken"
  //   )
  //   VALUES (
  //     ${token.userId},
  //     ${token.accessToken}
  //   )
  //   RETURNING *;
  // `;

  return saved ? [saved] : null
}

export const remove = async (userId, accessToken) => {
  if (userId) {
    let tokens
    try {
      tokens = await prisma.tokens.delete({
        where: {
          userId: userId,
        },
      })
    } catch (error) {
      console.log('Error when delete userId', error)
    }
    // const tokens = await prisma.$queryRaw`
    //     DELETE
    //     FROM SMCC.tokens
    //     WHERE "userId" = ${userId}
    //     RETURNING *;
    // `;

    return tokens ? [tokens] : null
  } else if (accessToken) {
    let token
    try {
      token = await prisma.tokens.delete({
        where: {
          accessToken: accessToken,
        },
      })
      //     token = await prisma.$queryRaw`
      //     DELETE
      //     FROM SMCC.tokens
      //     WHERE "accessToken" = ${accessToken}
      //     RETURNING *;
      // `;
      // console.log( 'ket qua the nao-----------------------------------', token )
    } catch (error) {
      console.log('Error when delete token', error)
    }

    return token ? [token] : null
  } else {
    return null
  }
}
