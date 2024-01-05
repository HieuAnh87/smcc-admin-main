import axios from 'axios'

export const handleError = (err) => {
  if (err.response.data.msg) {
    throw new Error(err.response.data.msg)
  } else {
    throw new Error(err.message)
  }
}
export const getAllPosts = async ({query, token}) => {
  // &createdAt_gte=${}&createdAt__lte=${}
  try {
    const res = await axios.get(`${query.queryKey[0]}`, {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    })
    if (res.data && res.data?.code && res?.data?.code != 200) {
      throw new Error(res?.data?.message || 'Đã có lỗi')
    }
    return res.data
  } catch (error) {}
}
export const getSimilarPosts = async ({query, token}) => {
  // &createdAt_gte=${}&createdAt__lte=${}
  try {
    const res = await axios.get(`${query.queryKey[0]}`, {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    })
    if (res.data && res.data?.code && res?.data?.code != 200) {
      throw new Error(res?.data?.message || 'Đã có lỗi')
    }
    return res.data
  } catch (error) {}
}

export const getPostById = async ({query, token}) => {
  // &createdAt_gte=${}&createdAt__lte=${}
  try {
    const res = await axios.get(`${query.queryKey[0]}`, {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    })
    if (res.data && res.data?.code && res?.data?.code != 200) {
      throw new Error(res?.data?.message || 'Đã có lỗi')
    }
    return res.data
  } catch (error) {}
}

export const updatePost = async ({id, newData, token}) => {
  newData = {...newData}
  const res = await axios.put(`${process.env.REACT_APP_API_URL}/content/${id}`, newData, {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  })
  if (res.data && res.data?.code && res?.data?.code != 200) {
    throw new Error(res?.data?.message || 'Đã có lỗi')
  }
  return res.data
}
export const updateMultiPost = async ({ids, userHandleType, token}) => {
  const res = await axios.put(
    `${process.env.REACT_APP_API_URL}/content`,
    {ids, userHandleType},
    {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    },
  )
  if (res.data && res.data?.code && res?.data?.code != 200) {
    throw new Error(res?.data?.message || 'Đã có lỗi trong quá trình update multil content')
  }
  return res.data
}

export const removePost = async ({id, token}) => {
  const res = await axios.delete(`${process.env.REACT_APP_API_URL}/content/${id}`, {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  })
  if (res.data && res.data?.code && res?.data?.code != 200) {
    throw new Error(res?.data?.message || 'Đã có lỗi')
  }
  return res.data
}
