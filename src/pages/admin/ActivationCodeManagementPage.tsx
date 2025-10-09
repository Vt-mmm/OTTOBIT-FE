import { Box, Container, Typography } from "@mui/material";
import AdminLayout from "layout/admin/AdminLayout";
import ActivationCodeListSection from "sections/admin/activationCode/ActivationCodeListSection";
import { useLocales } from "hooks";

export default function ActivationCodeManagementPage() {
  const { translate } = useLocales();

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
            {translate("admin.activationCodeManagementTitle")}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#666",
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            {translate("admin.activationCodeManagementSubtitle")}
          </Typography>
        </Box>
        <ActivationCodeListSection />
      </Container>
    </AdminLayout>
  );
}
