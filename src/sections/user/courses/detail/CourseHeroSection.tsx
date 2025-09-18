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

interface CourseHeroSectionProps {
  course: {
    id: string;
    title: string;
    description: string;
    createdByName?: string;
    enrollmentsCount?: number;
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
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
        {course.title}
      </Typography>
      
      <Typography variant="h6" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
        {course.description}
      </Typography>
      
      {/* Course Stats */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
        {/* Rating */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Rating value={courseRating} readOnly size="small" precision={0.1} />
          <Typography variant="body2" color="text.secondary">
            {courseRating} ({totalRatings.toLocaleString()} đánh giá)
          </Typography>
        </Box>
        
        <Chip
          icon={<SchoolIcon />}
          label={`${lessons.length} bài học`}
          color="primary"
          variant="outlined"
        />
        {course.enrollmentsCount !== undefined && (
          <Chip
            icon={<PersonIcon />}
            label={`${course.enrollmentsCount.toLocaleString()} học viên`}
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
              Được tạo bởi
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
            mb: 4 
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: "#2e7d32" }}>
            Bắt đầu hành trình học tập của bạn!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Tham gia {course.enrollmentsCount || 0} học viên khác và khám phá thế giới lập trình robot thú vị.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={onEnrollCourse}
            disabled={isEnrolling}
            sx={{
              bgcolor: "#4caf50",
              color: "white",
              fontWeight: 600,
              py: 1.5,
              px: 4,
              fontSize: "1.1rem",
              "&:hover": {
                bgcolor: "#43a047",
              },
            }}
          >
            {isEnrolling ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                Đang xử lý...
              </>
            ) : (
              "Tham gia khóa học miễn phí"
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
            mb: 4 
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircleIcon sx={{ color: "#4caf50", fontSize: "1.2rem" }} />
            <Typography variant="body1" sx={{ color: "#2e7d32", fontWeight: 600 }}>
              Bạn đã tham gia khóa học này!
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}