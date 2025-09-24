import AdminLayout from "layout/admin/AdminLayout";
import { Container } from "@mui/material";
import ChallengeListSection from "sections/admin/challenge/ChallengeListSection";
import { useNavigate } from "react-router-dom";

export default function ChallengeManagementPage() {
  const navigate = useNavigate();
  return (
    <AdminLayout>
      <Container maxWidth="xl">
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
