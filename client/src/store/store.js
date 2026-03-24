import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./ui-slice";
import userReducer from "./user-slice";

const store = configureStore({
  reducer: {
    ui: uiReducer,
    user: userReducer,
  },
});

export default store;