import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SelectState {
    range: [number, number],
    brushPosition: [number, number],
    selectPosition: [number, number]
}

const initialState: SelectState = {
    range: [0, 0],
    brushPosition: [0, 0],
    selectPosition: [0, 0]
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
        },
        setSelectPosition(state, action: PayloadAction<[number, number]>) {
            state.selectPosition = action.payload;
        },
    },
});

export const { setRange, setBrushPosition, setSelectPosition } = selectSlice.actions;

export default selectSlice.reducer;