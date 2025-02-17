import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { QuerySpec, QuerySpecWithSource } from "../../types/QuerySpec";
import { TreeNode } from "../../types/Tree";
import { getColor } from "../../utils/color";

export type States = {
  NLQuery: string;
  query: QuerySpecWithSource | null;
  colorMap: Record<string, string>;
  querySpec: QuerySpec | null;
  querySpecIndex: number;
  querySpecList: QuerySpec[];
  fragmentsIndex: number;
  treeData: TreeNode;
  isSettingShow: boolean;
  timeStampUnit: string;
  valueUnit: string;
  aspectRatio: number;
  isDrawer: boolean;
  querys: string[];
  modifyPrompts: string[];
  curTrend: number | null,
  curRelation: number | null,
};

// 使用该类型定义初始 state
const initialState: States = {
  NLQuery: "",
  colorMap: {},
  querySpecIndex: -1,
  querySpecList: [],
  fragmentsIndex: -1,
  treeData: { name: "Source" },
  isSettingShow: false,
  timeStampUnit: "",
  valueUnit: "",
  aspectRatio: 0.00001,
  query: null,
  querySpec: null,
  isDrawer: false,
  querys: [],
  curRelation: null,
  curTrend: null,
  modifyPrompts: []
};

const stateSlice = createSlice({
  name: "states",
  initialState,
  reducers: {
    setNLQuery: (state, action: PayloadAction<string>) => {
      state.NLQuery = action.payload;
    },
    setQuery: (state, action: PayloadAction<QuerySpecWithSource | null>) => {
      state.query = action.payload;
    },
    setColorMap: (state, action: PayloadAction<QuerySpecWithSource | null>) => {
      const colorMap: Record<string, string> = {};
      const traverse = <T>(obj: T) => {
        if (!obj) return;
        for (const key in obj) {
          if (key === 'text_source' && obj[key] && typeof obj[key] === 'object' && 'text' in obj[key]) {
            const textSource = obj[key] as { text: string, index?: number };
            const text = textSource.text;
            const index = textSource.index;
            const colorKey = index !== undefined ? `${text}-${index}` : text;
            if (!colorMap[colorKey]) {
              colorMap[colorKey] = getColor(Object.keys(colorMap).length);
            }
          }
          if (obj[key] && typeof obj[key] === 'object') {
            traverse(obj[key]);
          }
        }
      };
      traverse(action.payload);
      state.colorMap = colorMap;
    },
    addQuerySpec: (state, action: PayloadAction<QuerySpec>) => {
      state.querySpecList = [...state.querySpecList.slice(0, state.querySpecIndex + 1), action.payload];
      state.querySpecIndex = state.querySpecList.length - 1;
    },
    setQuerySpecIndex: (state, action: PayloadAction<number>) => {
      state.querySpecIndex = action.payload;
    },
    setFragmentsIndex: (state, action: PayloadAction<number>) => {
      state.fragmentsIndex = action.payload;
    },
    setIsSettingShow: (state, action: PayloadAction<boolean | undefined>) => {
      state.isSettingShow = action.payload ?? !state.isSettingShow;
    },
    setTimeStampUnit: (state, action: PayloadAction<string>) => {
      state.timeStampUnit = action.payload;
    },
    setValueUnit: (state, action: PayloadAction<string>) => {
      state.valueUnit = action.payload;
    },
    setAspectRatio: (state, action: PayloadAction<number>) => {
      state.aspectRatio = action.payload;
    },
    setIsDrawer: (state, action: PayloadAction<boolean>) => {
      state.isDrawer = action.payload;
    },
    setQuerys: (state, action: PayloadAction<string[]>) => {
      state.querys = action.payload;
    },
    setQuerySpec: (state, action: PayloadAction<QuerySpec | null>) => {
      state.querySpec = action.payload;
    },
    setCurTrend: (state, action: PayloadAction<number | null>) => {
      state.curTrend = action.payload;
      return state;
    },
    setCurRelation: (state, action: PayloadAction<number | null>) => {
      state.curRelation = action.payload;
      return state;
    },
    setModifyPrompts: (state, action: PayloadAction<string[]>) => {
      state.modifyPrompts = action.payload;
      return state;
    },
  },
});

export const { setNLQuery, setQuery, setColorMap, setQuerySpec, addQuerySpec, setFragmentsIndex, setQuerySpecIndex, setIsSettingShow, setTimeStampUnit, setValueUnit, setAspectRatio, setIsDrawer, setQuerys, setModifyPrompts, setCurRelation, setCurTrend } = stateSlice.actions;
export default stateSlice.reducer;
