import { configureStore } from "@reduxjs/toolkit";
import dashboardReducer from "./slices/dashboardSlice";
import profileReducer from "./slices/profileSlice";
import walletReducer from "./slices/walletSlice";


export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    profile: profileReducer,
    wallet: walletReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
