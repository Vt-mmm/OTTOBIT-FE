// @mui icons
import DashboardIcon from "@mui/icons-material/Dashboard";
// Removed Map-specific icons; using QuizIcon to represent Challenge
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import QuizIcon from "@mui/icons-material/Quiz";
import MapIcon from "@mui/icons-material/Map";
import PersonIcon from "@mui/icons-material/Person";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import SecurityIcon from "@mui/icons-material/Security";
import { PATH_ADMIN, PATH_USER } from "routes/paths";

function useConfigSidebar() {
  const navAdmin = [
    {
      missions: "Tổng quan",
      listNav: [
        {
          title: "Bảng điều khiển",
          path: PATH_ADMIN.dashboard,
          icon: <DashboardIcon fontSize="small" />,
        },
      ],
    },
    {
      missions: "Công cụ",
      listNav: [
        {
          title: "Thiết kế Thử thách",
          path: PATH_ADMIN.challengeDesigner,
          icon: <QuizIcon fontSize="medium" />,
        },
        {
          title: "Thiết kế Bản đồ",
          path: PATH_ADMIN.mapDesigner,
          icon: <MapIcon fontSize="medium" />,
        },
      ],
    },
    {
      missions: "Quản lý nội dung",
      listNav: [
        {
          title: "Quản lý Khóa học",
          path: PATH_ADMIN.courseManagement,
          icon: <SchoolIcon fontSize="small" />,
        },
        {
          title: "Quản lý Bài học",
          path: PATH_ADMIN.lessonManagement,
          icon: <MenuBookIcon fontSize="small" />,
        },
        {
          title: "Quản lý thử thách",
          path: PATH_ADMIN.challengeManagement,
          icon: <QuizIcon fontSize="small" />,
        },

        {
          title: "Quản lý Bản đồ",
          path: PATH_ADMIN.mapManagement,
          icon: <MapIcon fontSize="medium" />,
        },
      ],
    },
    {
      missions: "Quản lý người dùng",
      listNav: [
        {
          title: "Quản lý Học viên",
          path: PATH_ADMIN.studentManagement,
          icon: <PersonIcon fontSize="small" />,
        },
        {
          title: "Quản lý Ghi danh",
          path: PATH_ADMIN.enrollmentManagement,
          icon: <LibraryBooksIcon fontSize="small" />,
        },
      ],
    },
  ];

  const navUser = [
    {
      missions: "Tài khoản",
      listNav: [
        {
          title: "Hồ sơ",
          path: PATH_USER.profile,
          icon: <PersonIcon fontSize="small" />,
        },
        {
          title: "Bảo mật",
          path: PATH_USER.security,
          icon: <SecurityIcon fontSize="small" />,
        },
      ],
    },
    {
      missions: "Học tập",
      listNav: [
        {
          title: "Khóa học",
          path: PATH_USER.myCourses,
          icon: <SchoolIcon fontSize="small" />,
        },
      ],
    },
  ];

  return { navAdmin, navUser };
}

export { useConfigSidebar };
