import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ApproximationSegmentsContainers } from "../../types";

interface approximationState {
  results: ApproximationSegmentsContainers | null;
  source: string | null;
  level: number;
}

const initialState: approximationState = {
  results: null,
  source: null,
  level: 0,
};

export const approximationSlice = createSlice({
  name: "approximation",
  initialState,
  reducers: {
    setResults: (state, action: PayloadAction<ApproximationSegmentsContainers>) => {
      state.results = action.payload;
    },
    setSource: (state, action: PayloadAction<string>) => {
      state.source = action.payload;
    },
    setLevel: (state, action: PayloadAction<number>) => {
      state.level = action.payload;
    },
  },
});

export const { setResults, setSource, setLevel } = approximationSlice.actions;

export default approximationSlice.reducer;
