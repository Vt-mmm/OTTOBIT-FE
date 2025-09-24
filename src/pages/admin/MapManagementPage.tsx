import AdminLayout from "layout/admin/AdminLayout";
import { Container } from "@mui/material";
import MapListSection from "sections/admin/map/MapListSection";

export default function MapManagementPage() {
  return (
    <AdminLayout>
      <Container maxWidth="xl">
        <MapListSection />
      </Container>
    </AdminLayout>
  );
}
