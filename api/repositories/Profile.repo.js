import { PrismaClient, Prisma } from "../../lib/index.js";
import * as ContentRepo from "./Content.repo.js";
import * as AuthorRepo from "./Author.repo.js";
import * as SourceRepo from "./Source.repo.js";

const prisma = new PrismaClient();

export const findAll = async (
  name,
  description,
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
  if (description) {
    conditions.push(Prisma.sql`LOWER(description) LIKE '%' || ${description.toLowerCase()} || '%'`);
  }
  if (fromDate) {
    conditions.push(Prisma.sql`"createdAt" >= ${new Date(fromDate)}`);
  }
  if (toDate) {
    conditions.push(Prisma.sql`"createdAt" <= ${new Date(toDate)}`);
  }

  const where = conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty;
  const profiles = await prisma.$queryRaw`
    SELECT *
    FROM SMCC.profiles
    ${where}
    ORDER BY ${Prisma.raw('"' + sortBy + '"' + ' ' + desc)}
    OFFSET ${fromRecord} LIMIT ${pageSize};
  `;

  // Update list contentIds, sourceIds, authorIds if not equal
  if (profiles && profiles.length) {
    for (const profile of profiles) {
      let isUpdate = false;

      const contents = await ContentRepo.findByIds(profile.contentIds);
      if (profile.contentIds && profile.contentIds.length != contents.docs.length) {
        profile.contentIds = contents.docs.map(c => c.id);
        isUpdate = true;
      }

      const sources = await SourceRepo.findByIds(profile.sourceIds);
      if (profile.sourceIds && profile.sourceIds.length != sources.docs.length) {
        profile.sourceIds = sources.docs.map(s => s.id);
        isUpdate = true;
      }

      const authors = await AuthorRepo.findByIds(profile.authorIds);
      if (profile.authorIds && profile.authorIds.length != authors.docs.length) {
        profile.authorIds = authors.docs.map(a => a.id);
        isUpdate = true;
      }

      if (isUpdate) {
        await update(profile.id, profile);
      }
    }
  }

  const total = await prisma.$queryRaw`
    SELECT 
      COUNT(*)
    FROM SMCC.profiles
    ${where};
  `;

  return profiles && profiles.length ? { docs: profiles, total: total[0].count } : { docs: [], total: 0 };
};

export const findById = async (id) => {
  const profiles = await prisma.$queryRaw`
    SELECT *
    FROM SMCC.profiles
    WHERE id = ${id};
  `;

  if (profiles[0]) {
    // Get contents info
    if (profiles[0].contentIds && profiles[0].contentIds.length) {
      profiles[0].contentsInfo = [];

      for (const contentId of profiles[0].contentIds) {
        const content = await ContentRepo.findById(contentId);
        if (content) {
          profiles[0].contentsInfo.push(content);
        }
      }
    }

    // Get authors info
    if (profiles[0].authorIds && profiles[0].authorIds.length) {
      profiles[0].authorsInfo = await AuthorRepo.findByIds(profiles[0].authorIds);
    }

    // Get sources info
    if (profiles[0].sourceIds && profiles[0].sourceIds.length) {
      profiles[0].sourcesInfo = await SourceRepo.findByIds(profiles[0].sourceIds);
    }

    return profiles[0];
  } else {
    return null;
  }
};

export const findByIds = async (ids) => {
  const profiles = await prisma.$queryRaw`
    SELECT *
    FROM SMCC.profiles
    WHERE id = ANY(${ids});
  `;
  
  const total = await prisma.$queryRaw`
    SELECT 
      COUNT(*)
    FROM SMCC.profiles
    WHERE id = ANY(${ids});
  `;

  return profiles && profiles.length ? { docs: profiles, total: total[0].count } : { docs: [], total: 0 };
};

export const add = async ( profile ) =>
{
    let saved
  try {
    let newData = {}
    for ( const e in profile )
      {
        newData[e]=profile[e]
      }
    saved = await prisma.profiles.create( {
      data: newData
    })
  } catch ( error )
  {
    console.log("Error when add profile",error)
    
  }
  // const saved = await prisma.$queryRaw`
  //   INSERT INTO SMCC.profiles(
  //     name,
  //     description
  //   )
  //   VALUES (
  //     ${profile.name},
  //     ${profile.description}
  //   )
  //   RETURNING *;
  // `;
      
  return saved ? [saved] : null;
};

export const update = async ( id, profile ) =>
{
    let updated 
  try
  {
    let updatedField = {}
    for ( const e in profile )
    {
      updatedField[e]=profile[e]
    }
    updatedField.updatedAt=new Date()
    updated = await prisma.profiles.update( {
      where: {
        id:id
      },
      data: updatedField
  }
  )
    
  } catch ( error )
  {
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

export const remove = async ( id ) =>
{
    let profile
  try
  {
    profile = await prisma.profiles.delete({
      where: {
        id: id,
      },
    })
    
  } catch (error) {
    console.log("Error when delete profile",error)
  }
  // const profile = await prisma.$queryRaw`
  //     DELETE
  //     FROM SMCC.profiles
  //     WHERE id = ${id}
  //     RETURNING *;
  // `;

  return profile ? [profile] : null;
};