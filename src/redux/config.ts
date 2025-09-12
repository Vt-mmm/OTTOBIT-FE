import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import authReducer from "./auth/authSlice";
import accountReducer from "./account/accountSlice";
import mapReducer from "./map/mapSlice";
import lessonProcessReducer from "./lessonProcess/lessonProcessSlice";

export const ottobit = configureStore({
  reducer: {
    auth: authReducer,
    account: accountReducer,
    map: mapReducer,
    lessonProcess: lessonProcessReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof ottobit.getState>;
export type AppDispatch = typeof ottobit.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
