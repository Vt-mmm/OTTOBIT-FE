import { Box } from "@mui/material";
import React, { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        padding: 3,
      }}
    >
      {/* Here you would typically include a Sidebar, Navbar, etc. */}
      {/* For now we'll just render the children directly */}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 3,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
