import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import authReducer from "./auth/authSlice";
import accountReducer from "./account/accountSlice";
import studentReducer from "./student/studentSlice";
import courseReducer from "./course/courseSlice";
import enrollmentReducer from "./enrollment/enrollmentSlice";
import submissionReducer from "./submission/submissionSlice";
import lessonReducer from "./lesson/lessonSlice";
import challengeReducer from "./challenge/challengeSlice";
import mapReducer from "./map/mapSlice";
import lessonProgressReducer from "./lessonProgress/lessonProgressSlice";
import imageReducer from "./image/imageSlice";
import componentReducer from "./component/componentSlice";
import robotReducer from "./robot/robotSlice";
import courseMapReducer from "./courseMap/courseMapSlice";
import courseRobotReducer from "./courseRobot/courseRobotSlice";
import activationCodeReducer from "./activationCode/activationCodeSlice";
import robotComponentReducer from "./robotComponent/robotComponentSlice";
import certificateReducer from "./certificate/certificateSlice";
import certificateTemplateReducer from "./certificateTemplate/certificateTemplateSlice";
import cartReducer from "./cart/cartSlice";
import orderReducer from "./order/orderSlice";
import orderItemReducer from "./orderItem/orderItemSlice";
import paymentReducer from "./payment/paymentSlice";
import lessonNoteReducer from "./lessonNote/lessonNoteSlice";
import aiReducer from "./ai/aiSlice";

export const ottobit = configureStore({
  reducer: {
    auth: authReducer,
    account: accountReducer,
    student: studentReducer,
    course: courseReducer,
    enrollment: enrollmentReducer,
    submission: submissionReducer,
    lesson: lessonReducer,
    challenge: challengeReducer,
    map: mapReducer, // ⭐️ NEW: Map management
    lessonProgress: lessonProgressReducer, // ⭐️ NEW: Lesson progress tracking
    image: imageReducer, // ⭐️ NEW: Image management
    component: componentReducer, // ⭐️ NEW: Component management
    robot: robotReducer, // ⭐️ NEW: Robot management
    courseMap: courseMapReducer, // ⭐️ NEW: CourseMap management
    courseRobot: courseRobotReducer, // ⭐️ NEW: CourseRobot (Course-Robot relationship)
    activationCode: activationCodeReducer, // ⭐️ NEW: ActivationCode (Robot activation codes)
    robotComponent: robotComponentReducer, // ⭐️ NEW: RobotComponent (Robot-Component relationship)
    certificate: certificateReducer, // ⭐️ NEW: Certificate management
    certificateTemplate: certificateTemplateReducer, // ⭐️ NEW: CertificateTemplate management
    cart: cartReducer, // ⭐️ NEW: Cart management
    order: orderReducer, // ⭐️ NEW: Order management
    orderItem: orderItemReducer, // ⭐️ NEW: OrderItem management
    payment: paymentReducer, // ⭐️ NEW: Payment management
    lessonNote: lessonNoteReducer, // ⭐️ NEW: LessonNote management
    ai: aiReducer, // ⭐️ NEW: AI Assistant (Course recommendations & solution hints)
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
