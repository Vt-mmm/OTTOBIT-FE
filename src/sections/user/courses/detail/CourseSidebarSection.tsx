import { useEffect, useMemo } from "react";
import { Box, Typography, Chip, Alert } from "@mui/material";
import {
  School as SchoolIcon,
  AccessTime as AccessTimeIcon,
  WorkspacePremium as CertificateIcon,
  SmartToy as RobotIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "store/config";
import { getCourseRobotsThunk } from "store/courseRobot/courseRobotThunks";
import { getMyActivationCodesThunk } from "store/activationCode/activationCodeThunks";
import RobotRequirementCard from "components/robot/RobotRequirementCard";
import { AddToCartButton } from "components/cart";
import { CourseType } from "common/@types/course";
import { CodeStatus } from "common/@types/activationCode";
import { useLocales } from "../../../../hooks";

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
  isEnrolled,
}: CourseSidebarSectionProps) {
  const { translate } = useLocales();
  const dispatch = useAppDispatch();
  const { courseRobots } = useAppSelector((state) => state.courseRobot);
  const { myCodes } = useAppSelector((state) => state.activationCode);

  // Use courseRobots.data from GET_ALL endpoint
  const courseRobotsList = courseRobots.data?.items || [];

  useEffect(() => {
    // Fetch robots required for this course
    dispatch(getCourseRobotsThunk({ courseId: course.id, pageSize: 100 }));
    // Fetch user's activated robots
    dispatch(
      getMyActivationCodesThunk({
        status: CodeStatus.Used,
        pageNumber: 1,
        pageSize: 100,
      })
    );
  }, [dispatch, course.id]);

  // Get list of activated robot IDs from activation codes
  const activatedRobotIds = useMemo(() => {
    if (!myCodes.data?.items) return new Set<string>();

    return new Set(
      myCodes.data.items
        .filter((code) => code.status === CodeStatus.Used && code.robotId)
        .map((code) => code.robotId!)
    );
  }, [myCodes.data]);

  // Check if user owns a specific robot
  const isRobotOwned = (robotId: string): boolean => {
    return activatedRobotIds.has(robotId);
  };

  const requiredRobots = courseRobotsList.filter((cr) => cr.isRequired);
  const missingRequiredRobots = requiredRobots.filter(
    (cr) => !isRobotOwned(cr.robotId)
  );

  // Get all robot IDs for this course (both required and optional)
  const allCourseRobotIds = courseRobotsList.map((cr) => cr.robotId);
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
              {translate("courses.CourseContent")}
            </Typography>
            <Chip
              label={
                course.type === CourseType.Free || (course.price ?? 0) === 0
                  ? translate("courses.Free")
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
              <Typography variant="body2">
                {lessons.length} {translate("courses.LessonsText")}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTimeIcon fontSize="small" sx={{ color: "#1976d2" }} />
              <Typography variant="body2">
                {translate("courses.AboutHours", { hours: "4-6" })}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CertificateIcon fontSize="small" sx={{ color: "#1976d2" }} />
              <Typography variant="body2">
                {translate("courses.Certificate")}
              </Typography>
            </Box>
          </Box>

          {/* Add to Cart Button - Only for Premium Courses and Not Enrolled */}
          {!isEnrolled && course.type !== CourseType.Free && (course.price ?? 0) > 0 && (
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
                {translate("courses.RobotsRequired")}
              </Typography>
            </Box>

            {/* Warning if missing required robots */}
            {missingRequiredRobots.length > 0 && (
              <Alert severity="warning" sx={{ mb: 1.5, py: 0.5 }}>
                <Typography variant="caption">
                  {translate("courses.NeedRobots", {
                    count: missingRequiredRobots.length,
                  })}
                </Typography>
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
            {translate("courses.SkillsYouWillLearn")}
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {[
              translate("courses.SkillBlockly"),
              translate("courses.SkillRobotControl"),
              translate("courses.SkillLogicalThinking"),
              translate("courses.SkillProblemSolving"),
              translate("courses.SkillSTEM"),
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
    </Box>
  );
}
