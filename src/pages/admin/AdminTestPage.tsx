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
          Bạn đã có thể truy cập trang admin mà không cần đăng nhập!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Điều này chỉ dành cho mục đích phát triển. Hãy nhớ bật lại
          authentication khi deploy production.
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
          Về Trang Chủ
        </Button>
      </Box>

      <Paper sx={{ p: 2, mt: 3, bgcolor: "#f5f5f5" }}>
        <Typography variant="h6" gutterBottom>
          📝 Các thay đổi đã thực hiện:
        </Typography>
        <ul>
          <li>Bỏ qua authentication check trong AdminRouter</li>
          <li>Cho phép truy cập trực tiếp /admin</li>
          <li>Tắt redirect admin trong PublicRouter</li>
        </ul>
      </Paper>
    </Box>
  );
}
