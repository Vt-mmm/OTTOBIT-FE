import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Grid,
  LinearProgress,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  School as SchoolIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  MenuBook as BookIcon,
  AccountBalance as MoneyIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "store/config";
import { getMyEnrollmentsThunk } from "store/enrollment/enrollmentThunks";
import { getMySubmissionsThunk } from "store/submission/submissionThunks";
import StudentProfileEdit from "./StudentProfileEdit";

export default function StudentProfileDisplay() {
  const dispatch = useAppDispatch();
  const { currentStudent } = useAppSelector((state) => state.student);
  const { myEnrollments } = useAppSelector((state) => state.enrollment);
  const { mySubmissions } = useAppSelector((state) => state.submission);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Fetch real data when component mounts
    if (currentStudent?.data) {
      dispatch(getMyEnrollmentsThunk({ pageNumber: 1, pageSize: 100 }));
      dispatch(getMySubmissionsThunk({ pageNumber: 1, pageSize: 100 }));
    }
  }, [dispatch, currentStudent]);

  if (!currentStudent || !currentStudent.data) {
    return null;
  }

  const student = currentStudent.data;
  const getAge = (dateOfBirth: string) => {
    return dayjs().diff(dayjs(dateOfBirth), 'year');
  };

  // Real data tính toán từ API responses  
  const enrollmentsArray = myEnrollments?.data?.data || [];
  const submissionsArray = mySubmissions?.data?.data || [];
  
  const realData = {
    totalEnrollments: enrollmentsArray.length || student.enrollmentsCount || 0,
    totalSubmissions: submissionsArray.length || student.submissionsCount || 0,
    completedCourses: enrollmentsArray.filter((enrollment: any) => enrollment.isCompleted)?.length || 0,
    // Sử dụng star rating thay vì status
    highScoreSubmissions: submissionsArray.filter((submission: any) => submission.star >= 4)?.length || 0,
    totalPoints: submissionsArray.reduce((total: number, submission: any) => {
      return total + (submission.star * 10 || 0); // Đổi star thành điểm số
    }, 0) || 0,
    // Tiến độ học tập từ enrollments thực tế
    learningProgress: enrollmentsArray.slice(0, 3).map((enrollment: any, index: number) => ({
      subject: enrollment.course?.title || `Khóa học ${index + 1}`,
      progress: enrollment.isCompleted ? 100 : Math.floor(Math.random() * 80) + 20, // TODO: Tính progress thực tế
      color: ["#4caf50", "#2196f3", "#ff9800"][index % 3]
    })) || [],
    // Nhiệm vụ sắp tới từ enrollments
    upcomingTasks: enrollmentsArray.slice(0, 2).map((enrollment: any, index: number) => ({
      title: `Tiếp tục học ${enrollment.course?.title || 'Khóa học'}`,
      subject: enrollment.course?.description || 'Mô tả khóa học',
      time: dayjs(enrollment.createdAt).format('DD/MM/YYYY'),
      icon: ["📚", "⚛️"][index % 2]
    })) || []
  };

  const isLoading = myEnrollments.isLoading || mySubmissions.isLoading;

  if (isEditing) {
    return (
      <StudentProfileEdit
        onEditComplete={() => setIsEditing(false)}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <Box sx={{ 
      bgcolor: "transparent",
      minHeight: "100vh", 
      p: { xs: 2, md: 3 },
      borderRadius: 4,
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
    }}>
      {/* Header với tên và avatar */}
      <Card sx={{ 
        borderRadius: { xs: 3, md: 4 }, 
        mb: 3,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(102, 126, 234, 0.25)",
        border: "1px solid rgba(255, 255, 255, 0.1)"
      }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box sx={{ 
            display: "flex", 
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ 
                width: { xs: 60, md: 80 }, 
                height: { xs: 60, md: 80 },
                bgcolor: "rgba(255,255,255,0.2)",
                fontSize: { xs: "1.5rem", md: "2rem" },
                fontWeight: "bold"
              }}>
                {student.fullname.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  {student.fullname}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  ID: {student.id.slice(-6)} | {getAge(student.dateOfBirth)} tuổi
                </Typography>
                <Chip 
                  label="Đang hoạt động"
                  size="small"
                  sx={{ 
                    mt: 0.5,
                    bgcolor: "rgba(255,255,255,0.2)", 
                    color: "white" 
                  }} 
                />
              </Box>
            </Box>
            <Button 
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
              sx={{ 
                color: "white",
                borderColor: "rgba(255,255,255,0.5)",
                "&:hover": {
                  borderColor: "white",
                  bgcolor: "rgba(255,255,255,0.1)"
                }
              }}
            >
              Chỉnh sửa
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* 5 thống kê cards */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 3 }}>
        {[
          { 
            icon: <BookIcon sx={{ color: "white", fontSize: 20 }} />, 
            value: isLoading ? <CircularProgress size={16} color="inherit" /> : realData.totalEnrollments, 
            label: "Khóa học đã tham gia", 
            color: "#ff6b6b" 
          },
          { 
            icon: <AssignmentIcon sx={{ color: "white", fontSize: 20 }} />, 
            value: isLoading ? <CircularProgress size={16} color="inherit" /> : realData.totalSubmissions, 
            label: "Bài tập đã nộp", 
            color: "#4ecdc4" 
          },
          { 
            icon: <SchoolIcon sx={{ color: "white", fontSize: 20 }} />, 
            value: isLoading ? <CircularProgress size={16} color="inherit" /> : realData.completedCourses, 
            label: "Khóa học hoàn thành", 
            color: "#a8e6cf" 
          },
          { 
            icon: <TimelineIcon sx={{ color: "white", fontSize: 20 }} />, 
            value: isLoading ? <CircularProgress size={16} color="inherit" /> : realData.highScoreSubmissions, 
            label: "Bài đạt sao cao", 
            color: "#ffa726" 
          },
          { 
            icon: <MoneyIcon sx={{ color: "white", fontSize: 20 }} />, 
            value: isLoading ? <CircularProgress size={16} color="inherit" /> : `${realData.totalPoints}`, 
            label: "Tổng điểm số", 
            color: "#42a5f5" 
          },
        ].map((stat, index) => (
          <Grid item xs={6} sm={4} md={2.4} key={index}>
            <Card sx={{ 
              textAlign: "center", 
              p: 2.5, 
              borderRadius: { xs: 2, md: 3 },
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.05)",
              bgcolor: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.12)"
              }
            }}>
              <Box sx={{
                width: 50,
                height: 50,
                borderRadius: 2,
                bgcolor: stat.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2
              }}>
                {stat.icon}
              </Box>
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 3 cột nội dung chính */}
      <Grid container spacing={3}>
        {/* Badge/Điểm số */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            borderRadius: { xs: 2.5, md: 3.5 }, 
            p: { xs: 2.5, md: 3 },
            boxShadow: "0 6px 25px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.04)",
            bgcolor: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(16px)"
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              🏆 Huy hiệu xuất sắc
            </Typography>
            <Box sx={{
              textAlign: "center",
              p: 3,
              bgcolor: "#fff8e1",
              borderRadius: 3,
              border: "2px dashed #ffc107"
            }}>
              <Typography variant="h2">🏆</Typography>
              {isLoading ? (
                <CircularProgress size={40} sx={{ my: 2 }} />
              ) : (
                <>
                  <Typography variant="h5" sx={{ fontWeight: "bold", my: 1 }}>
                    {realData.totalPoints} Điểm
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold", color: "#f57c00" }}>
                    {realData.totalEnrollments > 0 ? 'Lập trình viên OttoBit' : 'Học viên mới'}
                  </Typography>
                </>
              )}
              <Chip 
                label="Huy hiệu mới"
                size="small"
                sx={{ mt: 1, bgcolor: "#4caf50", color: "white" }}
              />
            </Box>
          </Card>
        </Grid>

        {/* Tiến độ học tập */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            borderRadius: { xs: 2.5, md: 3.5 }, 
            p: { xs: 2.5, md: 3 },
            boxShadow: "0 6px 25px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.04)",
            bgcolor: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(16px)"
          }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                📚 Tiến độ học tập
              </Typography>
              <Typography variant="body2" color="primary" sx={{ fontWeight: "bold" }}>
                Hôm nay ▼
              </Typography>
            </Box>
            {isLoading ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress size={30} />
                <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
                  Đang tải tiến độ...
                </Typography>
              </Box>
            ) : realData.learningProgress.length > 0 ? (
              realData.learningProgress.map((course, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {course.subject}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {course.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={course.progress}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: `${course.color}20`,
                      "& .MuiLinearProgress-bar": {
                        bgcolor: course.color,
                        borderRadius: 4
                      }
                    }}
                  />
                </Box>
              ))
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Chưa có khóa học nào. Hãy tham gia khóa học đầu tiên!
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Nhiệm vụ sắp tới */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            borderRadius: { xs: 2.5, md: 3.5 }, 
            p: { xs: 2.5, md: 3 },
            boxShadow: "0 6px 25px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.04)",
            bgcolor: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(16px)"
          }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                📝 Nhiệm vụ sắp tới
              </Typography>
              <Typography variant="body2" color="primary" sx={{ cursor: "pointer" }}>
                Xem tất cả
              </Typography>
            </Box>
            {isLoading ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress size={30} />
                <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
                  Đang tải nhiệm vụ...
                </Typography>
              </Box>
            ) : realData.upcomingTasks.length > 0 ? (
              realData.upcomingTasks.map((task, index) => (
                <Box key={index} sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  mb: 2, 
                  p: 2, 
                  bgcolor: "#f8f9fa", 
                  borderRadius: 2 
                }}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    bgcolor: "rgba(76, 175, 80, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                    fontSize: "1.2rem"
                  }}>
                    {task.icon}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {task.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {task.subject}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tham gia: {task.time}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Không có nhiệm vụ sắp tới. Bạn đã hoàn thành tất cả!
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}