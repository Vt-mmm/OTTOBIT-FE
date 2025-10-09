import { useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import AdminLayout from "../../layout/admin/AdminLayout";
import CourseListSection from "../../sections/admin/course/CourseListSection";
import CourseFormSection from "../../sections/admin/course/CourseFormSection";
import CourseDetailsSection from "../../sections/admin/course/CourseDetailsSection";
import { CourseResult } from "../../common/@types/course";
import { useLocales } from "hooks";

type ViewMode = "list" | "create" | "edit" | "details";

export default function CourseManagementPage() {
  const { translate } = useLocales();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedCourse, setSelectedCourse] = useState<CourseResult | null>(
    null
  );

  const handleViewModeChange = (mode: ViewMode, course?: CourseResult) => {
    setViewMode(mode);
    setSelectedCourse(course || null);
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedCourse(null);
  };

  const renderContent = () => {
    switch (viewMode) {
      case "create":
        return (
          <CourseFormSection
            mode="create"
            onBack={handleBackToList}
            onSuccess={handleBackToList}
          />
        );

      case "edit":
        return (
          <CourseFormSection
            mode="edit"
            course={selectedCourse}
            onBack={handleBackToList}
            onSuccess={handleBackToList}
          />
        );

      case "details":
        return (
          <CourseDetailsSection
            course={selectedCourse}
            onBack={handleBackToList}
            onEdit={(course) => handleViewModeChange("edit", course)}
          />
        );

      default:
        return (
          <CourseListSection
            onCreateNew={() => handleViewModeChange("create")}
            onEditCourse={(course) => handleViewModeChange("edit", course)}
            onViewDetails={(course) => handleViewModeChange("details", course)}
          />
        );
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
            {translate("admin.courseManagementTitle")}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#666",
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            {viewMode === "list" && translate("admin.courseManagementSubtitle")}
            {viewMode === "create" && translate("admin.createNewCourse")}
            {viewMode === "edit" &&
              `${translate("admin.editCourseTitle")}: ${selectedCourse?.title}`}
            {viewMode === "details" &&
              `${translate("admin.courseDetailsTitle")}: ${selectedCourse?.title}`}
          </Typography>
        </Box>

        {renderContent()}
      </Container>
    </AdminLayout>
  );
}
