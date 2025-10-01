import AdminLayout from "layout/admin/AdminLayout";
import LessonResourceFormSection from "sections/admin/lessonResource/LessonResourceFormSection";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function LessonResourceEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  return (
    <AdminLayout>
      <Box sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Quản lý Tài nguyên Học Tập
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            Chỉnh sửa tài nguyên {id ? `#${id}` : ""}
          </Typography>
        </Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 1, alignSelf: "flex-start" }}
          variant="text"
          color="inherit"
        >
          Quay lại
        </Button>
      </Box>
      <LessonResourceFormSection />
    </AdminLayout>
  );
}

// duplicate removed
