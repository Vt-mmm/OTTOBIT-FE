import React, { useState } from "react";
import { Container, Box } from "@mui/material";
import { motion } from "framer-motion";
import { Sidebar } from "layout/sidebar";
import { UserProfileHeader } from "layout/components/header";
import { SecuritySettings } from "sections/user/profile";
import { LanguageSwitcher } from "components/common";
import { useLocales } from "hooks";

const SecuritySettingsPage: React.FC = () => {
  const { translate } = useLocales();
  const [openNav, setOpenNav] = useState(false);

  return (
    <>
      <Box sx={{ minHeight: "100vh", bgcolor: "common.white", position: "relative" }}>
        <UserProfileHeader 
          title={translate("profile.SecuritySettingsTitle")} 
          onOpenNav={() => setOpenNav(true)}
        />

        {/* Language Switcher */}
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
                    maxWidth: 880,
                    mx: "auto",
                    px: { xs: 2, md: 4 },
                  }}
                >
                  <SecuritySettings />
                </Box>
              </motion.div>
            </Container>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default SecuritySettingsPage;
