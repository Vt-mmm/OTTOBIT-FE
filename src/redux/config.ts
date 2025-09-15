import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import authReducer from "./auth/authSlice";
import accountReducer from "./account/accountSlice";
import mapReducer from "./map/mapSlice";
import lessonProcessReducer from "./lessonProcess/lessonProcessSlice";
import studentReducer from "./student/studentSlice";
import courseReducer from "./course/courseSlice";
import enrollmentReducer from "./enrollment/enrollmentSlice";
import submissionReducer from "./submission/submissionSlice";
import lessonReducer from "./lesson/lessonSlice";
import challengeReducer from "./challenge/challengeSlice";

export const ottobit = configureStore({
  reducer: {
    auth: authReducer,
    account: accountReducer,
    map: mapReducer,
    lessonProcess: lessonProcessReducer,
    student: studentReducer,
    course: courseReducer,
    enrollment: enrollmentReducer,
    submission: submissionReducer,
    lesson: lessonReducer,
    challenge: challengeReducer,
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
