import { PrismaClient, Prisma } from "../../lib/index.js";

const prisma = new PrismaClient();

export const findAll = async (
  name,
  email,
  role,
  workTime,
  lock,
  fromDate,
  toDate,
  fromRecord,
  pageSize,
  sortBy,
  desc
) => {
  const conditions = [];

  if (name) {
    conditions.push(Prisma.sql`LOWER(name) LIKE '%' || ${name.toLowerCase()} || '%'`);
  }
  if (email) {
    conditions.push(Prisma.sql`LOWER(email) LIKE '%' || ${email.toLowerCase()} || '%'`);
  }
  if (role) {
    conditions.push(Prisma.sql`${role} = ANY(roles)`);
  }
  if (workTime) {
    conditions.push(Prisma.sql`"workTime" = ${workTime}`);
  }
  if (lock === true || lock === false) {
    conditions.push(Prisma.sql`lock = ${lock}`);
  }
  if (fromDate) {
    conditions.push(Prisma.sql`"createdAt" >= ${new Date(fromDate)}`);
  }
  if (toDate) {
    conditions.push(Prisma.sql`"createdAt" <= ${new Date(toDate)}`);
  }

  const where = conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty;
  const users = await prisma.$queryRaw`
    SELECT *
    FROM SMCC.users
    ${where}
    ORDER BY ${Prisma.raw('"' + sortBy + '"' + ' ' + desc)}
    OFFSET ${fromRecord} LIMIT ${pageSize};
  `;
  
  const total = await prisma.$queryRaw`
    SELECT 
      COUNT(*)
    FROM SMCC.users
    ${where};
  `;

  return users && users.length ? { docs: users, total: total[0].count } : { docs: [], total: 0 };
}

export const findById = async (id) => {
  const users = await prisma.$queryRaw`
    SELECT *
    FROM SMCC.users
    WHERE id = ${id}
  `;

  return users[0] ? users[0] : null;
};

export const findByAccessToken = async (accessToken) => {
  const users = await prisma.$queryRaw`
    SELECT *
    FROM SMCC.users
    WHERE "accessToken" = ${accessToken}
  `;

  return users[0] ? users[0] : null;
};

export const add = async ( user ) =>
{
    let saved
  try {
    let newData = {}
    for ( const e in user )
      {
        newData[e]=user[e]
      }
    saved = await prisma.users.create( {
      data: newData
    })
  } catch ( error )
  {
    console.log("Error when add user",error)
    
  }
  // const saved = await prisma.$queryRaw`
  //   INSERT INTO SMCC.users (
  //     name,
  //     email,
  //     password,
  //     roles,
  //     "workTime",
  //     gender,
  //     telephone
  //   ) 
  //   VALUES (
  //     ${user.name},
  //     ${user.email},
  //     ${user.password},
  //     ${user.roles},
  //     ${user.workTime},
  //     ${user.gender},
  //     ${user.telephone}
  //   ) 
  //   RETURNING *;
  // `;
      
  return saved ? [saved] : null;
};

export const update = async (id, user) => {
  // let updated = null;

  // if (user.password) {
  //   updated = await prisma.$queryRaw`
  //       UPDATE SMCC.users
  //       SET name         = ${user.name},
  //           email        = ${user.email},
  //           password     = ${user.password},
  //           roles        = ${user.roles},
  //           "workTime"   = ${user.workTime},
  //           gender       = ${user.gender},
  //           telephone    = ${user.telephone},
  //           lock         = ${user.lock},
  //           "updatedAt"  = ${user.updatedAt ? new Date(user.updatedAt) : new Date()}
  //       WHERE id        = ${id}
  //       RETURNING *;
  //   `;
  // } else {
  //   updated = await prisma.$queryRaw`
  //       UPDATE SMCC.users
  //       SET name         = ${user.name},
  //           email        = ${user.email},
  //           roles        = ${user.roles},
  //           "workTime"   = ${user.workTime},
  //           gender       = ${user.gender},
  //           telephone    = ${user.telephone},
  //           lock         = ${user.lock},
  //           "updatedAt"  = ${user.updatedAt ? new Date(user.updatedAt) : new Date()}
  //       WHERE id        = ${id}
  //       RETURNING *;
  //   `;
  // }
  let updated 
  try
  {
    let updatedField = {}
    for ( const e in user )
    {
      updatedField[e]=user[e]
    }
    updatedField.updatedAt=new Date()
    updated = await prisma.users.update( {
      where: {
        id:id
      },
      data: updatedField
  }
  )
    
  } catch ( error )
  {
    console.log('Error when update user:', error)
    
  }
  return updated ? [updated] : null;
};

export const remove = async ( id ) =>
{
    let user
  try
  {
    user = await prisma.users.delete({
      where: {
        id: id,
      },
    })
    
  } catch (error) {
    console.log("Error when delete user",error)
  }
  // const user = await prisma.$queryRaw`
  //     DELETE
  //     FROM SMCC.users
  //     WHERE id = ${id}
  //     RETURNING *;
  // `;

  return user ? [user] : null;
};