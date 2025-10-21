import { useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import AdminLayout from "../../layout/admin/AdminLayout";
import RobotListSection from "../../sections/admin/robot/RobotListSection";
import RobotFormSection from "../../sections/admin/robot/RobotFormSection";
import RobotDetailsSection from "../../sections/admin/robot/RobotDetailsSection";
import { RobotResult } from "../../common/@types/robot";
import useLocales from "../../hooks/useLocales";
import { useAppDispatch } from "../../redux/config";
import { getRobotByIdThunk } from "../../redux/robot/robotThunks";

type ViewMode = "list" | "create" | "edit" | "details";

export default function RobotManagementPage() {
  const { translate } = useLocales();
  const dispatch = useAppDispatch();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedRobot, setSelectedRobot] = useState<RobotResult | null>(null);

  const handleViewModeChange = async (mode: ViewMode, robot?: RobotResult) => {
    setViewMode(mode);

    // If viewing details and we have a robot object, fetch fresh data via Redux thunk
    if (mode === "details" && robot?.id) {
      try {
        const robotData = await dispatch(getRobotByIdThunk(robot.id)).unwrap();
        setSelectedRobot(robotData);
      } catch (error: any) {
        console.error("Load robot error:", error);
        // Fallback to using the robot object from list
        setSelectedRobot(robot);
      }
    } else {
      setSelectedRobot(robot || null);
    }
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
          />
        );
      default:
        return <RobotListSection onViewModeChange={handleViewModeChange} />;
    }
  };

  const getPageTitle = () => {
    switch (viewMode) {
      case "create":
        return translate("admin.createNewRobot");
      case "edit":
        return translate("admin.editRobotTitle");
      case "details":
        return translate("admin.robotDetailsTitle");
      default:
        return translate("admin.robotManagementTitle");
    }
  };

  const getPageDescription = () => {
    switch (viewMode) {
      case "create":
        return translate("admin.createNewRobotSubtitle");
      case "edit":
        return translate("admin.editRobotSubtitle");
      case "details":
        return translate("admin.robotDetailsSubtitle");
      default:
        return translate("admin.robotManagementSubtitle");
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
              fontSize: { xs: "1.75rem", sm: "2.5rem", md: "3rem" },
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
