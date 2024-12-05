import { configureStore } from "@reduxjs/toolkit";
import counterSlice from "./slice/counterSlice";
import datasetSlice from "./slice/datasetSlice";
import stateSlice from "./slice/stateSlice";
import resultSlice from "./slice/resultsSlice";
// ...

const store = configureStore({
  reducer: {
    counter: counterSlice,
    dataset: datasetSlice,
    states: stateSlice,
    results: resultSlice,
  },
});

// 从 store 本身推断 `RootState` 和 `AppDispatch` 类型
export type RootState = ReturnType<typeof store.getState>;
// 推断类型：{posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export default store;
