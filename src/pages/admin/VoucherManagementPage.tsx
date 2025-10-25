import { useState } from "react";
import { Box, Container, Typography, Tabs, Tab } from "@mui/material";
import AdminLayout from "../../layout/admin/AdminLayout";
import VoucherListSection from "../../sections/admin/voucher/VoucherListSection";
import VoucherFormSection from "../../sections/admin/voucher/VoucherFormSection";
import VoucherDetailsSection from "../../sections/admin/voucher/VoucherDetailsSection";
import VoucherUsageSection from "../../sections/admin/voucher/VoucherUsageSection";
import VoucherUsageDetailSection from "../../sections/admin/voucher/VoucherUsageDetailSection";
import { Voucher } from "../../types/voucher";
import { axiosClient } from "axiosClient";
import { extractApiErrorMessage } from "utils/errorHandler";

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

  const handleViewDetails = async (voucherId: string) => {
    try {
      const res = await axiosClient.get(`/api/v1/vouchers/${voucherId}`);
      const voucherData = res?.data?.data || res?.data;
      setSelectedVoucher(voucherData);
      setViewMode("details");
    } catch (error: any) {
      const errorMessage = extractApiErrorMessage(
        error,
        "Failed to load voucher details"
      );
      console.error("Load voucher error:", errorMessage);
    }
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
            onSuccess={() => {
              handleBackToList();
            }}
          />
        );

      case "edit":
        return (
          <VoucherFormSection
            mode="edit"
            voucher={selectedVoucher}
            onBack={handleBackToList}
            onSuccess={() => {
              handleBackToList();
            }}
          />
        );

      case "details":
        return (
          <VoucherDetailsSection
            voucher={selectedVoucher}
            onBack={handleBackToList}
          />
        );

      default:
        return (
          <VoucherListSection
            onCreateNew={() => handleViewModeChange("create")}
            onEditVoucher={(voucher) => handleViewModeChange("edit", voucher)}
            onViewDetails={handleViewDetails}
          />
        );
    }
  };

  const getPageTitle = () => {
    if (viewMode === "usage-details") {
      return "Chi tiết sử dụng phiếu giảm giá";
    }

    if (activeTab === "usage") {
      return "Lịch sử sử dụng phiếu giảm giá";
    }

    return "Quản lý phiếu giảm giá";
  };

  const getPageDescription = () => {
    if (viewMode === "usage-details") {
      return "Xem chi tiết thông tin sử dụng phiếu giảm giá";
    }

    if (activeTab === "usage") {
      return "Theo dõi và quản lý lịch sử sử dụng phiếu giảm giá của người dùng";
    }

    switch (viewMode) {
      case "list":
        return "Danh sách tất cả phiếu giảm giá trong hệ thống";
      case "create":
        return "Tạo phiếu giảm giá khuyến mãi mới";
      case "edit":
        return `Chỉnh sửa phiếu giảm giá: ${selectedVoucher?.name}`;
      case "details":
        return `Chi tiết phiếu giảm giá: ${selectedVoucher?.name}`;
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
              <Tab label="Quản lý phiếu giảm giá" value="vouchers" />
              <Tab label="Lịch sử sử dụng" value="usage" />
            </Tabs>
          </Box>
        )}

        {renderContent()}
      </Container>
    </AdminLayout>
  );
}
