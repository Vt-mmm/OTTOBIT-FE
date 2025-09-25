import React, { useEffect, useState } from "react";
import { Container, Box, Typography, Paper } from "@mui/material";

import { motion } from "framer-motion";

import { Sidebar } from "layout/sidebar";
import { UserProfileHeader } from "layout/components/header";
import {
  ProfileOverview,
  SecuritySettings,
  EditProfileDialog,
} from "sections/user/profile";
import { UpdateProfileForm } from "common/@types";
import { useAppDispatch } from "store/config";
import { getMyProfileThunk } from "store/account/accountSlice";

// Simple placeholders for future sections
function CoursesSection() {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        Khóa học đã tham gia
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Sẽ hiển thị danh sách khóa học của bạn tại đây.
      </Typography>
    </Paper>
  );
}
function LessonsSection() {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        Bài học gần đây
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Sẽ hiển thị danh sách bài học bạn đã tham gia tại đây.
      </Typography>
    </Paper>
  );
}

const UserProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [section] = useState<"overview" | "courses" | "lessons" | "security">(
    "overview"
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch account profile on mount
    dispatch(getMyProfileThunk());
  }, [dispatch]);

  const handleEditProfile = () => setEditDialogOpen(true);
  const handleCloseEditDialog = () => setEditDialogOpen(false);
  const handleSaveProfile = (_data: UpdateProfileForm) =>
    setEditDialogOpen(false);

  const renderContent = () => {
    switch (section) {
      case "overview":
        return (
          <Box
            sx={{
              display: "block",
            }}
          >
            <ProfileOverview onEditProfile={handleEditProfile} />
          </Box>
        );
      case "courses":
        return <CoursesSection />;
      case "lessons":
        return <LessonsSection />;
      case "security":
        return <SecuritySettings />;
      default:
        return null;
    }
  };

  return (
    <>
      <Box sx={{ minHeight: "100vh", bgcolor: "common.white" }}>
        <UserProfileHeader
          title={
            section === "overview"
              ? "Hồ sơ cá nhân"
              : section === "courses"
              ? "Khóa học của tôi"
              : section === "lessons"
              ? "Bài học của tôi"
              : "Bảo mật tài khoản"
          }
        />
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
                  {renderContent()}
                </Box>

                {/* Edit Profile Dialog */}
                <EditProfileDialog
                  open={editDialogOpen}
                  onClose={handleCloseEditDialog}
                  onSave={handleSaveProfile}
                />
              </motion.div>
            </Container>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default UserProfilePage;
