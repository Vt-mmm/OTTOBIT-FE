import { Box, Typography, Paper, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PATH_ADMIN } from "routes/paths";

export default function AdminTestPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          🎉 Admin Access Success!
        </Typography>
        <Typography variant="body1" paragraph>
          You can now access the admin page without logging in!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This is for development purposes only. Remember to enable
          authentication when deploying to production.
        </Typography>
      </Paper>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Button
          variant="contained"
          onClick={() => navigate(PATH_ADMIN.dashboard)}
        >
          Dashboard
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate(PATH_ADMIN.mapDesigner)}
        >
          Map Designer
        </Button>
        <Button variant="outlined" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </Box>

      <Paper sx={{ p: 2, mt: 3, bgcolor: "#f5f5f5" }}>
        <Typography variant="h6" gutterBottom>
          📝 Changes made:
        </Typography>
        <ul>
          <li>Skip authentication check in AdminRouter</li>
          <li>Allow direct access to /admin</li>
          <li>Disable admin redirect in PublicRouter</li>
        </ul>
      </Paper>
    </Box>
  );
}
