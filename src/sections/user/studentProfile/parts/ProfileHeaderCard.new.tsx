import { Box, Card, CardContent, Typography, Avatar, Chip, Button } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import dayjs from "dayjs";
import { StudentResult } from "common/@types/student";

interface Props {
  student: StudentResult;
  onEdit: () => void;
}

export default function ProfileHeaderCard({ student, onEdit }: Props) {
  const theme = useTheme();
  const getAge = (dateOfBirth: string) => dayjs().diff(dayjs(dateOfBirth), "year");

  const primary = theme.palette.primary.main;
  const primaryDark = theme.palette.primary.dark || primary;

  return (
    <Card sx={{
      borderRadius: { xs: 3, md: 4 },
      mb: 3,
      position: "relative",
      overflow: "hidden",
      color: "#fff",
      background: `linear-gradient(135deg, ${primary} 0%, ${primaryDark} 100%)`,
    }}>
      {/* Decorative circles */}
      <Box sx={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: '50%', bgcolor: alpha('#fff', 0.12) }} />
      <Box sx={{ position: 'absolute', right: 30, bottom: -60, width: 220, height: 220, borderRadius: '50%', bgcolor: alpha('#fff', 0.08) }} />

      <CardContent sx={{ p: { xs: 3, md: 4 }, position: 'relative' }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ width: { xs: 60, md: 80 }, height: { xs: 60, md: 80 }, bgcolor: alpha('#fff', 0.25), fontSize: { xs: "1.5rem", md: "2rem" }, fontWeight: "bold" }}>
              {student.fullname.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>{student.fullname}</Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                ID: {student.id.slice(-6)} | {getAge(student.dateOfBirth)} tuổi
              </Typography>
              <Chip label="Đang hoạt động" size="small" color="success" sx={{ mt: 0.5, bgcolor: alpha('#fff', 0.18), color: '#fff', borderColor: alpha('#fff', 0.3) }} variant="outlined" />
            </Box>
          </Box>
          <Button variant="contained" color="secondary" startIcon={<EditIcon />} onClick={onEdit} sx={{ fontWeight: 600 }}>
            Chỉnh sửa
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
