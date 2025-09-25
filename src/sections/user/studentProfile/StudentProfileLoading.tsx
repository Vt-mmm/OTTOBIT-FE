import { Card, CardContent, CircularProgress, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

export default function StudentProfileLoading() {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 8px 32px rgba(34, 197, 94, 0.15)",
        border: `1px solid ${alpha("#22c55e", 0.2)}`,
      }}
    >
      <CardContent sx={{ textAlign: "center", py: 6 }}>
        <CircularProgress color="primary" size={48} />
        <Typography variant="body1" sx={{ mt: 2, color: "text.secondary" }}>
          Đang kiểm tra thông tin hồ sơ học sinh...
        </Typography>
      </CardContent>
    </Card>
  );
}
