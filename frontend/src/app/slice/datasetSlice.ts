import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TimeSeriesDataset } from "../../types";

export type ColumnType = string | number;

export interface DatasetColumn {
  timeStampColumn: string;
  valueColumns: string[];
}

export interface Dataset extends DatasetColumn {
  filename: string;
  data: Record<string, ColumnType[]>;
  ratios: Record<string, number>;
  symbolData?: TimeSeriesDataset;
  selectedSymbols?: string[];
  unselectedSymbols?: string[];
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
    setColumn: (state, action: PayloadAction<DatasetColumn>) => {
      if (!state.dataset) return;
      Object.assign(state.dataset, action.payload);
    },
    setSymbolData: (state, action: PayloadAction<TimeSeriesDataset>) => {
      if (!state.dataset) return;
      state.dataset.symbolData = action.payload;
      state.dataset.selectedSymbols = Object.keys(action.payload);
      state.dataset.unselectedSymbols = [];
    },
    removeSelectedSymbol: (state, action: PayloadAction<string>) => {
      if (state.dataset && state.dataset.selectedSymbols && state.dataset.unselectedSymbols) {
        state.dataset.selectedSymbols = state.dataset.selectedSymbols.filter((item) => item !== action.payload);
        state.dataset.unselectedSymbols.push(action.payload);
      }
    },
    removeUnselectedSymbol: (state, action: PayloadAction<string>) => {
      if (state.dataset && state.dataset.selectedSymbols && state.dataset.unselectedSymbols) {
        state.dataset.unselectedSymbols = state.dataset.unselectedSymbols.filter((item) => item !== action.payload);
        state.dataset.selectedSymbols.push(action.payload);
      }
    },
    setRatios: (state, action: PayloadAction<Record<string, number>>) => {
      if (!state.dataset) return;
      state.dataset.ratios = action.payload;
    }
  },
});

export const { setDataset, setColumn, setSymbolData, removeSelectedSymbol, removeUnselectedSymbol, setRatios } = datasetSlice.actions;
export default datasetSlice.reducer;
