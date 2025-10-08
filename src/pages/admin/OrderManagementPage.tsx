import AdminLayout from "layout/admin/AdminLayout";
import OrderListSection from "sections/admin/order/OrderListSection";

export default function OrderManagementPage() {
  return (
    <AdminLayout>
      <OrderListSection />
    </AdminLayout>
  );
}
