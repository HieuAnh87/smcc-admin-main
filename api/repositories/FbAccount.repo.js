import { PrismaClient, Prisma } from "../../lib/index.js";

const prisma = new PrismaClient();

export const findAll = async(
  name,
  email,
  status,
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
  if (status) {
      conditions.push(Prisma.sql`status = ${status}`);
  }

  const where = conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty;

  const accounts = await prisma.$queryRaw`
    SELECT
      id,
      "fbId",
      link,
      name,
      email,
      status,
      proxy,
      cookies,
      avatar,
      otp,
      phone,
      "errorType",
      "firstRunAt",
      "lastRunAt"
    FROM SMCC."fbAccounts"
    ${where}
    ORDER BY ${Prisma.raw('"' + sortBy + '"' + ' ' + desc)}
    OFFSET ${fromRecord} LIMIT ${pageSize};
  `;
  
  const total = await prisma.$queryRaw`
    SELECT 
      COUNT(*)
    FROM SMCC."fbAccounts"
    ${where};
  `;

  return accounts && accounts.length ? { docs: accounts, total: total[0].count } : { docs: [], total: 0 };
}

export const findById = async (id) => {
  const result = await prisma.$queryRaw`
    SELECT *
    FROM SMCC."fbAccounts"
    WHERE id = ${id}
  `;

  return result[0] ? result[0] : null;
}

export const add = async ( account ) =>
{
  let saved
  try {
    let newData = {}
    for ( const e in account )
      {
        newData[e]=account[e]
      }
    saved = await prisma.fbAccounts.create( {
      data: newData
    })
  } catch ( error )
  {
    console.log("Error when add account",error)
    
  }
  // const saved = await prisma.$queryRaw`
  //   INSERT INTO SMCC."fbAccounts" (
  //     "fbId",
  //     link,
  //     name,
  //     email,
  //     password,
  //     proxy,
  //     avatar,
  //     otp,
  //     phone
  //   ) 
  //   VALUES (
  //     ${account.fbId},
  //     ${account.link},
  //     ${account.name},
  //     ${account.email},
  //     ${account.password},
  //     ${account.proxy},
  //     ${account.avatar},
  //     ${account.otp},
  //     ${account.phone}
  //   ) 
  //   RETURNING *;
  // `;
      
  return saved ? [saved] : null;
};

export const update = async ( id, account ) =>
{
  let updated 
  try
  {
    let updatedField = {}
    for ( const e in account )
    {
      updatedField[e]=account[e]
    }
    updatedField.updatedAt=new Date()
    updated = await prisma.fbAccounts.update( {
      where: {
        id:id
      },
      data: updatedField
  }
  )
    
  } catch ( error )
  {
    console.log('Error when update account:', error)
    
  }
  // if (account.password) {
  //   const updated = await prisma.$queryRaw`
  //     UPDATE SMCC."fbAccounts"
  //     SET "fbId"      = ${account.fbId},
  //         link        = ${account.link},
  //         name        = ${account.name},
  //         email       = ${account.email},
  //         password    = ${account.password},
  //         status      = ${account.status},
  //         proxy       = ${account.proxy},
  //         avatar      = ${account.avatar},
  //         otp         = ${account.otp},
  //         phone       = ${account.phone},
  //         "updatedAt" = ${account.updatedAt ? new Date(account.updatedAt) : new Date()}
  //     WHERE id        = ${id}
  //     RETURNING *;
  //   `;
  
  //   return updated ? updated : null;
  // } else {
  //   const updated = await prisma.$queryRaw`
  //     UPDATE SMCC."fbAccounts"
  //     SET "fbId"      = ${account.fbId},
  //         link        = ${account.link},
  //         name        = ${account.name},
  //         email       = ${account.email},
  //         status      = ${account.status},
  //         proxy       = ${account.proxy},
  //         avatar      = ${account.avatar},
  //         otp         = ${account.otp},
  //         phone       = ${account.phone},
  //         "updatedAt" = ${account.updatedAt ? new Date(account.updatedAt) : new Date()}
  //     WHERE id        = ${id}
  //     RETURNING *;
  //   `;
  
    return updated ? [updated] : null;
  
}

export const remove = async ( id ) =>
{
    let account
  try
  {
    account = await prisma.fbAccounts.delete({
      where: {
        id: id,
      },
    })
    
  } catch (error) {
    console.log("Error when delete account",error)
  }
  // const account = await prisma.$queryRaw`
  //     DELETE
  //     FROM SMCC."fbAccounts"
  //     WHERE id = ${id}
  //     RETURNING *;
  // `;

  return account ? [account] : null;
};