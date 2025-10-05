import { useState, useEffect } from "react";
import { Box, Typography, Chip, Alert } from "@mui/material";
import {
  School as SchoolIcon,
  AccessTime as AccessTimeIcon,
  WorkspacePremium as CertificateIcon,
  SmartToy as RobotIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "store/config";
import { getCourseRobotsThunk } from "store/courseRobot/courseRobotThunks";
import RobotRequirementCard from "components/robot/RobotRequirementCard";
import ActivateRobotDialog from "components/robot/ActivateRobotDialog";
import { AddToCartButton } from "components/cart";
import { CourseType } from "common/@types/course";

interface CourseSidebarSectionProps {
  course: {
    id: string;
    title: string;
    imageUrl?: string;
    price?: number;
    type?: CourseType;
  };
  lessons: any[];
  isEnrolled?: boolean;
}

export default function CourseSidebarSection({
  course,
  lessons,
}: CourseSidebarSectionProps) {
  const dispatch = useAppDispatch();
  const { courseRobots } = useAppSelector((state) => state.courseRobot);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);

  // Use courseRobots.data from GET_ALL endpoint
  const courseRobotsList = courseRobots.data?.items || [];

  useEffect(() => {
    // Fetch robots required for this course
    dispatch(getCourseRobotsThunk({ courseId: course.id, pageSize: 100 }));
  }, [dispatch, course.id]);

  const handleActivateSuccess = () => {
    // TODO: Refresh after activation
    dispatch(getCourseRobotsThunk({ courseId: course.id, pageSize: 100 }));
  };

  // TODO: Implement proper robot ownership checking
  // For now, assume user doesn't own any robots (will be fixed later)
  const isRobotOwned = (_robotId: string): boolean => {
    return false; // Temporarily disabled
  };

  // Check if all required robots are owned
  const hasAllRequiredRobots = courseRobotsList
    .filter((cr) => cr.isRequired)
    .every((cr) => isRobotOwned(cr.robotId));

  const requiredRobots = courseRobotsList.filter((cr) => cr.isRequired);
  const missingRequiredRobots = requiredRobots.filter(
    (cr) => !isRobotOwned(cr.robotId)
  );
  return (
    <Box sx={{ position: "sticky", top: 80 }}>
      {/* Course Info Card - Compact */}
      <Box
        sx={{
          bgcolor: "white",
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          mb: 2,
        }}
      >
        {/* Remove image preview, just show info */}
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1.5,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Nội dung khóa học
            </Typography>
            <Chip
              label={
                course.type === CourseType.Free || (course.price ?? 0) === 0
                  ? "Miễn phí"
                  : `${(course.price ?? 0).toLocaleString()} VND`
              }
              size="small"
              sx={{
                bgcolor:
                  course.type === CourseType.Free || (course.price ?? 0) === 0
                    ? "#4caf50"
                    : "#ff9800",
                color: "white",
                fontWeight: 600,
                fontSize: "0.7rem",
                height: 24,
              }}
            />
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SchoolIcon fontSize="small" sx={{ color: "#1976d2" }} />
              <Typography variant="body2">{lessons.length} bài học</Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTimeIcon fontSize="small" sx={{ color: "#1976d2" }} />
              <Typography variant="body2">Khoảng 4-6 giờ</Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CertificateIcon fontSize="small" sx={{ color: "#1976d2" }} />
              <Typography variant="body2">Chứng chỉ hoàn thành</Typography>
            </Box>
          </Box>

          {/* Add to Cart Button - Only for Premium Courses */}
          {course.type !== CourseType.Free && (course.price ?? 0) > 0 && (
            <Box sx={{ mt: 2 }}>
              <AddToCartButton
                courseId={course.id}
                coursePrice={course.price ?? 0}
                fullWidth
              />
            </Box>
          )}
        </Box>
      </Box>

      {/* Robot Requirements Section */}
      {courseRobotsList.length > 0 && (
        <Box
          sx={{
            bgcolor: "white",
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            mb: 2,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}
            >
              <RobotIcon sx={{ color: "#1976d2", fontSize: 20 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Robots Yêu cầu
              </Typography>
            </Box>

            {/* Warning if missing required robots */}
            {missingRequiredRobots.length > 0 && (
              <Alert severity="warning" sx={{ mb: 1.5, py: 0.5 }}>
                <Typography variant="caption">
                  Cần {missingRequiredRobots.length} robot bắt buộc
                </Typography>
              </Alert>
            )}

            {/* Success message if has all required robots */}
            {requiredRobots.length > 0 && hasAllRequiredRobots && (
              <Alert severity="success" sx={{ mb: 1.5, py: 0.5 }}>
                <Typography variant="caption">Đủ robots ✓</Typography>
              </Alert>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {courseRobotsList.map((courseRobot) => (
                <RobotRequirementCard
                  key={courseRobot.id}
                  robotName={courseRobot.robotName || "Robot"}
                  robotModel={courseRobot.robotModel || ""}
                  robotBrand={courseRobot.robotBrand || ""}
                  robotImageUrl={undefined}
                  isRequired={courseRobot.isRequired}
                  isOwned={isRobotOwned(courseRobot.robotId)}
                  onActivate={() => setActivateDialogOpen(true)}
                />
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* Skills Section */}
      <Box
        sx={{
          bgcolor: "white",
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          mt: 2,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
            Kỹ năng bạn sẽ học được
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {[
              "Lập trình Blockly",
              "Điều khiển Robot",
              "Tư duy logic",
              "Giải quyết vấn đề",
              "STEM",
            ].map((skill) => (
              <Chip
                key={skill}
                label={skill}
                variant="outlined"
                size="small"
                sx={{
                  borderColor: "#1976d2",
                  color: "#1976d2",
                  fontSize: "0.75rem",
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Activate Robot Dialog */}
      <ActivateRobotDialog
        open={activateDialogOpen}
        onClose={() => setActivateDialogOpen(false)}
        onSuccess={handleActivateSuccess}
      />
    </Box>
  );
}
