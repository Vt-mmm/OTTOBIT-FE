import { Box, Container } from "@mui/material";
import AdminLayout from "layout/admin/AdminLayout";
import ActivationCodeListSection from "sections/admin/activationCode/ActivationCodeListSection";

export default function ActivationCodeManagementPage() {
  return (
    <AdminLayout>
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Container maxWidth="xl">
          <ActivationCodeListSection />
        </Container>
      </Box>
    </AdminLayout>
  );
}