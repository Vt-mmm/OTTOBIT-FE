import AdminLayout from "layout/admin/AdminLayout";
import { Container, Box, Typography } from "@mui/material";
import MapListSection from "sections/admin/map/MapListSection";
import useLocales from "hooks/useLocales";

export default function MapManagementPage() {
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
            {translate("admin.mapManagementTitle")}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#666",
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            {translate("admin.mapManagementSubtitle")}
          </Typography>
        </Box>
        <MapListSection />
      </Container>
    </AdminLayout>
  );
}
