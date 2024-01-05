import got from 'got'
import config from '../config'
// process.env.DATABASE_URL

const urlCheckContent = config.CHECK_CONTENT_URL

export async function checkMultiContent(listItem: Array<any>) {
  try {
    const data = await got.post(urlCheckContent, {
      json: {
        list_item: listItem,
      },
      timeout: {
        request: 1200000,
      },
      retry: {
        limit: 2,
      },
    })
    let result = data?.body
    if (typeof result == 'string') {
      result = JSON.parse(result)
    }
    return result
  } catch (error) {
    console.log('Error when checkContent is negative or not: ', error)
    return null
  }
}
