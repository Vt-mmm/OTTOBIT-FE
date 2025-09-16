import { Route } from "common/@types/route";
import { PATH_PUBLIC, PATH_USER } from "routes/paths";
import HomePage from "pages/user/Homepage";
import RobotStudioPage from "pages/studio/RobotStudioPage";
import UserProfilePage from "pages/user/UserProfilePage";
import CoursesPage from "pages/user/CoursesPage";
import CourseDetailPage from "pages/user/CourseDetailPage";
import LessonDetailPage from "pages/user/LessonDetailPage";
import ChallengeDetailPage from "pages/user/ChallengeDetailPage";

// Public routes - accessible without authentication
export const publicRoutes: Route[] = [
  {
    path: PATH_PUBLIC.homepage,
    component: <HomePage />,
    index: true,
  },
];

// Private routes - only for authenticated users
export const userRoutes: Route[] = [
  {
    path: PATH_USER.homepage,
    component: <HomePage />,
    index: true,
  },
  {
    path: PATH_USER.courses,
    component: <CoursesPage />,
    index: false,
  },
  {
    path: PATH_USER.courseDetail,
    component: <CourseDetailPage />,
    index: false,
  },
  {
    path: PATH_USER.lessonDetail,
    component: <LessonDetailPage />,
    index: false,
  },
  {
    path: PATH_USER.challengeDetail,
    component: <ChallengeDetailPage />,
    index: false,
  },
  {
    path: PATH_USER.studio,
    component: <RobotStudioPage />,
    index: false,
  },
  {
    path: PATH_USER.profile,
    component: <UserProfilePage />,
    index: false,
  },
];
