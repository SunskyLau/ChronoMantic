import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SelectState {
    range: [number, number]
}

const initialState: SelectState = {
    range: [0, 0]
};

export const selectSlice = createSlice({
    name: "filter",
    initialState,
    reducers: {
        setRange(state, action: PayloadAction<[number, number]>) {
            state.range = action.payload;
        }
    },
});

export const { setRange } = selectSlice.actions;

export default selectSlice.reducer;