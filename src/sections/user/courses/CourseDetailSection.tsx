import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
} from "@mui/material";
import {
  PlayArrow as PlayArrowIcon,
  School as SchoolIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getCourseById } from "../../../redux/course/courseSlice";
import { getLessonsByCourse } from "../../../redux/lesson/lessonSlice";
import { PATH_USER } from "../../../routes/paths";

interface CourseDetailSectionProps {
  courseId: string;
}

export default function CourseDetailSection({ courseId }: CourseDetailSectionProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { data: course, isLoading: courseLoading, error: courseError } = useAppSelector(
    (state) => state.course.currentCourse
  );
  
  const { data: lessonsData, isLoading: lessonsLoading, error: lessonsError } = useAppSelector(
    (state) => state.lesson.courseLessons
  );

  useEffect(() => {
    // Fetch course details
    dispatch(getCourseById(courseId));
    
    // Fetch lessons for this course
    dispatch(getLessonsByCourse({ courseId, pageSize: 50 }));
  }, [dispatch, courseId]);

  const handleLessonClick = (lessonId: string) => {
    // Navigate to lesson detail page
    navigate(PATH_USER.lessonDetail.replace(":id", lessonId));
  };

  const isLoading = courseLoading || lessonsLoading;
  const error = courseError || lessonsError;

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

  if (!course) {
    return (
      <Container>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Không tìm thấy khóa học
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Khóa học không tồn tại hoặc đã bị xóa.
          </Typography>
        </Box>
      </Container>
    );
  }

  const lessons = lessonsData?.items || [];

  return (
    <Container maxWidth="lg">
      {/* Course Header */}
      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography variant="h3" component="h1" gutterBottom>
              {course.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {course.description}
            </Typography>
            
            {/* Course Stats */}
            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Chip
                icon={<SchoolIcon />}
                label={`${lessons.length} bài học`}
                color="primary"
                variant="outlined"
              />
              {course.enrollmentsCount !== undefined && (
                <Chip
                  icon={<PersonIcon />}
                  label={`${course.enrollmentsCount} học viên`}
                  color="secondary"
                  variant="outlined"
                />
              )}
              <Chip
                icon={<AccessTimeIcon />}
                label="Cập nhật"
                color="info"
                variant="outlined"
              />
            </Box>

            {course.createdByName && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
                <Avatar sx={{ width: 32, height: 32 }}>
                  {course.createdByName.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  Được tạo bởi <strong>{course.createdByName}</strong>
                </Typography>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={4}>
            {course.imageUrl && (
              <Box
                component="img"
                src={course.imageUrl}
                alt={course.title}
                sx={{
                  width: "100%",
                  height: 200,
                  objectFit: "cover",
                  borderRadius: 2,
                }}
              />
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Lessons List */}
      <Paper elevation={2} sx={{ p: 0 }}>
        <Box sx={{ p: 3, pb: 0 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Danh sách bài học
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {lessons.length} bài học có sẵn
          </Typography>
        </Box>

        {lessons.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <SchoolIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Chưa có bài học nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Khóa học này chưa có bài học nào được tạo.
            </Typography>
          </Box>
        ) : (
          <List sx={{ pt: 0 }}>
            {lessons.map((lesson, index) => (
              <React.Fragment key={lesson.id}>
                <ListItem disablePadding>
                  <ListItemButton 
                    onClick={() => handleLessonClick(lesson.id)}
                    sx={{ py: 2 }}
                  >
                    <ListItemIcon>
                      <Avatar 
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          bgcolor: "primary.main",
                          fontSize: "0.9rem"
                        }}
                      >
                        {index + 1}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={500}>
                          {lesson.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {lesson.content || "Không có mô tả"}
                          </Typography>
                          {lesson.challengesCount !== undefined && (
                            <Chip
                              label={`${lesson.challengesCount} thử thách`}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ mt: 1 }}
                            />
                          )}
                        </Box>
                      }
                    />
                    <Button
                      variant="outlined"
                      startIcon={<PlayArrowIcon />}
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLessonClick(lesson.id);
                      }}
                    >
                      Bắt đầu
                    </Button>
                  </ListItemButton>
                </ListItem>
                {index < lessons.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
}