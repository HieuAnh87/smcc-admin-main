import { PrismaClient, Prisma } from "../../lib/index.js";

const prisma = new PrismaClient();

export const findAll = async (
  fromDate,
  toDate,
  fromRecord,
  pageSize,
  sortBy,
  desc
) => {
  const conditions = [];

  if (fromDate) {
    conditions.push(Prisma.sql`"createdAt" >= ${new Date(fromDate)}`);
  }
  if (toDate) {
    conditions.push(Prisma.sql`"createdAt" <= ${new Date(toDate)}`);
  }

  const where = conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty;

  const campaigns = await prisma.$queryRaw`
    SELECT *
    FROM SMCC.campaigns
    ${where}
    ORDER BY ${Prisma.raw('"' + sortBy + '"' + ' ' + desc)}
    OFFSET ${fromRecord} LIMIT ${pageSize};
  `;

  const total = await prisma.$queryRaw`
    SELECT 
    COUNT(*)
    FROM SMCC.campaigns
    ${where};
  `;
  
  return campaigns && campaigns.length ? { docs: campaigns, total: total[0].count } : { docs: [], total: 0 };
};

export const add = async ( campaign ) =>
{
  let saved
  try {
    let newData = {}
    for ( const e in campaign )
      {
        newData[e]=campaign[e]
      }
    saved = await prisma.campaigns.create( {
      data: newData
    })
  } catch ( error )
  {
    console.log("Error when add campaign",error)
    
  }

  // const saved = await prisma.$queryRaw`
  //   INSERT INTO SMCC.campaigns(
  //     name,
  //     type,
  //     "contentUrls",
  //     interactions,
  //     comments,
  //     status
  //   )
  //   VALUES (
  //     ${campaign.name},
  //     ${campaign.type},
  //     ${campaign.contentUrls},
  //     ${campaign.interactions},
  //     ${campaign.comments},
  //     ${campaign.status}
  //   )
  //   RETURNING *;
  // `;

  return saved ? [saved] : null;
};

export const update = async ( id, campaign ) =>
{
    let updated 
  try
  {
    let updatedField = {}
    for ( const e in campaign )
    {
      updatedField[e]=campaign[e]
    }
    updatedField.updatedAt=new Date()
    updated = await prisma.campaigns.update( {
      where: {
        id:id
      },
      data: updatedField
  }
  )
    
  } catch ( error )
  {
    console.log('Error when update campaign:', error)
  }
  // const updated = await prisma.$queryRaw`
  //   UPDATE SMCC.campaigns
  //   SET name        = ${campaign.name},
  //     type          = ${campaign.type},
  //     "contentUrls" = ${campaign.contentUrls},
  //     interactions  = ${campaign.interactions},
  //     comments      = ${campaign.comments},
  //     status        = ${campaign.status},
  //     "runCount"    = ${campaign.runCount},
  //     "startedAt"   = ${campaign.startedAt},
  //     "endedAt"     = ${campaign.endedAt},
  //     "updatedAt"   = ${campaign.updatedAt ? new Date(campaign.updatedAt) : new Date()}
  //   WHERE id        = ${id}
  //   RETURNING *;
  // `;

  return updated ? [updated] : null;
};

export const remove = async ( id ) =>
{
  let campaign
  try
  {
    campaign = await prisma.campaigns.delete({
      where: {
        id: id,
      },
    })
    
  } catch (error) {
    console.log("Error when delete campaign",error)
  }

  // const campaign = await prisma.$queryRaw`
  //   DELETE
  //   FROM SMCC.campaigns
  //   WHERE id = ${id}
  //   RETURNING *
  // `;

  return campaign ? [campaign] : null;
};
