import { Box, Container, Typography } from "@mui/material";
import { useAppSelector } from "store/config";
import AdminLayout from "layout/admin/AdminLayout";

const OttobitDashboardPage = () => {
  const { userAuth } = useAppSelector((state) => state.auth);

  return (
    <AdminLayout>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 600, color: "#2c3e50", mb: 1 }}
          >
            Hello, {userAuth?.username || "Admin"}! 👋
          </Typography>
          <Typography variant="body1" sx={{ color: "#64748b" }}>
            Welcome back to the Ottobit admin dashboard
          </Typography>
        </Box>

        {/* Content will be added here based on requirements */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ color: "#64748b" }}>
            Dashboard content is being developed...
          </Typography>
        </Box>
      </Container>
    </AdminLayout>
  );
};

export default OttobitDashboardPage;
