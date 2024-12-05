import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type States = {
  NLQuery: string;
  shownColumn: string; // 被细节视图展示的列
};

// 使用该类型定义初始 state
const initialState: States = {
  NLQuery: "",
  shownColumn: "",
};

const stateSlice = createSlice({
  name: "states",
  initialState,
  reducers: {
    setNLQuery: (state, action: PayloadAction<string>) => {
      state.NLQuery = action.payload;
    },
    setShownColumn: (state, action: PayloadAction<string>) => {
      state.shownColumn = action.payload;
    },
  },
});

export const { setNLQuery, setShownColumn } = stateSlice.actions;
export default stateSlice.reducer;
