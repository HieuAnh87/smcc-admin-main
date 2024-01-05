import { PrismaClient, Prisma } from "../../lib/index.js";
import * as TagRepo from "./Tag.repo.js";
import * as ProfileRepo from "./Profile.repo.js";

const prisma = new PrismaClient();

export const findAll = async (
  tagIds,
  profileIds,
  name,
  fromRecord,
  pageSize,
  sortBy,
  desc
) => {
  let conditions = [];

  if (tagIds) {
    tagIds = tagIds.split(',');
    conditions.push(Prisma.sql`${tagIds} && "tagIds"`);
  }
  if (profileIds) {
    profileIds = profileIds.split(',');
    conditions.push(Prisma.sql`${profileIds} && "profileIds"`);
  }
  if (name) {
    conditions.push(Prisma.sql`LOWER(name) LIKE '%' || ${name.toLowerCase()} || '%'`);
  }

  const where = conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty;
  
  const authors = await prisma.$queryRaw`
  SELECT 
    a.id,
    a.link,
    a.name,
    a.avatar,
    a.gender,
    a."birthDate",
    a.address,
    a.contact,
    a."detailInfo",
    a."latestContentId",
    c.link as "latestContentLink",
    c."postedAt" as "latestPostedAt",
    a."totalContent",
    a."process",
    a."tagIds",
    a."profileIds",
    a."createdAt",
    a."updatedAt"
  FROM (
    SELECT
      *
    FROM SMCC.authors
    ${where}
    ORDER BY ${Prisma.raw('"' + sortBy + '"' + ' ' + desc)}
    OFFSET ${fromRecord} LIMIT ${pageSize}
    ) a LEFT JOIN SMCC.contents c ON a."latestContentId" = c.id;
`

  // Get tags info
  for (const author of authors) {
    const tagsResult = await TagRepo.findByIds(author.tagIds);
    author.tagsInfo = tagsResult.docs;

    if (author.tagIds && tagsResult.docs.length != author.tagIds.length) {
      author.tagIds = tagsResult.docs.map(t => t.id);
  
      await update(author.id, author);
    }
  }


  // Get profiles info
  for (const author of authors) {
    const profilesResult = await ProfileRepo.findByIds(author.profileIds);
    author.profilesInfo = profilesResult.docs;

    if (author.profileIds && profilesResult.docs.length != author.profileIds.length) {
      author.profileIds = profilesResult.docs.map(p => p.id);
  
      await update(author.id, author);
    }
  }

  const total = await prisma.$queryRaw`
    SELECT 
    COUNT(*)
    FROM SMCC.authors
    ${where};
  `;
    
  return authors && authors.length ? { docs: authors, total: total[0].count } : { docs: [], total: 0 };
};

export const findById = async (id) => {
  const authors = await prisma.$queryRaw`
    SELECT
      a.id,
      a.link,
      a.name,
      a.avatar,
      a.gender,
      a."birthDate",
      a.address,
      a.contact,
      a."detailInfo",
      a."latestContentId",
      c.link as "latestContentLink",
      c."postedAt" as "latestPostedAt",
      a."totalContent",
      a."process",
      a."tagIds",
      a."profileIds",
      a."createdAt",
      a."updatedAt"
    FROM SMCC.authors a LEFT JOIN SMCC.contents c ON a."latestContentId" = c.id
    WHERE a.id = ${id}
  `

  // Get tags info
  const tagsResult = await TagRepo.findByIds(authors[0].tagIds);
  authors[0].tagsInfo = tagsResult.docs;

  // Get profiles info
  const profilesResult = await ProfileRepo.findByIds(authors[0].profileIds);
  authors[0].profilesInfo = profilesResult.docs;
    
  return authors[0] ? authors[0] : null;
};

export const findByIds = async (ids) => {
  const authors = await prisma.$queryRaw`
    SELECT *
    FROM SMCC.authors
    WHERE id = ANY(${ids});
  `;
  
  const total = await prisma.$queryRaw`
    SELECT 
    COUNT(*)
    FROM SMCC.authors
    WHERE id = ANY(${ids});
  `;
  
  return authors && authors.length ? { docs: authors, total: total[0].count } : { docs: [], total: 0 };
};

export const update = async ( id, author ) =>
{
  let updated 
  try
  {
    let updatedField = {}
    for ( const e in author )
    {
      updatedField[e]=author[e]
    }
    updatedField.updatedAt=new Date()
    updated = await prisma.authors.update( {
      where: {
        id:id
      },
      data: updatedField
  }
  )
    
  } catch ( error )
  {
    console.log('Error when update author:', error)
    
  }
  // const updated = await prisma.$queryRaw`
  //   UPDATE SMCC.authors
  //   SET "process" = ${author.process},
  //       "tagIds"     = ${author.tagIds},
  //       "profileIds" = ${author.profileIds},
  //       "updatedAt"  = ${author.updatedAt ? new Date(author.updatedAt) : new Date()}
  //   WHERE id         = ${id}
  //   RETURNING *;
  // `;
  
  return updated ? [updated] : null;
};
