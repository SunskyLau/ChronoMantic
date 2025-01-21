import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FilterState {
  timeSpanScale: [number, number];
  scoreScale: [number, number];
  levelScale: [number, number];
}

const initialState: FilterState = {
  timeSpanScale: [0, 0],
  scoreScale: [0, 0],
  levelScale: [0, 0]
};

export const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setTimeSpanScale: (state, action: PayloadAction<[number, number]>) => {
      state.timeSpanScale = action.payload;
    },
    setScoreScale: (state, action: PayloadAction<[number, number]>) => {
      state.scoreScale = action.payload;
    },
    setLevelScale: (state, action: PayloadAction<[number, number]>) => {
      state.levelScale = action.payload;
    }
  },
});

export const { setScoreScale, setTimeSpanScale, setLevelScale } = filterSlice.actions;

export default filterSlice.reducer;
