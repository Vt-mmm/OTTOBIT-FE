import { useState } from "react";
import { Box, Container, Typography, Tabs, Tab } from "@mui/material";
import AdminLayout from "../../layout/admin/AdminLayout";
import VoucherListSection from "../../sections/admin/voucher/VoucherListSection";
import VoucherFormSection from "../../sections/admin/voucher/VoucherFormSection";
import VoucherDetailsSection from "../../sections/admin/voucher/VoucherDetailsSection";
import VoucherUsageSection from "../../sections/admin/voucher/VoucherUsageSection";
import VoucherUsageDetailSection from "../../sections/admin/voucher/VoucherUsageDetailSection";
import { Voucher } from "../../types/voucher";

type ViewMode = "list" | "create" | "edit" | "details" | "usage-details";
type TabValue = "vouchers" | "usage";

export default function VoucherManagementPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>("vouchers");
  const [selectedUsageId, setSelectedUsageId] = useState<string | null>(null);

  const handleViewModeChange = (mode: ViewMode, voucher?: Voucher) => {
    setViewMode(mode);
    setSelectedVoucher(voucher || null);
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedVoucher(null);
    setSelectedUsageId(null);
  };

  const handleViewUsageDetails = (usageId: string) => {
    setViewMode("usage-details");
    setSelectedUsageId(usageId);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
    // Reset view mode when switching tabs
    setViewMode("list");
    setSelectedVoucher(null);
    setSelectedUsageId(null);
  };

  const renderContent = () => {
    // Show usage details
    if (viewMode === "usage-details" && selectedUsageId) {
      return (
        <VoucherUsageDetailSection
          usageId={selectedUsageId}
          onBack={handleBackToList}
        />
      );
    }

    // Show usage tab content
    if (activeTab === "usage") {
      return <VoucherUsageSection onViewDetails={handleViewUsageDetails} />;
    }

    // Show voucher management content
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
    if (viewMode === "usage-details") {
      return "Chi tiết sử dụng Voucher";
    }

    if (activeTab === "usage") {
      return "Lịch sử sử dụng Voucher";
    }

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
    if (viewMode === "usage-details") {
      return "Xem chi tiết thông tin sử dụng voucher";
    }

    if (activeTab === "usage") {
      return "Theo dõi và quản lý lịch sử sử dụng voucher của người dùng";
    }

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

        {/* Tabs - Show when not in create/edit/details/usage-details mode */}
        {(viewMode === "list" ||
          (activeTab === "usage" && viewMode === "usage-details")) && (
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4, mt: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="voucher management tabs"
              sx={{
                "& .MuiTab-root": {
                  minHeight: 48,
                  padding: "12px 24px",
                  marginRight: 2,
                  "&:last-child": {
                    marginRight: 0,
                  },
                },
                "& .MuiTabs-indicator": {
                  height: 3,
                },
              }}
            >
              <Tab label="Quản lý Voucher" value="vouchers" />
              <Tab label="Lịch sử sử dụng" value="usage" />
            </Tabs>
          </Box>
        )}

        {renderContent()}
      </Container>
    </AdminLayout>
  );
}
