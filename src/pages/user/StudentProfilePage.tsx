import React from "react";
import { Container, Box } from "@mui/material";
import { motion } from "framer-motion";
import { Header } from "layout/components/header";
import { StudentProfileSection } from "sections/user/studentProfile";

const StudentProfilePage: React.FC = () => {
  const handleStudentCreated = () => {
    // Có thể thêm logic sau khi tạo student profile thành công
    console.log("Student profile created successfully!");
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <Box
        sx={{
          flex: 1,
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          pt: { xs: 10, md: 12 },
          pb: 8,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "300px",
            background: "linear-gradient(180deg, rgba(102, 126, 234, 0.05) 0%, transparent 100%)",
            pointerEvents: "none",
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
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
    