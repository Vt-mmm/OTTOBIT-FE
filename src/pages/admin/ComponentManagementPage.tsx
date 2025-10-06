import { useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import AdminLayout from "layout/admin/AdminLayout";
import ComponentListSection from "sections/admin/component/ComponentListSection";
import ComponentFormSection from "sections/admin/component/ComponentFormSection";
import ComponentDetailsSection from "sections/admin/component/ComponentDetailsSection";
import { ComponentResult } from "common/@types/component";

export type ComponentViewMode = "list" | "create" | "edit" | "details";

export default function ComponentManagementPage() {
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
          <ComponentListSection onViewModeChange={handleViewModeChange} />
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
          <ComponentListSection onViewModeChange={handleViewModeChange} />
        );

      default:
        return <ComponentListSection onViewModeChange={handleViewModeChange} />;
    }
  };

  const getPageTitle = () => {
    switch (viewMode) {
      case "create":
        return "Create New Component";
      case "edit":
        return "Edit Component";
      case "details":
        return "Component Details";
      default:
        return "Component Management";
    }
  };

  const getPageDescription = () => {
    switch (viewMode) {
      case "create":
        return "Create a new component for the system";
      case "edit":
        return "Update component information and specifications";
      case "details":
        return "View detailed component information and manage settings";
      default:
        return "Manage components, specifications, and configurations";
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
