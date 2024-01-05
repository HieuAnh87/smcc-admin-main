import axios from "axios";
import { createHistory } from "../service/historyAPI";
import { getUserByToken } from "../service/userAPI";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
export const login = createAsyncThunk("/login", async (params, thunkAPI) => {
  console.log(params, "login")
  const res = await axios.post(`${process.env.REACT_APP_API_URL}/user/login`, params);
  return res.data;
});
export const getUser = createAsyncThunk("/getUser", async (params, thunkAPI) => {
  const res = await getUserByToken({ queryKey: `${process.env.REACT_APP_API_URL}/user`, token: params });
  return res;
});
const initialState = {
  isLogged: false,
  userData: null,
  loading: false,
  error: null,
  token: (localStorage.getItem("access_token") && localStorage.getItem("access_token")) || "",
  code: 401,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout(state, action) {
      const updateHistory = createHistory({ newData: { userId: state.userData.id, screen: "Logout", description: "Đăng xuất" }, token: state.token });
      localStorage.removeItem("access_token");
      state.isLogged = false;
      state.code = 401;
      state.userData = null;
      state.token = "";
    },
  },
  extraReducers: {
    [login.pending]: (state, action) => {
      state.loading = true;
    },
    [login.rejected]: (state, action) => {
      state.token = "";
      state.code = 401;
      state.error = "Tài khoản hoặc mật khẩu không đúng";
      state.userData = null;
      state.isLogged = false;
      state.loading = false;
      localStorage.removeItem("access_token");
    },
    [login.fulfilled]: (state, { payload }) => {
      if (payload && payload && payload?.code && payload?.code == 200) {
        state.userData = payload.doc.user;
        state.token = payload.doc.token;
        state.code = payload.code;
        state.error = null;
        state.isLogged = true;
        state.loading = false;
        localStorage.setItem("access_token", payload.doc.token);
        const updateHistory = createHistory({ newData: { userId: payload.doc.user.id, screen: "Login", description: "Đăng nhập thành công" }, token: payload.doc.token });
      } else {
        state.token = "";
        state.code = 401;
        state.userData = null;
        state.isLogged = false;
        state.loading = false;
        localStorage.removeItem("access_token");
      }
    },
    // [savePro.fulfilled]: (state, action) => {},
    // [deletePro.fulfilled]: (state, action) => {},
    [getUser.pending]: (state, action) => {
      state.loading = true;
    },
    [getUser.rejected]: (state, action) => {
      state.token = "";
      state.code = 401;
      state.userData = null;
      state.isLogged = false;
      state.loading = false;
      localStorage.removeItem("access_token");
    },
    [getUser.fulfilled]: (state, { payload }) => {
      if (payload?.code == 200 || payload?.code == 304) {
        state.userData = payload.doc;
        state.code = 200;
        state.isLogged = true;
        state.loading = false;
      } else {
        state.userData = null;
        state.code = 401;
        state.isLogged = false;
        state.loading = false;
        localStorage.removeItem("access_token");
      }
    },
  },
});

export const { logout } = userSlice.actions;

export default userSlice.reducer;

export const selectUser = (state) => state.user;

