import AdminLayout from "layout/admin/AdminLayout";
import LessonResourceFormSection from "sections/admin/lessonResource/LessonResourceFormSection";
import { Box, Button, Typography, IconButton } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function LessonResourceEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
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
            Chỉnh sửa tài nguyên {id ? `#${id}` : ""}
          </Typography>
        </Box>
      </Box>
      <LessonResourceFormSection />
    </AdminLayout>
  );
}

import { Box, Button, Typography, IconButton } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function LessonResourceEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
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
            Chỉnh sửa tài nguyên {id ? `#${id}` : ""}
          </Typography>
        </Box>
      </Box>
      <LessonResourceFormSection />
    </AdminLayout>
  );
}
