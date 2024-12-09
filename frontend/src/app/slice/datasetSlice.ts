import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Dataset = {
  data: Record<string, number[]>;
  timeStampColumnName: string;
  timeStamp: string[];
  datasetName: string;
  id?: string;
};

interface DatasetState {
  dataset: Dataset | null;
}

const initialState: DatasetState = {
  dataset: null,
};

const datasetSlice = createSlice({
  name: "dataset",
  initialState,
  reducers: {
    setDataset: (state, action: PayloadAction<Dataset>) => {
      state.dataset = action.payload;
    },
  },
});

export const { setDataset } = datasetSlice.actions;
export default datasetSlice.reducer;
