import React from "react";
import { Container, Box } from "@mui/material";
import { motion } from "framer-motion";
import { Header } from "layout/components/header";
import { StudentProfileSection } from "sections/user/studentProfile";
import { LanguageSwitcher } from "components/common";
import { useLocales } from "hooks";

const StudentProfilePage: React.FC = () => {
  const { translate } = useLocales();

  const handleStudentCreated = () => {
    // Có thể thêm logic sau khi tạo student profile thành công
    console.log(translate("student.StudentProfileCreated"));
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

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

      <Box
        sx={{
          flex: 1,
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          pt: { xs: 8, sm: 10, md: 12 },
          pb: { xs: 4, sm: 6, md: 8 },
          px: { xs: 2, sm: 3, md: 0 },
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: { xs: "200px", md: "300px" },
            background:
              "linear-gradient(180deg, rgba(102, 126, 234, 0.05) 0%, transparent 100%)",
            pointerEvents: "none",
          },
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            position: "relative",
            zIndex: 1,
            px: { xs: 1, sm: 2, md: 3 },
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <StudentProfileSection onStudentCreated={handleStudentCreated} />
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default StudentProfilePage;
