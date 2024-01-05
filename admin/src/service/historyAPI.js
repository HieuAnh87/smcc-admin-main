import axios from "axios";
export const handleError = (err) => {
  if (err.response.data.msg) {
    throw new Error(err.response.data.msg);
  } else {
    throw new Error(err.message);
  }
};
export const getAllHistory = async ({ query, token }) => {
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

export const getHistoryById = async ({ query, token }) => {
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

export const createHistory = async ({ newData, token }) => {
  try {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/history`, newData, {
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
export const updateHistory = async ({ id, newData, token }) => {
  newData = { ...newData };
  const res = await axios.put(`${process.env.REACT_APP_API_URL}/history/${id}`, newData, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  if (res.data && res.data?.code && res?.data?.code != 200) {
    throw new Error(res?.data?.message || "Đã có lỗi");
  }
  return res.data;
};

export const removeHistory = async ({ id, token }) => {
  const res = await axios.delete(`${process.env.REACT_APP_API_URL}/history/${id}`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  if (res.data && res.data?.code && res?.data?.code != 200) {
    throw new Error(res?.data?.message || "Đã có lỗi");
  }
  return res.data;
};
