import AdminLayout from "layout/admin/AdminLayout";
import { Container, Box, Typography } from "@mui/material";
import ChallengeListSection from "sections/admin/challenge/ChallengeListSection";
import { useNavigate } from "react-router-dom";

export default function ChallengeManagementPage() {
  const navigate = useNavigate();
  return (
    <AdminLayout>
      <Container
        maxWidth="xl"
        sx={{ py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 3 } }}
      >
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: "#1a1a1a",
              mb: 1,
              fontSize: { xs: "1.5rem", sm: "2.125rem" },
            }}
          >
            Quản lý Thử thách
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#666",
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            Danh sách tất cả thử thách trong hệ thống
          </Typography>
        </Box>
        <ChallengeListSection
          onCreateNew={() => navigate("/admin/challenge-designer?mode=create")}
          onEditChallenge={(c: any) => {
            const qs = new URLSearchParams({
              mode: "edit",
              id: c.id,
              title: c.title || "",
              description: c.description || "",
              order: String(c.order ?? 1),
              difficulty: String(c.difficulty ?? 1),
              lessonId: c.lessonId || "",
            });
            navigate(`/admin/challenge-designer?${qs.toString()}`);
          }}
        />
      </Container>
    </AdminLayout>
  );
}
