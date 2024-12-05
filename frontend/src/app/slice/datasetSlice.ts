import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Dataset =
  | {
      data: { [key: string]: number[] };
    } & {
      timeStamp: string[];
      datasetName: string;
      id: string;
    };

interface DatasetState {
  dataset: Dataset | null;
}
// 使用该类型定义初始 state
const initialState: DatasetState = {
  dataset: null,
};

const datasetSlice = createSlice({
  name: "dataset",
  // `createSlice` 将从 `initialState` 参数推断 state 类型
  initialState,
  reducers: {
    setDataset: (state, action: PayloadAction<Dataset>) => {
      state.dataset = action.payload;
    },
  },
});

export const { setDataset } = datasetSlice.actions;
export default datasetSlice.reducer;
