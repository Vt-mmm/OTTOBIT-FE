import AdminLayout from "layout/admin/AdminLayout";
import StudentListSection from "sections/admin/student/StudentListSection";

export default function StudentManagementPage() {
  return (
    <AdminLayout>
      <StudentListSection />
    </AdminLayout>
  );
}
