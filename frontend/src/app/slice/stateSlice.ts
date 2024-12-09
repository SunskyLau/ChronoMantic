import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FragmentList, QuerySpec } from "../../types/QuerySpec";

export type States = {
  NLQuery: string;
  querySpec: QuerySpec | null;
  ratio: number;
  fragments: FragmentList | null;
};

// 使用该类型定义初始 state
const initialState: States = {
  NLQuery: "",
  querySpec: null,
  fragments: null,
  ratio: 1
};

const stateSlice = createSlice({
  name: "states",
  initialState,
  reducers: {
    setNLQuery: (state, action: PayloadAction<string>) => {
      state.NLQuery = action.payload;
    },
    setQuerySpec: (state, action: PayloadAction<QuerySpec>) => {
      state.querySpec = action.payload;
    },
    setRatio: (state, action: PayloadAction<number>) => {
      state.ratio = action.payload;
    },
    setFragments: (state, action: PayloadAction<FragmentList>) => {
      state.fragments = action.payload;
    }
  },
});

export const { setNLQuery, setQuerySpec, setRatio, setFragments } = stateSlice.actions;
export default stateSlice.reducer;
