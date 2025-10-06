import { Box, Container, Typography } from "@mui/material";
import AdminLayout from "layout/admin/AdminLayout";
import StudentListSection from "sections/admin/student/StudentListSection";

export default function StudentManagementPage() {
  return (
    <AdminLayout>
      <Container
        maxWidth="xl"
        sx={{ py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 3 } }}
      >
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: "#1a1a1a",
              mb: 1,
              fontSize: { xs: "1.5rem", sm: "2.125rem" },
            }}
          >
            Quản lý Học sinh
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#666",
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            Danh sách tất cả học sinh trong hệ thống
          </Typography>
        </Box>
        <StudentListSection />
      </Container>
    </AdminLayout>
  );
}
