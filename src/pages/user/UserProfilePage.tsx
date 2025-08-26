import React, { useState } from "react";
import { Container, Box, Typography, Tab, Tabs, Card } from "@mui/material";
import { Lock as LockIcon } from "@mui/icons-material";
import { motion } from "framer-motion";
import { Header } from "layout/components/header";
import {
  ProfileOverview,
  SecuritySettings,
  EditProfileDialog,
} from "sections/user/profile";
import { UpdateProfileForm } from "common/@types";
import { alpha } from "@mui/material/styles";

const UserProfilePage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEditProfile = () => {
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };

  const handleSaveProfile = (data: UpdateProfileForm) => {
    // TODO: Implement profile update logic
    console.log("Profile data to save:", data);
    setEditDialogOpen(false);
  };

  return (
    <>
      <Header />
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          pt: { xs: 10, md: 12 },
          pb: 6,
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Page Header */}
            <Box sx={{ mb: 4, textAlign: "center" }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: "bold",
                  background: "linear-gradient(45deg, #22c55e, #16a34a)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 2,
                }}
              >
                Hồ sơ cá nhân
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "text.secondary",
                  maxWidth: 600,
                  mx: "auto",
                }}
              >
                Quản lý thông tin tài khoản và bảo mật
              </Typography>
            </Box>

            {/* Profile Overview - Always visible */}
            <Box sx={{ mb: 4 }}>
              <ProfileOverview onEditProfile={handleEditProfile} />
            </Box>

            {/* Tabs for different sections */}
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(34, 197, 94, 0.15)",
                border: `1px solid ${alpha("#22c55e", 0.2)}`,
                overflow: "hidden",
              }}
            >
              <Tabs
                value={currentTab}
                onChange={(_, newValue) => setCurrentTab(newValue)}
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  "& .MuiTab-root": {
                    color: "#6b7280",
                    "&.Mui-selected": {
                      color: "#22c55e",
                    },
                  },
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#22c55e",
                  },
                }}
              >
                <Tab
                  icon={<LockIcon />}
                  label="Bảo mật"
                  iconPosition="start"
                  sx={{ textTransform: "none", fontWeight: 500 }}
                />
              </Tabs>

              <Box sx={{ p: 0 }}>
                {currentTab === 0 && <SecuritySettings />}
              </Box>
            </Card>

            {/* Edit Profile Dialog */}
            <EditProfileDialog
              open={editDialogOpen}
              onClose={handleCloseEditDialog}
              onSave={handleSaveProfile}
            />
          </motion.div>
        </Container>
      </Box>
    </>
  );
};

export default UserProfilePage;
