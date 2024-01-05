import {PrismaClient} from '../../lib/index.js'

const prisma = new PrismaClient()

export const getDetailContent = async (slug) => {
  let result
  try {
    result = await prisma.wordpressContents.findUnique({
      where: {
        url: slug,
      },
    })
  } catch (error) {
    console.log('Error when get slug from wordpressContent ', error)
  }
  return result
}

const secreetHeader = 'kwyZ6wJQdm'
export const getDetailContent2 = async (slug) => {
  let result
  try {
    result = await axios.get(`${process.env.API_URL}/api/wordpressContent/${slug}`, {
      headers: {
        Secreet: secreetHeader,
      },
    })
  } catch (error) {
    console.log('Error when get slug from wordpressContent ', error)
  }
}

export const saveInfor = async (slug, data) => {
  let result
  try {
    result = await prisma.wordpressContents.update({
      where: {
        url: slug,
      },
      data: {
        detailInfor: data,
      },
    })
    if (result.authorId) {
      await prisma.authors.update({
        where: {
          id: authorId,
        },
        data: {
          detailInfo: data,
        },
      })
    }
  } catch (error) {
    console.log('Error when save target person infor', error)
  }
}
