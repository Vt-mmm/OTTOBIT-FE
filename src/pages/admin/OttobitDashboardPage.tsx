import { Box, Container, Typography } from "@mui/material";
import { useAppSelector } from "store/config";
import AdminLayout from "layout/admin/AdminLayout";

const OttobitDashboardPage = () => {
  const { userAuth } = useAppSelector((state) => state.auth);

  return (
    <AdminLayout>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: "#2c3e50",
              mb: 1,
              fontSize: { xs: "1.5rem", sm: "2.125rem" },
            }}
          >
            Hello, {userAuth?.username || "Admin"}! 👋
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "#64748b", fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            Welcome back to the Ottobit admin dashboard
          </Typography>
        </Box>

        {/* Content will be added here based on requirements */}
        <Box sx={{ mt: { xs: 3, sm: 4 } }}>
          <Typography
            variant="h6"
            sx={{ color: "#64748b", fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            Dashboard content is being developed...
          </Typography>
        </Box>
      </Container>
    </AdminLayout>
  );
};

export default OttobitDashboardPage;
