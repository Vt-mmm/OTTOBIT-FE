import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getCourses } from "../../../redux/course/courseSlice";
import { PATH_USER } from "../../../routes/paths";

export default function CourseListingSection() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: courses, isLoading, error } = useAppSelector((state) => state.course.courses);
  const fullCourseState = useAppSelector((state) => state.course);

  // Debug logging
  console.log("CourseListingSection - Debug:", {
    courses,
    isLoading,
    error,
    hasItems: courses?.items?.length,
    fullCourseState,
  });

  useEffect(() => {
    // Fetch courses on component mount
    console.log("Dispatching getCourses...");
    dispatch(getCourses({ pageSize: 20 }))
      .then((result) => {
        console.log("getCourses result:", result);
      })
      .catch((error) => {
        console.error("getCourses error:", error);
      });
  }, [dispatch]);

  const handleCourseClick = (courseId: string) => {
    navigate(PATH_USER.courseDetail.replace(":id", courseId));
  };

  if (isLoading) {
    return (
      <Container>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!courses?.items || courses.items.length === 0) {
    return (
      <Container>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Không có khóa học nào
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Hiện tại chưa có khóa học nào được tạo.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Khóa học lập trình
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Khám phá các khóa học lập trình thú vị với robot Ottobit
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {courses.items.map((course) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={course.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 4,
                },
              }}
              onClick={() => handleCourseClick(course.id)}
            >
              <CardMedia
                component="img"
                height="200"
                image={
                  course.imageUrl || 
                  "https://via.placeholder.com/400x200?text=Course+Image"
                }
                alt={course.title}
                sx={{ objectFit: "cover" }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {course.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    mb: 2,
                  }}
                >
                  {course.description}
                </Typography>
                
                {/* Course Stats */}
                <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                  {course.lessonsCount !== undefined && (
                    <Chip 
                      label={`${course.lessonsCount} bài học`} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  )}
                  {course.enrollmentsCount !== undefined && (
                    <Chip 
                      label={`${course.enrollmentsCount} học viên`} 
                      size="small" 
                      color="secondary" 
                      variant="outlined" 
                    />
                  )}
                </Box>

                {course.createdByName && (
                  <Typography variant="caption" color="text.secondary">
                    Bởi: {course.createdByName}
                  </Typography>
                )}
              </CardContent>
              
              <CardActions>
                <Button 
                  size="small" 
                  color="primary" 
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCourseClick(course.id);
                  }}
                >
                  Xem chi tiết
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination Info */}
      {courses.total > 0 && (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Hiển thị {courses.items.length} trong tổng số {courses.total} khóa học
          </Typography>
        </Box>
      )}
    </Container>
  );
}