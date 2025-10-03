import { Container, Typography, Stack } from "@mui/material";
import AdminLayout from "layout/admin/AdminLayout";
import CertificateListSection from "sections/admin/certificate/CertificateListSection";

export default function CertificateManagementPage() {
  return (
    <AdminLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={1} sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Quản lý chứng chỉ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Xem và quản lý các chứng chỉ đã cấp cho học viên
          </Typography>
        </Stack>
        <CertificateListSection />
      </Container>
    </AdminLayout>
  );
}
