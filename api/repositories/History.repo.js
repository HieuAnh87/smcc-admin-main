import { PrismaClient, Prisma } from "../../lib/index.js";

const prisma = new PrismaClient();

export const findAll = async (
  userId,
  screen,
  fromDate,
  toDate,
  fromRecord,
  pageSize,
  sortBy,
  desc
) => {
  let conditions = [];

  if (userId) {
    conditions.push(Prisma.sql`"userId" = ${userId}`);
  }
  if (screen) {
    conditions.push(Prisma.sql`screen = ${screen}`);
  }
  if (fromDate) {
    conditions.push(Prisma.sql`"createdAt" >= ${new Date(fromDate)}`);
  }
  if (toDate) {
    conditions.push(Prisma.sql`"createdAt" <= ${new Date(toDate)}`);
  }

  const where = conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty;

  const history = await prisma.$queryRaw`
    SELECT
      h.id,
      h."userId",
      u.name as "userName",
      u.email as "userEmail",
      u.roles as "userRoles",
      h.screen,
      h.description,
      h."createdAt",
      h."updatedAt"
    FROM (
      SELECT *
      FROM SMCC.history
      ${where}
      ORDER BY ${Prisma.raw('"' + sortBy + '"' + ' ' + desc)}
      OFFSET ${fromRecord} LIMIT ${pageSize}
    ) h INNER JOIN SMCC.users u ON h."userId" = u.id;
  `;

  const total = await prisma.$queryRaw`
      SELECT 
      COUNT(*)
      FROM SMCC.history
      ${where};
    `;

  return history && history.length
    ? { docs: history, total: total[0].count }
    : { docs: [], total: 0 };
};

export const add = async ( history ) =>
{
  let saved
  try {
    let newData = {}
    for ( const e in history )
      {
        newData[e]=history[e]
      }
    saved = await prisma.history.create( {
      data: newData
    })
  } catch ( error )
  {
    console.log("Error when add history",error)
    
  }
  // const saved = await prisma.$queryRaw`
  //   INSERT INTO SMCC.history(
  //     "userId",
  //     screen,
  //     description
  //   )
  //   VALUES (
  //     ${history.userId},
  //     ${history.screen},
  //     ${history.description}
  //   )
  //   RETURNING *;
  // `;
      
  return saved ? [saved] : null;
};

export const remove = async ( id ) =>
{
    let history
  try
  {
    history = await prisma.history.delete({
      where: {
        id: id,
      },
    })
    
  } catch (error) {
    console.log("Error when delete history",error)
  }
  // const history = await prisma.$queryRaw`
  //   DELETE
  //   FROM SMCC.history
  //   WHERE id = ${id}
  //   RETURNING *;
  // `;

  return history ? [history] : null;
};