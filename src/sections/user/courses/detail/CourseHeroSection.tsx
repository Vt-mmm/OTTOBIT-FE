import {
  Box,
  Typography,
  Chip,
  Avatar,
  Rating,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { CourseType } from "common/@types/course";
import { useLocales } from "../../../../hooks";

interface CourseHeroSectionProps {
  course: {
    id: string;
    title: string;
    description: string;
    createdByName?: string;
    enrollmentsCount?: number;
    price?: number;
    type?: CourseType;
  };
  lessons: any[];
  isUserEnrolled: boolean;
  isEnrolling: boolean;
  onEnrollCourse: () => void;
  onLessonClick: (lessonId: string, lessonIndex: number) => void;
  courseRating: number;
  totalRatings: number;
}

export default function CourseHeroSection({
  course,
  lessons,
  isUserEnrolled,
  isEnrolling,
  onEnrollCourse,
  courseRating,
  totalRatings,
}: CourseHeroSectionProps) {
  const { translate } = useLocales();

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
        {course.title}
      </Typography>

      <Typography
        variant="h6"
        color="text.secondary"
        sx={{ mb: 3, lineHeight: 1.6 }}
      >
        {course.description}
      </Typography>

      {/* Course Stats */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
        {/* Rating */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Rating value={courseRating} readOnly size="small" precision={0.1} />
          <Typography variant="body2" color="text.secondary">
            {courseRating} ({totalRatings.toLocaleString()}{" "}
            {translate("courses.Ratings")})
          </Typography>
        </Box>

        <Chip
          icon={<SchoolIcon />}
          label={`${lessons.length} ${translate("courses.LessonsText")}`}
          color="primary"
          variant="outlined"
        />
        {course.enrollmentsCount !== undefined && (
          <Chip
            icon={<PersonIcon />}
            label={`${course.enrollmentsCount.toLocaleString()} ${translate(
              "courses.Students"
            )}`}
            color="secondary"
            variant="outlined"
          />
        )}
      </Box>

      {/* Instructor */}
      {course.createdByName && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 4 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: "primary.main" }}>
            {course.createdByName.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {translate("courses.CreatedBy")}
            </Typography>
            <Typography variant="subtitle2" fontWeight={600}>
              {course.createdByName} • Ottobit
            </Typography>
          </Box>
        </Box>
      )}

      {/* Enrollment CTA */}
      {!isUserEnrolled ? (
        <Box
          sx={{
            p: 3,
            bgcolor: "#f8f9fa",
            border: "2px solid #4caf50",
            borderRadius: 2,
            mb: 4,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: "#2e7d32" }}>
            {translate("courses.StartLearningJourney")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {translate("courses.JoinOtherStudents", {
              count: course.enrollmentsCount || 0,
            })}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={onEnrollCourse}
            disabled={isEnrolling}
            sx={{
              bgcolor:
                course.type === CourseType.Free || (course.price ?? 0) === 0
                  ? "#4caf50"
                  : "#1976d2",
              color: "white",
              fontWeight: 600,
              py: 1.5,
              px: 4,
              fontSize: "1.1rem",
              "&:hover": {
                bgcolor:
                  course.type === CourseType.Free || (course.price ?? 0) === 0
                    ? "#43a047"
                    : "#1565c0",
              },
            }}
          >
            {isEnrolling ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                {translate("courses.Processing")}
              </>
            ) : course.type === CourseType.Free || (course.price ?? 0) === 0 ? (
              translate("courses.JoinFreeCourse")
            ) : (
              translate("courses.JoinPaidCourse", {
                price: (course.price ?? 0).toLocaleString(),
              })
            )}
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            p: 2,
            bgcolor: "#e8f5e9",
            border: "1px solid #4caf50",
            borderRadius: 2,
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircleIcon sx={{ color: "#4caf50", fontSize: "1.2rem" }} />
            <Typography
              variant="body1"
              sx={{ color: "#2e7d32", fontWeight: 600 }}
            >
              {translate("courses.AlreadyJoined")}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
