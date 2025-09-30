import { useEffect } from "react";
import { Box, Container } from "@mui/material";
import { motion } from "framer-motion";
import { Sidebar } from "layout/sidebar";
import { UserProfileHeader } from "layout/components/header";
import MyRobotsSection from "sections/user/myrobots/MyRobotsSection";

export default function MyRobotsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "common.white" }}>
      <UserProfileHeader title="Robots của tôi" />
      <Box sx={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
        {/* Shared Sidebar */}
        <Sidebar openNav={false} onCloseNav={() => {}} />

        {/* Main content area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { lg: `calc(100% - 280px)` },
            bgcolor: "common.white",
            pl: { xs: 3, md: 4 },
          }}
        >
          <Container
            maxWidth={false}
            disableGutters
            sx={{ pt: { xs: 3, md: 4 }, pb: 6, px: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  maxWidth: 1080,
                  mx: "auto",
                  px: { xs: 2, md: 4 },
                }}
              >
                <MyRobotsSection />
              </Box>
            </motion.div>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
