import AdminLayout from "layout/admin/AdminLayout";
import SubmissionListSection from "sections/admin/submission/SubmissionListSection";

export default function SubmissionManagementPage() {
  return (
    <AdminLayout>
      <SubmissionListSection />
    </AdminLayout>
  );
}
