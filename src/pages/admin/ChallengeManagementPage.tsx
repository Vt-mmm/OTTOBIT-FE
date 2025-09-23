import AdminLayout from "layout/admin/AdminLayout";
import ChallengeListSection from "sections/admin/challenge/ChallengeListSection";

export default function ChallengeManagementPage() {
  return (
    <AdminLayout>
      <ChallengeListSection />
    </AdminLayout>
  );
}