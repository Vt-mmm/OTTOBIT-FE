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
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Student Profile Section */}
            <StudentProfileSection onStudentCreated={handleStudentCreated} />

          </motion.div>
        </Container>
      </Box>
    </>
  );
};

export default StudentProfilePage;