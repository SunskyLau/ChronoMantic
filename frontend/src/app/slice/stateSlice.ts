import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FragmentList, QuerySpec } from "../../types/QuerySpec";
import { InsertTreeNode, TreeNode } from "../../types/Tree";

export type States = {
  NLQuery: string;
  querySpec: QuerySpec | null;
  ratio: number;
  fragments: FragmentList | null;
  currentFragments: FragmentList | null;
  treeData: TreeNode;
};

// 使用该类型定义初始 state
const initialState: States = {
  NLQuery: "",
  querySpec: null,
  fragments: null,
  currentFragments: null,
  ratio: 1,
  treeData: { name: "Source" }
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
    },
    setCurrentFragments: (state, action: PayloadAction<FragmentList | null>) => {
      state.currentFragments = action.payload;
    },
    setQuerySpecList: (state, action: PayloadAction<QuerySpec[]>) => {
      state.querySpec = action.payload.at(-1) || null;
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
          name: `${state.querySpec?.valueColumnName}-${state.querySpec?.timeGranularity}`,
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
  },
});

export const { setNLQuery, setQuerySpec, setRatio, setFragments, setQuerySpecList, setCurrentFragments, insertTreeData } = stateSlice.actions;
export default stateSlice.reducer;
