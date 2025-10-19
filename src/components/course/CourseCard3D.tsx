import { forwardRef } from "react";
import { Box, Typography, Chip } from "@mui/material";
import { motion } from "framer-motion";
import { Course, CourseType } from "../../common/@types/course";
import PeopleIcon from "@mui/icons-material/People";
import MenuBookIcon from "@mui/icons-material/MenuBook";

interface CourseCard3DProps {
  course: Course;
  index: number;
  activeIndex: number;
  onClick?: () => void;
}

const CourseCard3D = forwardRef<HTMLDivElement, CourseCard3DProps>(({
  course,
  index,
  activeIndex,
  onClick,
}, ref) => {
  const offset = index - activeIndex;
  const isActive = offset === 0;

  // Calculate card position and style based on offset
  const getCardStyle = () => {
    const baseRotateY = offset * 15; // Rotate cards on sides
    const baseZ = -Math.abs(offset) * 100; // Stack depth
    const baseX = offset * 200; // Horizontal spacing (reduced from 220)
    const baseScale = isActive ? 1 : 0.85 - Math.abs(offset) * 0.05;
    const baseOpacity = isActive ? 1 : 0.7 - Math.abs(offset) * 0.15;

    return {
      rotateY: baseRotateY,
      z: baseZ,
      x: baseX,
      scale: baseScale,
      opacity: baseOpacity,
    };
  };

  const style = getCardStyle();

  // Determine if course is new (created within last 7 days)
  const isNew = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(course.createdAt) > sevenDaysAgo;
  };

  // Determine badge based on enrollments
  const getBadge = () => {
    if (isNew()) return { label: "MỚI", color: "#4caf50" };
    if ((course.enrollmentsCount || 0) > 50)
      return { label: "PHỔ BIẾN", color: "#2196f3" };
    return null;
  };

  const badge = getBadge();

  return (
    <Box
      ref={ref}
      component={motion.div}
      animate={style}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 30,
      }}
      onClick={isActive ? onClick : undefined}
      sx={{
        position: "absolute",
        width: 280,
        height: 380,
        cursor: isActive ? "pointer" : "default",
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          backgroundColor: "#ffffff",
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: isActive
            ? "0 20px 60px rgba(0,0,0,0.3)"
            : "0 10px 30px rgba(0,0,0,0.15)",
          transition: "box-shadow 0.3s ease",
          position: "relative",
          "&:hover": {
            boxShadow: isActive
              ? "0 25px 70px rgba(0,0,0,0.35)"
              : "0 15px 40px rgba(0,0,0,0.2)",
          },
        }}
      >
        {/* Badge */}
        {badge && (
          <Chip
            label={badge.label}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              backgroundColor: badge.color,
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.7rem",
              zIndex: 2,
              height: 24,
            }}
          />
        )}

        {/* Course Image */}
        <Box
          sx={{
            width: "100%",
            height: 180,
            backgroundColor: "#f5f5f5",
            backgroundImage: course.imageUrl
              ? `url(${course.imageUrl})`
              : "linear-gradient(135deg, #4caf50 0%, #81c784 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
          }}
        >
          {/* Image overlay for better text readability */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "50%",
              background:
                "linear-gradient(to top, rgba(0,0,0,0.3), transparent)",
            }}
          />
        </Box>

        {/* Course Content */}
        <Box sx={{ p: 2.5 }}>
          {/* Course Title */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "1rem",
              mb: 1,
              lineHeight: 1.3,
              color: "#1a1a1a",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: 40,
            }}
          >
            {course.title}
          </Typography>

          {/* Course Description */}
          <Typography
            variant="body2"
            sx={{
              color: "#666",
              mb: 2,
              fontSize: "0.85rem",
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: 38,
            }}
          >
            {course.description}
          </Typography>

          {/* Course Stats */}
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              mb: 2,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <MenuBookIcon sx={{ fontSize: 16, color: "#4caf50" }} />
              <Typography variant="caption" sx={{ color: "#666" }}>
                {course.lessonsCount || 0} bài học
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <PeopleIcon sx={{ fontSize: 16, color: "#4caf50" }} />
              <Typography variant="caption" sx={{ color: "#666" }}>
                {course.enrollmentsCount || 0} học viên
              </Typography>
            </Box>
          </Box>

          {/* Price */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              pt: 1.5,
              borderTop: "1px solid #f0f0f0",
            }}
          >
            {course.type === CourseType.Free ? (
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#4caf50",
                  fontSize: "1.1rem",
                }}
              >
                MIỄN PHÍ
              </Typography>
            ) : (
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#2196f3",
                  fontSize: "1.1rem",
                }}
              >
                {course.price?.toLocaleString("vi-VN")}đ
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

CourseCard3D.displayName = 'CourseCard3D';

export default CourseCard3D;
