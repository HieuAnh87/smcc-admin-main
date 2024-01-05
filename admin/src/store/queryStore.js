import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    queryStr: 0,
};

const querySlice = createSlice({
  name: "page",
  initialState,
  reducers: {
    setQueryStr(state, { payload }) {
      state.queryStr = payload;
    },
    clearQueryStr(state, { payload }) {
      state.queryStr = '';
    },
  },
  extraReducers: {
    RESET_APP: () => initialState,
  },
});

export const { setQueryStr, clearQueryStr } = querySlice.actions;

export default querySlice.reducer;

export const selectQuery = (state) => state.query;
