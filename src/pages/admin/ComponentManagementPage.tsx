import { useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import AdminLayout from "layout/admin/AdminLayout";
import ComponentListSection from "sections/admin/component/ComponentListSection";
import ComponentFormSection from "sections/admin/component/ComponentFormSection";
import ComponentDetailsSection from "sections/admin/component/ComponentDetailsSection";
import { ComponentResult } from "common/@types/component";
import { useLocales } from "hooks";
import { axiosClient } from "../../axiosClient";
import { extractApiErrorMessage } from "../../utils/errorHandler";

export type ComponentViewMode = "list" | "create" | "edit" | "details";

export default function ComponentManagementPage() {
  const { translate } = useLocales();
  const [viewMode, setViewMode] = useState<ComponentViewMode>("list");
  const [selectedComponent, setSelectedComponent] =
    useState<ComponentResult | null>(null);

  const handleViewModeChange = (
    mode: ComponentViewMode,
    component?: ComponentResult
  ) => {
    setViewMode(mode);
    setSelectedComponent(component || null);
  };

  const handleViewDetails = async (componentId: string) => {
    try {
      const res = await axiosClient.get(`/api/v1/components/${componentId}`);
      const componentData = res?.data?.data || res?.data;
      setSelectedComponent(componentData);
      setViewMode("details");
    } catch (error: any) {
      const errorMessage = extractApiErrorMessage(
        error,
        "Failed to load component details"
      );
      console.error("Load component error:", errorMessage);
    }
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedComponent(null);
  };

  const renderContent = () => {
    switch (viewMode) {
      case "create":
        return (
          <ComponentFormSection
            mode="create"
            onBack={handleBackToList}
            onSuccess={handleBackToList}
          />
        );

      case "edit":
        return selectedComponent ? (
          <ComponentFormSection
            mode="edit"
            component={selectedComponent}
            onBack={handleBackToList}
            onSuccess={handleBackToList}
          />
        ) : (
          <ComponentListSection
            onViewModeChange={handleViewModeChange}
            onViewDetails={handleViewDetails}
          />
        );

      case "details":
        return selectedComponent ? (
          <ComponentDetailsSection
            component={selectedComponent}
            onBack={handleBackToList}
            onEdit={(component) => handleViewModeChange("edit", component)}
            onDelete={handleBackToList}
          />
        ) : (
          <ComponentListSection
            onViewModeChange={handleViewModeChange}
            onViewDetails={handleViewDetails}
          />
        );

      default:
        return (
          <ComponentListSection
            onViewModeChange={handleViewModeChange}
            onViewDetails={handleViewDetails}
          />
        );
    }
  };

  const getPageTitle = () => {
    switch (viewMode) {
      case "create":
        return translate("admin.createNewComponent");
      case "edit":
        return translate("admin.editComponentTitle");
      case "details":
        return translate("admin.componentDetailsTitle");
      default:
        return translate("admin.componentManagementTitle");
    }
  };

  const getPageDescription = () => {
    switch (viewMode) {
      case "create":
        return translate("admin.createNewComponentSubtitle");
      case "edit":
        return translate("admin.editComponentSubtitle");
      case "details":
        return translate("admin.componentDetailsSubtitle");
      default:
        return translate("admin.componentManagementSubtitle");
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
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              mb: 1,
              fontSize: { xs: "1.5rem", sm: "2.125rem" },
            }}
          >
            {getPageTitle()}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            {getPageDescription()}
          </Typography>
        </Box>

        {renderContent()}
      </Container>
    </AdminLayout>
  );
}
