import { useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import AdminLayout from "../../layout/admin/AdminLayout";
import LessonListSection from "../../sections/admin/lesson/LessonListSection";
import LessonFormSection from "../../sections/admin/lesson/LessonFormSection";
import LessonDetailsSection from "../../sections/admin/lesson/LessonDetailsSection";
import { LessonResult } from "../../common/@types/lesson";
import useLocales from "../../hooks/useLocales";
import { axiosClient } from "axiosClient";
import { extractApiErrorMessage } from "utils/errorHandler";

type ViewMode = "list" | "create" | "edit" | "details";

export default function LessonManagementPage() {
  const { translate } = useLocales();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedLesson, setSelectedLesson] = useState<LessonResult | null>(
    null
  );
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  const handleViewModeChange = (
    mode: ViewMode,
    lesson?: LessonResult,
    courseId?: string
  ) => {
    setViewMode(mode);
    setSelectedLesson(lesson || null);
    if (courseId) setSelectedCourseId(courseId);
  };

  const handleViewDetails = async (lessonId: string) => {
    try {
      const res = await axiosClient.get(`/api/v1/lessons/admin/${lessonId}`);
      const lessonData = res?.data?.data;
      setSelectedLesson(lessonData);
      setViewMode("details");
    } catch (error: any) {
      const errorMessage = extractApiErrorMessage(
        error,
        "Không thể tải chi tiết bài học"
      );
      console.error("Load lesson error:", errorMessage);
    }
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedLesson(null);
    setSelectedCourseId("");
  };

  const renderContent = () => {
    switch (viewMode) {
      case "create":
        return (
          <LessonFormSection
            mode="create"
            courseId={selectedCourseId}
            onBack={handleBackToList}
            onSuccess={handleBackToList}
          />
        );

      case "edit":
        return (
          <LessonFormSection
            mode="edit"
            lesson={selectedLesson}
            onBack={handleBackToList}
            onSuccess={handleBackToList}
          />
        );

      case "details":
        return (
          <LessonDetailsSection
            lesson={selectedLesson}
            onBack={handleBackToList}
          />
        );

      default:
        return (
          <LessonListSection
            onCreateNew={(courseId) =>
              handleViewModeChange("create", undefined, courseId)
            }
            onEditLesson={(lesson) => handleViewModeChange("edit", lesson)}
            onViewDetails={handleViewDetails}
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
            {translate("admin.lessonManagementTitle")}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#666",
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            {viewMode === "list" && translate("admin.lessonManagementSubtitle")}
            {viewMode === "create" && translate("admin.createNewLesson")}
            {viewMode === "edit" &&
              `${translate("admin.editLessonTitle")}: ${selectedLesson?.title}`}
            {viewMode === "details" &&
              `${translate("admin.lessonDetailsTitle")}: ${
                selectedLesson?.title
              }`}
          </Typography>
        </Box>

        {renderContent()}
      </Container>
    </AdminLayout>
  );
}
