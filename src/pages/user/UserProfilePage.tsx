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
import { LanguageSwitcher } from "components/common";
import { UpdateProfileForm } from "common/@types";
import { useAppDispatch } from "store/config";
import {
  getMyProfileThunk,
  updateMyProfileThunk,
} from "store/account/accountSlice";
import { useLocales } from "hooks";

// Simple placeholders for future sections
function CoursesSection() {
  const { translate } = useLocales();
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        {translate("profile.CoursesTitle")}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {translate("profile.CoursesPlaceholder")}
      </Typography>
    </Paper>
  );
}
function LessonsSection() {
  const { translate } = useLocales();
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        {translate("profile.LessonsTitle")}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {translate("profile.LessonsPlaceholder")}
      </Typography>
    </Paper>
  );
}

const UserProfilePage: React.FC = () => {
  const { translate } = useLocales();
  const dispatch = useAppDispatch();
  const [section] = useState<"overview" | "courses" | "lessons" | "security">(
    "overview"
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [openNav, setOpenNav] = useState(false);

  useEffect(() => {
    // Fetch account profile on mount
    dispatch(getMyProfileThunk());
  }, [dispatch]);

  const handleEditProfile = () => setEditDialogOpen(true);
  const handleCloseEditDialog = () => setEditDialogOpen(false);

  const handleSaveProfile = async (data: UpdateProfileForm) => {
    try {
      await dispatch(updateMyProfileThunk({ data })).unwrap();
      // Refresh profile data after successful update
      await dispatch(getMyProfileThunk());
      setEditDialogOpen(false);
    } catch (error) {
      // Error is handled by Redux thunk
      console.error("Failed to update profile:", error);
    }
  };

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
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "common.white",
          position: "relative",
        }}
      >
        {/* Language Switcher - Top right */}
        <Box
          sx={{
            position: "absolute",
            top: { xs: 80, md: 90 },
            right: { xs: 16, md: 32 },
            zIndex: 999,
          }}
        >
          <LanguageSwitcher />
        </Box>

        <UserProfileHeader
          title={
            section === "overview"
              ? translate("profile.Title")
              : section === "courses"
              ? translate("profile.MyCourses")
              : section === "lessons"
              ? translate("profile.MyLessons")
              : translate("profile.AccountSecurity")
          }
          onOpenNav={() => setOpenNav(true)}
        />
        <Box sx={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
          {/* Shared Sidebar */}
          <Sidebar openNav={openNav} onCloseNav={() => setOpenNav(false)} />

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
