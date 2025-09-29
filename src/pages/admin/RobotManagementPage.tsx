import { useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import AdminLayout from "../../layout/admin/AdminLayout";
import RobotListSection from "../../sections/admin/robot/RobotListSection";
import RobotFormSection from "../../sections/admin/robot/RobotFormSection";
import RobotDetailsSection from "../../sections/admin/robot/RobotDetailsSection";
import { RobotResult } from "../../common/@types/robot";

type ViewMode = "list" | "create" | "edit" | "details";

export default function RobotManagementPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedRobot, setSelectedRobot] = useState<RobotResult | null>(null);

  const handleViewModeChange = (mode: ViewMode, robot?: RobotResult) => {
    setViewMode(mode);
    setSelectedRobot(robot || null);
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedRobot(null);
  };

  const renderContent = () => {
    switch (viewMode) {
      case "create":
        return (
          <RobotFormSection
            mode="create"
            onBack={handleBackToList}
            onSuccess={handleBackToList}
          />
        );
      case "edit":
        return (
          <RobotFormSection
            mode="edit"
            robot={selectedRobot}
            onBack={handleBackToList}
            onSuccess={handleBackToList}
          />
        );
      case "details":
        return (
          <RobotDetailsSection
            robot={selectedRobot}
            onBack={handleBackToList}
            onEdit={(robot) => handleViewModeChange("edit", robot)}
            onDelete={handleBackToList}
            onRestore={handleBackToList}
          />
        );
      default:
        return (
          <RobotListSection
            onViewModeChange={handleViewModeChange}
          />
        );
    }
  };

  const getPageTitle = () => {
    switch (viewMode) {
      case "create":
        return "Create New Robot";
      case "edit":
        return "Edit Robot";
      case "details":
        return "Robot Details";
      default:
        return "Robot Management";
    }
  };

  const getPageDescription = () => {
    switch (viewMode) {
      case "create":
        return "Create a new robot template for the system";
      case "edit":
        return "Update robot information and specifications";
      case "details":
        return "View detailed robot information and manage settings";
      default:
        return "Manage robot templates, specifications, and configurations";
    }
  };

  return (
    <AdminLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              mb: 1,
            }}
          >
            {getPageTitle()}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {getPageDescription()}
          </Typography>
        </Box>
        
        {renderContent()}
      </Container>
    </AdminLayout>
  );
}
