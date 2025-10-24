import AdminLayout from "layout/admin/AdminLayout";
import LessonResourceFormSection from "sections/admin/lessonResource/LessonResourceFormSection";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import useLocales from "hooks/useLocales";

export default function LessonResourceEditPage() {
  const { translate } = useLocales();
  const navigate = useNavigate();
  const { id } = useParams();
  return (
    <AdminLayout>
      <Box sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {translate("admin.lessonResourceManagement")}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            {translate("admin.editResourceTitle")} {id ? `#${id}` : ""}
          </Typography>
        </Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 1, alignSelf: "flex-start" }}
          variant="text"
          color="inherit"
        >
          {translate("admin.backButton")}
        </Button>
      </Box>
      <LessonResourceFormSection
        id={id}
        onSuccess={() => navigate("/admin/lesson-resource-management")}
      />
    </AdminLayout>
  );
}

// duplicate removed
