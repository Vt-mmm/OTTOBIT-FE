import { useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import AdminLayout from "../../layout/admin/AdminLayout";
import VoucherListSection from "../../sections/admin/voucher/VoucherListSection";
import VoucherFormSection from "../../sections/admin/voucher/VoucherFormSection";
import VoucherDetailsSection from "../../sections/admin/voucher/VoucherDetailsSection";
import { Voucher } from "../../types/voucher";

type ViewMode = "list" | "create" | "edit" | "details";

export default function VoucherManagementPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  const handleViewModeChange = (mode: ViewMode, voucher?: Voucher) => {
    setViewMode(mode);
    setSelectedVoucher(voucher || null);
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedVoucher(null);
  };

  const renderContent = () => {
    switch (viewMode) {
      case "create":
        return (
          <VoucherFormSection
            mode="create"
            onBack={handleBackToList}
            onSuccess={handleBackToList}
          />
        );

      case "edit":
        return (
          <VoucherFormSection
            mode="edit"
            voucher={selectedVoucher}
            onBack={handleBackToList}
            onSuccess={handleBackToList}
          />
        );

      case "details":
        return (
          <VoucherDetailsSection
            voucher={selectedVoucher}
            onBack={handleBackToList}
            onEdit={(voucher) => handleViewModeChange("edit", voucher)}
          />
        );

      default:
        return (
          <VoucherListSection
            onCreateNew={() => handleViewModeChange("create")}
            onEditVoucher={(voucher) => handleViewModeChange("edit", voucher)}
            onViewDetails={(voucher) =>
              handleViewModeChange("details", voucher)
            }
          />
        );
    }
  };

  const getPageTitle = () => {
    switch (viewMode) {
      case "create":
        return "Tạo Voucher Mới";
      case "edit":
        return "Chỉnh sửa Voucher";
      case "details":
        return "Chi tiết Voucher";
      default:
        return "Quản lý Voucher";
    }
  };

  const getPageDescription = () => {
    switch (viewMode) {
      case "list":
        return "Danh sách tất cả voucher trong hệ thống";
      case "create":
        return "Tạo voucher khuyến mãi mới";
      case "edit":
        return `Chỉnh sửa voucher: ${selectedVoucher?.name}`;
      case "details":
        return `Chi tiết voucher: ${selectedVoucher?.name}`;
      default:
        return "";
    }
  };

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
            {getPageTitle()}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#666",
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            {getPageDescription()}
          </Typography>
        </Box>

        {renderContent()}
      </Container>
    </AdminLayout>
  );
}
