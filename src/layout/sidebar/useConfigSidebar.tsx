// @mui icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import EditLocationAltIcon from "@mui/icons-material/EditLocationAlt";
import MapIcon from "@mui/icons-material/Map";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import QuizIcon from "@mui/icons-material/Quiz";
import PersonIcon from "@mui/icons-material/Person";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import SecurityIcon from "@mui/icons-material/Security";
import { PATH_ADMIN, PATH_USER } from "routes/paths";

function useConfigSidebar() {
  const navAdmin = [
    {
      missions: "Overview",
      listNav: [
        {
          title: "Dashboard",
          path: PATH_ADMIN.dashboard,
          icon: <DashboardIcon fontSize="small" />,
        },
      ],
    },
    {
      missions: "Tools",
      listNav: [
        {
          title: "Map Designer",
          path: PATH_ADMIN.mapDesigner,
          icon: <EditLocationAltIcon fontSize="small" />,
        },
        {
          title: "Map Management",
          path: PATH_ADMIN.mapManagement,
          icon: <MapIcon fontSize="small" />,
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
          title: "Quản lý Thử thách",
          path: PATH_ADMIN.challengeManagement,
          icon: <QuizIcon fontSize="small" />,
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
