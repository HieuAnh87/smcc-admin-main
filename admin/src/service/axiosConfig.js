import axios from 'axios'
const baseURL = `http://localhost:8000/api`

const axiosInstance = axios.create({
  baseURL,
  timeout: 30000,
//   headers: {
//     token: 'Bearer' + localStorage.getItem("access_token")
//   }
})
axiosInstance.interceptors.response.use(response => response, error => {
  const { response, config } = error

  if (response.status !== 401) {
    return Promise.reject(error)
  }
  const refreshToken = localStorage.get("refresh_token")
  // Use a 'clean' instance of axios without the interceptor to refresh the token. No more infinite refresh loop.
  return axios.get(`${process.env.REACT_APP_API_URL}/auth/refresh`, {
    baseURL,
    timeout: 30000,
    headers: {
        refreshToken: refreshToken
    }
  })
    .then(() => {
      // If you are using localStorage, update the token and Authorization header here
      return axiosInstance(config)
    })
    .catch(() => {
      return Promise.reject(error)
    })
})

export default axiosInstance