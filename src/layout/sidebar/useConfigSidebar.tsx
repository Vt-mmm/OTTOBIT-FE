// @mui icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import EditLocationAltIcon from "@mui/icons-material/EditLocationAlt";
import MapIcon from "@mui/icons-material/Map";
import { PATH_ADMIN } from "routes/paths";

function useConfigSidebar() {
  const navAdmin = [
    {
      missions: "Tổng quan",
      listNav: [
        {
          title: "Dashboard",
          path: PATH_ADMIN.dashboard,
          icon: <DashboardIcon fontSize="medium" />,
        },
      ],
    },
    {
      missions: "Công cụ",
      listNav: [
        {
          title: "Thiết kế Map",
          path: PATH_ADMIN.mapDesigner,
          icon: <EditLocationAltIcon fontSize="medium" />,
        },
        {
          title: "Quản lý Map",
          path: PATH_ADMIN.mapManagement,
          icon: <MapIcon fontSize="medium" />,
        },
      ],
    },
  ];

  return { navAdmin };
}

export { useConfigSidebar };
