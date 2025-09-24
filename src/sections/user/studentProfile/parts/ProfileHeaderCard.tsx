import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import dayjs from "dayjs";
import { StudentResult } from "common/@types/student";

interface Props {
  student: StudentResult;
  onEdit: () => void;
}

export default function ProfileHeaderCard({ student, onEdit }: Props) {
  const getAge = (dateOfBirth: string) =>
    dayjs().diff(dayjs(dateOfBirth), "year");

  return (
    <Card
      sx={{
        borderRadius: { xs: 3, md: 4 },
        mb: 3,
        backgroundImage: `linear-gradient(135deg, rgba(102,126,234,0.85) 0%, rgba(118,75,162,0.85) 100%), url(/asset/PictureProfile.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(102, 126, 234, 0.25)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                width: { xs: 60, md: 80 },
                height: { xs: 60, md: 80 },
                bgcolor: "rgba(255,255,255,0.2)",
                fontSize: { xs: "1.5rem", md: "2rem" },
                fontWeight: "bold",
              }}
            >
              {student.fullname.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {student.fullname}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                ID: {student.id.slice(-6)} | {getAge(student.dateOfBirth)} tuổi
              </Typography>
              <Chip
                label="Đang hoạt động"
                size="small"
                sx={{
                  mt: 0.5,
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                }}
              />
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={onEdit}
            sx={{
              color: "white",
              borderColor: "rgba(255,255,255,0.5)",
              "&:hover": {
                borderColor: "white",
                bgcolor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Chỉnh sửa
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
