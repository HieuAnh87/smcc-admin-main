import got from 'got'

const urlTextSimilarity = 'http://178.128.19.31:4501/predict-batch'

export async function checkTextSimilarity(listItem: Array<any>) {
  try {
    const data = await got.post(urlTextSimilarity, {
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
    console.log('Error when check Similarity content: ', error)
    return {}
  }
}
