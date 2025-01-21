import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SelectState {
    range: [number, number],
    brushPosition: [number, number]
}

const initialState: SelectState = {
    range: [0, 0],
    brushPosition: [0, 0]
};

export const selectSlice = createSlice({
    name: "filter",
    initialState,
    reducers: {
        setRange(state, action: PayloadAction<[number, number]>) {
            state.range = action.payload;
        },
        setBrushPosition(state, action: PayloadAction<[number, number]>) {
            state.brushPosition = action.payload;
        }
    },
});

export const { setRange, setBrushPosition } = selectSlice.actions;

export default selectSlice.reducer;