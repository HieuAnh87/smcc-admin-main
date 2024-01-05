import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pageAuthor: 0,
  pageUser: 0,
};

const pageSlice = createSlice({
  name: "page",
  initialState,
  reducers: {
    setPageAuthor(state, { payload }) {
      state.pageAuthor = payload;
    },
    setPageUser(state, { payload }) {
      state.pageUser = payload;
    },
  },
  extraReducers: {
    RESET_APP: () => initialState,
  },
});

export const { setPageAuthor, setPageUser } = pageSlice.actions;

export default pageSlice.reducer;

export const selectPage = (state) => state.page;
