import axios from 'axios'

export const handleError = (err) => {
  if (err.response.data.msg) {
    throw new Error(err.response.data.msg)
  } else {
    throw new Error(err.message)
  }
}
export const getAllTags = async (query, token) => {
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
  } catch (error) { }
}

export const getAllCate = async (query, token) => {
  // &createdAt_gte=${}&createdAt__lte=${}
  try {
    const res = await axios.get(`${query.queryKey[0]}`)
    if (res.data && res.data?.code && res?.data?.code != 200) {
      throw new Error(res?.data?.message || 'Đã có lỗi')
    }
    return res.data
  } catch (error) { }
}

export const createTag = async ({ newData, token }) => {
  const res = await axios.post(`${process.env.REACT_APP_API_URL}/tag`, newData, {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  })
  if (res.data && res.data?.code && res?.data?.code != 200) {
    throw new Error(res?.data?.message || 'Đã có lỗi')
  }
  return res.data
}
export const updateTag = async ({ id, newData, token }) => {
  const res = await axios.put(`${process.env.REACT_APP_API_URL}/tag/${id}`, newData, {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  })
  if (res.data && res.data?.code && res?.data?.code != 200) {
    throw new Error(res?.data?.message || 'Đã có lỗi')
  }
  return res.data
}

export const removeTag = async ({ id, token }) => {
  const res = await axios.delete(`${process.env.REACT_APP_API_URL}/tag/${id}`, {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  })
  if (res.data && res.data?.code && res?.data?.code != 200) {
    throw new Error(res?.data?.message || 'Đã có lỗi')
  }
  return res.data
}
