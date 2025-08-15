// @mui icons
import DashboardIcon from "@mui/icons-material/Dashboard";
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

  ];


  return { navAdmin };
}

export { useConfigSidebar };
