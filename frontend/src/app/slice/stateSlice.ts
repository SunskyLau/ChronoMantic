import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Fragment, FragmentList, Query, QuerySpec } from "../../types/QuerySpec";
import { InsertTreeNode, TreeNode } from "../../types/Tree";

export type States = {
  NLQuery: string;
  query: Query | null;
  querySpec: QuerySpec | null;
  querySpecIndex: number;
  querySpecList: QuerySpec[];
  fragmentsIndex: number;
  fragmentsList: [Fragment[], Fragment[]][];
  treeData: TreeNode;
  isSettingShow: boolean;
  timeStampUnit: string;
  valueUnit: string;
  aspectRatio: number;
  isDrawer: boolean;
  querys: string[];
  curTrend: number | null,
  curRelation: number | null,
};

// 使用该类型定义初始 state
const initialState: States = {
  NLQuery: "",
  querySpecIndex: -1,
  querySpecList: [],
  fragmentsIndex: -1,
  fragmentsList: [],
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
};

const stateSlice = createSlice({
  name: "states",
  initialState,
  reducers: {
    setNLQuery: (state, action: PayloadAction<string>) => {
      state.NLQuery = action.payload;
    },
    setQuery: (state, action: PayloadAction<Query | null>) => {
      state.query = action.payload;
      state.querySpec = action.payload ? action.payload.reduce((acc, cur) => {
        const condition = cur.condition;
        if (condition) {
          for (const key in condition) {
            const k = key as keyof QuerySpec;
            const value = condition[k];
            if (acc[k] && Array.isArray(acc[k]) && Array.isArray(value)) {
              (acc as { [key: string]: QuerySpec[keyof QuerySpec] })[k] = [...acc[k], ...value].sort((a, b) => a?.index - b?.index);
            } else {
              (acc as { [key: string]: QuerySpec[keyof QuerySpec] })[k] = value;
            }
          }
          return acc;
        }
        return acc;
      }, {} as QuerySpec) : null;
    },
    addQuerySpec: (state, action: PayloadAction<QuerySpec>) => {
      state.querySpecList = [...state.querySpecList.slice(0, state.querySpecIndex + 1), action.payload];
      state.querySpecIndex = state.querySpecList.length - 1;
    },
    setQuerySpecIndex: (state, action: PayloadAction<number>) => {
      state.querySpecIndex = action.payload;
    },
    addFragments: (state, action: PayloadAction<[Fragment[], Fragment[]]>) => {
      state.fragmentsList = state.fragmentsList.slice(0, state.fragmentsIndex + 1);
      state.fragmentsList.push(action.payload);
      state.fragmentsIndex = state.fragmentsList.length - 1;
    },
    setFragmentsIndex: (state, action: PayloadAction<number>) => {
      state.fragmentsIndex = action.payload;
    },
    insertTreeData: (state, action: PayloadAction<InsertTreeNode>) => {
      const { fragmentList, nodes } = action.payload;
      const findAndInsert = (tree: TreeNode[], fragmentList: FragmentList): boolean => {
        for (const node of tree) {
          if (JSON.stringify(node.value) === JSON.stringify(fragmentList)) {
            node.children = [];
            const resultsNode: TreeNode = {
              name: "Results",
              value: nodes.results
            }
            const othersNode: TreeNode = {
              name: "Others",
              value: nodes.others
            };
            node.children.push(resultsNode, othersNode);
            return true;
          }
          if (node.children) {
            const success = findAndInsert(node.children, fragmentList);
            if (success) return true;
          }
        }
        return false;
      };
      const isFind = findAndInsert([state.treeData], fragmentList);
      if (!isFind) {
        state.treeData.children = [{
          name: `${state.querySpecList[state.querySpecIndex]?.start_time}-${state.querySpecList[state.querySpecIndex]?.end_time}`,
          value: {
            ...nodes.results,
            fragments: [...nodes.results.fragments || [], ...nodes.others.fragments || []],
          },
          children: [{
            name: "Results",
            value: nodes.results
          }, {
            name: "Others",
            value: nodes.others
          }]
        }]
      }
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
    setCurTrend: (state, action: PayloadAction<number|null>) => {
      state.curTrend = action.payload;
      return state;
    },
    setCurRelation: (state, action: PayloadAction<number|null>) => {
      state.curRelation = action.payload;
      return state;
    }
  },
});

export const { setNLQuery, setQuery, setQuerySpec, addFragments, addQuerySpec, setFragmentsIndex, setQuerySpecIndex, insertTreeData, setIsSettingShow, setTimeStampUnit, setValueUnit, setAspectRatio, setIsDrawer, setQuerys, setCurRelation, setCurTrend } = stateSlice.actions;
export default stateSlice.reducer;
