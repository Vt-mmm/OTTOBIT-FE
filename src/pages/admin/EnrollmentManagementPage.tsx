import AdminLayout from "layout/admin/AdminLayout";
import EnrollmentListSection from "sections/admin/enrollment/EnrollmentListSection";

export default function EnrollmentManagementPage() {
  return (
    <AdminLayout>
      <EnrollmentListSection />
    </AdminLayout>
  );
}
