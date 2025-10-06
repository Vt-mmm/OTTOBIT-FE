import { Container, Typography, Stack } from "@mui/material";
import AdminLayout from "layout/admin/AdminLayout";
import CertificateListSection from "sections/admin/certificate/CertificateListSection";

export default function CertificateManagementPage() {
  return (
    <AdminLayout>
      <Container
        maxWidth="xl"
        sx={{ py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 3 } }}
      >
        <Stack spacing={1} sx={{ mb: { xs: 3, sm: 4 } }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              fontSize: { xs: "1.5rem", sm: "2.125rem" },
            }}
          >
            Quản lý chứng chỉ
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            Xem và quản lý các chứng chỉ đã cấp cho học viên
          </Typography>
        </Stack>
        <CertificateListSection />
      </Container>
    </AdminLayout>
  );
}
