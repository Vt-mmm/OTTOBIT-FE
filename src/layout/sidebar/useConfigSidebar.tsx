// @mui icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import EditLocationAltIcon from "@mui/icons-material/EditLocationAlt";
import MapIcon from "@mui/icons-material/Map";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { PATH_ADMIN } from "routes/paths";

function useConfigSidebar() {
  const navAdmin = [
    {
      missions: "Overview",
      listNav: [
        {
          title: "Dashboard",
          path: PATH_ADMIN.dashboard,
          icon: <DashboardIcon fontSize="medium" />,
        },
      ],
    },
    {
      missions: "Tools",
      listNav: [
        {
          title: "Map Designer",
          path: PATH_ADMIN.mapDesigner,
          icon: <EditLocationAltIcon fontSize="medium" />,
        },
        {
          title: "Map Management",
          path: PATH_ADMIN.mapManagement,
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
          icon: <SchoolIcon fontSize="medium" />,
        },
        {
          title: "Quản lý Bài học",
          path: PATH_ADMIN.lessonManagement,
          icon: <MenuBookIcon fontSize="medium" />,
        },
      ],
    },
  ];

  return { navAdmin };
}

export { useConfigSidebar };
