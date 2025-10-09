import { Container, Typography, Stack } from "@mui/material";
import AdminLayout from "layout/admin/AdminLayout";
import CertificateTemplateListSection from "sections/admin/certificate-template/CertificateTemplateListSection";
import { useLocales } from "hooks";

export default function CertificateTemplateManagementPage() {
  const { translate } = useLocales();

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
            {translate("admin.certificateTemplateManagementTitle")}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            {translate("admin.certificateTemplateManagementSubtitle")}
          </Typography>
        </Stack>
        <CertificateTemplateListSection />
      </Container>
    </AdminLayout>
  );
}
