import { Route } from "common/@types";
import { lazy } from "react";
import OttobitDashboardPage from "pages/admin/OttobitDashboardPage";
import { PATH_ADMIN } from "routes/paths";

// Lazy load admin pages
const ChallengeDesignerPage = lazy(
  () => import("pages/admin/ChallengeDesignerPage")
);
const MapDesignerPage = lazy(() => import("pages/admin/MapDesignerPage"));
const CourseManagementPage = lazy(
  () => import("pages/admin/CourseManagementPage")
);
const LessonManagementPage = lazy(
  () => import("pages/admin/LessonManagementPage")
);
const ChallengeManagementPage = lazy(
  () => import("pages/admin/ChallengeManagementPage")
);
const StudentManagementPage = lazy(
  () => import("pages/admin/StudentManagementPage")
);
const EnrollmentManagementPage = lazy(
  () => import("pages/admin/EnrollmentManagementPage")
);
const MapManagementPage = lazy(() => import("pages/admin/MapManagementPage"));
const RobotManagementPage = lazy(
  () => import("pages/admin/RobotManagementPage")
);
const ComponentManagementPage = lazy(
  () => import("pages/admin/ComponentManagementPage")
);
const LessonResourceManagementPage = lazy(
  () => import("pages/admin/LessonResourceManagementPage")
);
const LessonResourceCreatePage = lazy(
  () => import("pages/admin/LessonResourceCreatePage")
);
const LessonResourceEditPage = lazy(
  () => import("pages/admin/LessonResourceEditPage")
);
const LessonResourceDetailPage = lazy(
  () => import("pages/admin/LessonResourceDetailPage")
);
const AdminTestPage = lazy(() => import("pages/admin/AdminTestPage"));
const ActivationCodeManagementPage = lazy(
  () => import("pages/admin/ActivationCodeManagementPage")
);

export const adminRoutes: Route[] = [
  {
    path: PATH_ADMIN.dashboard,
    component: <OttobitDashboardPage />,
    index: true,
  },
  {
    path: PATH_ADMIN.challengeDesigner,
    component: <ChallengeDesignerPage />,
    index: false,
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
    path: PATH_ADMIN.robotManagement,
    component: <RobotManagementPage />,
    index: false,
  },
  {
    path: PATH_ADMIN.componentManagement,
    component: <ComponentManagementPage />,
    index: false,
  },
  {
    path: PATH_ADMIN.lessonResourceManagement,
    component: <LessonResourceManagementPage />,
    index: false,
  },
  {
    path: `${PATH_ADMIN.lessonResourceManagement}/create`,
    component: <LessonResourceCreatePage />,
    index: false,
  },
  {
    path: `${PATH_ADMIN.lessonResourceManagement}/:id/edit`,
    component: <LessonResourceEditPage />,
    index: false,
  },
  {
    path: `${PATH_ADMIN.lessonResourceManagement}/:id`,
    component: <LessonResourceDetailPage />,
    index: false,
  },
  {
    path: PATH_ADMIN.activationCodeManagement,
    component: <ActivationCodeManagementPage />,
    index: false,
  },
  {
    path: "/admin/test",
    component: <AdminTestPage />,
    index: false,
  },
];
