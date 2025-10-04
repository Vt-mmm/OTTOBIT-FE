import { Container, Typography, Stack } from "@mui/material";
import AdminLayout from "layout/admin/AdminLayout";
import CertificateTemplateListSection from "sections/admin/certificate-template/CertificateTemplateListSection";

export default function CertificateTemplateManagementPage() {
  return (
    <AdminLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={1} sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Quản lý mẫu chứng chỉ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tạo và quản lý mẫu chứng chỉ cho các khóa học
          </Typography>
        </Stack>
        <CertificateTemplateListSection />
      </Container>
    </AdminLayout>
  );
}
