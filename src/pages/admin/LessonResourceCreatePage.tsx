import AdminLayout from "layout/admin/AdminLayout";
import LessonResourceFormSection from "sections/admin/lessonResource/LessonResourceFormSection";
import { Box, Button, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

export default function LessonResourceCreatePage() {
  const navigate = useNavigate();
  return (
    <AdminLayout>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} size="small" sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Quản lý Tài nguyên Học Tập
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Thêm tài nguyên
          </Typography>
        </Box>
      </Box>
      <LessonResourceFormSection />
    </AdminLayout>
  );
}

import { Box, Button, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

export default function LessonResourceCreatePage() {
  const navigate = useNavigate();
  return (
    <AdminLayout>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} size="small" sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Quản lý Tài nguyên Học Tập
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Thêm tài nguyên
          </Typography>
        </Box>
      </Box>
      <LessonResourceFormSection />
    </AdminLayout>
  );
}
