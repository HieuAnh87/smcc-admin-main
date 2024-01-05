import axios from "axios";
export const handleError = (err) => {
  if (err.response.data.msg) {
    throw new Error(err.response.data.msg);
  } else {
    throw new Error(err.message);
  }
};
export const getAllUsers = async (query, token) => {
  // &createdAt_gte=${}&createdAt__lte=${}
  try {
    const res = await axios.get(`${query.queryKey[0]}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    if (res.data && res.data?.code && res?.data?.code != 200) {
      throw new Error(res?.data?.message || "Đã có lỗi");
    }
    return res.data;
  } catch (error) {}
};
export const getUserByToken = async ({ queryKey, token }) => {
  // &createdAt_gte=${}&createdAt__lte=${}
  try {
    const res = await axios.get(`${queryKey}/${token}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    if (res.data && res.data?.code && res?.data?.code != 200) {
      throw new Error(res?.data?.message || "Đã có lỗi");
    }
    return res?.data;
  } catch (error) {
    return error?.response?.data;
  }
};
export const getUserById = async ({ query, token }) => {
  // &createdAt_gte=${}&createdAt__lte=${}
  try {
    const res = await axios.get(`${query.queryKey[0]}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    if (res.data && res.data?.code && res?.data?.code != 200) {
      throw new Error(res?.data?.message || "Đã có lỗi");
    }
    return res?.data;
  } catch (error) {
    return error?.response?.data;
  }
};
export const createUser = async (newData, token) => {
  const res = await axios.post(`${process.env.REACT_APP_API_URL}/user`, newData, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  if (res.data && res.data?.code && res?.data?.code != 200) {
    throw new Error(res?.data?.message || "Đã có lỗi");
  }
  return res.data;
};
export const updateUser = async (params) => {
  const { id, newData, token } = params;
  const res = await axios.put(`${process.env.REACT_APP_API_URL}/user/${id}`, newData, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  if (res.data && res.data?.code && res?.data?.code != 200) {
    throw new Error(res?.data?.message || "Đã có lỗi");
  }
  return res.data;
};

export const removeUser = async ({ id, token }) => {
  const res = await axios.delete(`${process.env.REACT_APP_API_URL}/user/${id}`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return res.data;
};
