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
import SmartToyIcon from "@mui/icons-material/SmartToy";
import MemoryIcon from "@mui/icons-material/Memory";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import DescriptionIcon from "@mui/icons-material/Description";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { PATH_ADMIN, PATH_USER } from "routes/paths";
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";

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
          title: "Quản lý Tài nguyên Học Tập",
          path: PATH_ADMIN.lessonResourceManagement,
          icon: <CollectionsBookmarkIcon fontSize="small" />,
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
        {
          title: "Quản lý Robot",
          path: PATH_ADMIN.robotManagement,
          icon: <SmartToyIcon fontSize="small" />,
        },
        {
          title: "Quản lý Linh kiện",
          path: PATH_ADMIN.componentManagement,
          icon: <MemoryIcon fontSize="small" />,
        },
        {
          title: "Quản lý Mã kích hoạt",
          path: PATH_ADMIN.activationCodeManagement,
          icon: <ConfirmationNumberIcon fontSize="small" />,
        },
        {
          title: "Quản lý Chứng chỉ",
          path: PATH_ADMIN.certificateManagement,
          icon: <CardMembershipIcon fontSize="small" />,
        },
        {
          title: "Quản lý Mẫu Chứng chỉ",
          path: PATH_ADMIN.certificateTemplateManagement,
          icon: <DescriptionIcon fontSize="small" />,
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
    {
      missions: "Quản lý bán hàng",
      listNav: [
        {
          title: "Quản lý Đơn hàng",
          path: PATH_ADMIN.orders,
          icon: <ShoppingCartIcon fontSize="small" />,
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
          title: "Đơn hàng của tôi",
          path: PATH_USER.orders,
          icon: <ShoppingBagIcon fontSize="small" />,
        },
        {
          title: "Bảo mật",
          path: PATH_USER.security,
          icon: <SecurityIcon fontSize="small" />,
        },
      ],
    },
    // NOTE: "Học tập" section removed - myCourses moved to Student Profile tabs
  ];

  return { navAdmin, navUser };
}

export { useConfigSidebar };
