import { Route } from "common/@types";
import { lazy } from "react";
import OttobitDashboardPage from "pages/admin/OttobitDashboardPage";
import { PATH_ADMIN } from "routes/paths";

// Lazy load admin pages
const MapDesignerPage = lazy(() => import("pages/admin/MapDesignerPage"));
const MapManagementPage = lazy(() => import("pages/admin/MapManagementPage"));
const CourseManagementPage = lazy(() => import("pages/admin/CourseManagementPage"));
const LessonManagementPage = lazy(() => import("pages/admin/LessonManagementPage"));
const ChallengeManagementPage = lazy(() => import("pages/admin/ChallengeManagementPage"));
const StudentManagementPage = lazy(() => import("pages/admin/StudentManagementPage"));
const EnrollmentManagementPage = lazy(() => import("pages/admin/EnrollmentManagementPage"));
const AdminTestPage = lazy(() => import("pages/admin/AdminTestPage"));

export const adminRoutes: Route[] = [
  {
    path: PATH_ADMIN.dashboard,
    component: <OttobitDashboardPage />,
    index: true,
  },
  {
    path: PATH_ADMIN.mapDesigner,
    component: <MapDesignerPage />,
    index: false,
  },
  {
    path: PATH_ADMIN.mapManagement,
    component: <MapManagementPage />,
    index: false,
  },
  {
    path: PATH_ADMIN.courseManagement,
    component: <CourseManagementPage />,
    index: false,
  },
  {
    path: PATH_ADMIN.lessonManagement,
    component: <LessonManagementPage />,
    index: false,
  },
  {
    path: PATH_ADMIN.challengeManagement,
    component: <ChallengeManagementPage />,
    index: false,
  },
  {
    path: PATH_ADMIN.studentManagement,
    component: <StudentManagementPage />,
    index: false,
  },
  {
    path: PATH_ADMIN.enrollmentManagement,
    component: <EnrollmentManagementPage />,
    index: false,
  },
  {
    path: "/admin/test",
    component: <AdminTestPage />,
    index: false,
  },
];
