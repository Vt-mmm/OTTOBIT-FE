import { Card, Typography, Chip, Box, Skeleton } from "@mui/material";

interface Props {
  totalPoints: number;
  loading: boolean;
}

export default function BadgeCard({ totalPoints, loading }: Props) {
  return (
    <Card sx={{ borderRadius: { xs: 2.5, md: 3.5 }, p: { xs: 2.5, md: 3 }, boxShadow: "0 6px 25px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.04)", bgcolor: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)" }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>🏆 Huy hiệu xuất sắc</Typography>
      <Box sx={{ textAlign: "center", p: 3, bgcolor: "#fff8e1", borderRadius: 3, border: "2px dashed #ffc107" }}>
        <Typography variant="h2" component="div">🏆</Typography>
        {loading ? (
          <>
            <Skeleton variant="text" width={120} sx={{ mx: 'auto', my: 1 }} />
            <Skeleton variant="text" width={180} sx={{ mx: 'auto' }} />
          </>
        ) : (
          <>
            <Typography variant="h5" sx={{ fontWeight: "bold", my: 1 }}>{totalPoints} Điểm</Typography>
            <Typography variant="body1" sx={{ fontWeight: "bold", color: "#f57c00" }}>Lập trình viên OttoBit</Typography>
          </>
        )}
        <Chip label="Huy hiệu mới" size="small" sx={{ mt: 1 }} />
      </Box>
    </Card>
  );
}
