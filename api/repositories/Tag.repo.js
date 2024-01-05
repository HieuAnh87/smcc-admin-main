import { PrismaClient, Prisma } from "../../lib/index.js";

const prisma = new PrismaClient();

export const findAll = async (
  name,
  fromDate,
  toDate,
  fromRecord,
  pageSize,
  sortBy,
  desc
) => {
  const conditions = [];

  if (name) {
    conditions.push(
      Prisma.sql`LOWER(name) LIKE '%' || ${name.toLowerCase()} || '%'`
    );
  }
  if (fromDate) {
    conditions.push(Prisma.sql`"createdAt" >= ${new Date(fromDate)}`);
  }
  if (toDate) {
    conditions.push(Prisma.sql`"createdAt" <= ${new Date(toDate)}`);
  }

  const where = conditions.length
    ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
    : Prisma.empty;
  const tags = await prisma.$queryRaw`
    SELECT *
    FROM SMCC.tags
    ${where}
    ORDER BY ${Prisma.raw('"' + sortBy + '"' + " " + desc)}
    OFFSET ${fromRecord} LIMIT ${pageSize};
  `;

  const total = await prisma.$queryRaw`
    SELECT 
      COUNT(*)
    FROM SMCC.tags
    ${where};
  `;

  return tags && tags.length
    ? { docs: tags, total: total[0].count }
    : { docs: [], total: 0 };
};

export const findByIds = async (ids) => {
  const tags = await prisma.$queryRaw`
    SELECT *
    FROM SMCC.tags
    WHERE id = ANY(${ids});
  `;

  const total = await prisma.$queryRaw`
    SELECT 
      COUNT(*)
    FROM SMCC.tags
    WHERE id = ANY(${ids});
  `;

  return tags && tags.length
    ? { docs: tags, total: total[0].count }
    : { docs: [], total: 0 };
};

export const add = async ( tag ) =>
{
    let saved
  try {
    let newData = {}
    for ( const e in tag )
      {
        newData[e]=tag[e]
      }
    saved = await prisma.tags.create( {
      data: newData
    })
  } catch ( error )
  {
    console.log("Error when add tag",error)
    
  }
  return saved ? [saved] : null;
};

export const update = async ( id, tag ) =>
{
  let updated 
  try
  {
    let updatedField = {}
    for ( const e in tag )
    {
      updatedField[e]=tag[e]
    }
    updatedField.updatedAt=new Date()
    updated = await prisma.tags.update( {
      where: {
        id:id
      },
      data: updatedField
  }
  )
    
  } catch ( error )
  {
    console.log('Error when update tag:', error)
    
  }
  return updated ? [updated] : null;
};

export const remove = async ( id ) =>
{
    let tag
  try
  {
    tag = await prisma.tags.delete({
      where: {
        id: id,
      },
    })
    
  } catch (error) {
    console.log("Error when delete tag",error)
  }
  return tag ? [tag] : null;
};
