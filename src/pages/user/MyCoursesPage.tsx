import React from "react";
import { Box, Container } from "@mui/material";
import { Sidebar } from "layout/sidebar";
import { UserProfileHeader } from "layout/components/header";
import { EnrolledCoursesSection } from "sections/user/enrollment";

const MyCoursesPage: React.FC = () => {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "common.white" }}>
      <UserProfileHeader title="Khóa học của tôi" />
      <Box sx={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
        <Sidebar openNav={false} onCloseNav={() => {}} />
        <Box component="main" sx={{ flexGrow: 1, width: { lg: `calc(100% - 280px)` }, pl: { xs: 3, md: 4 } }}>
          <Container maxWidth={false} disableGutters sx={{ pt: { xs: 3, md: 4 }, pb: 6, px: 0 }}>
            <EnrolledCoursesSection />
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default MyCoursesPage;
