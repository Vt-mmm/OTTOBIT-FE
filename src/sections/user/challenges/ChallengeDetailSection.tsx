import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  PlayArrow as PlayArrowIcon,
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  EmojiEvents as TrophyIcon,
  Timer as TimerIcon,
  Lightbulb as LightbulbIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getChallengeById } from "../../../redux/challenge/challengeSlice";
import { PATH_USER } from "../../../routes/paths";

interface ChallengeDetailSectionProps {
  challengeId: string;
}

export default function ChallengeDetailSection({ challengeId }: ChallengeDetailSectionProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { data: challenge, isLoading, error } = useAppSelector(
    (state) => state.challenge.currentChallenge
  );

  useEffect(() => {
    // Fetch challenge details
    dispatch(getChallengeById(challengeId));
  }, [dispatch, challengeId]);

  const handleStartChallenge = () => {
    // Navigate to studio with this challenge
    navigate(`/studio?challenge=${challengeId}`);
  };

  const handleBackToLesson = () => {
    if (challenge?.lessonId) {
      navigate(PATH_USER.lessonDetail.replace(":id", challenge.lessonId));
    } else {
      navigate(PATH_USER.courses);
    }
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

  if (!challenge) {
    return (
      <Container>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Không tìm thấy thử thách
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Thử thách không tồn tại hoặc đã bị xóa.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          color="inherit"
          href={PATH_USER.courses}
          onClick={(e) => {
            e.preventDefault();
            navigate(PATH_USER.courses);
          }}
          underline="hover"
        >
          Khóa học
        </Link>
        {challenge.courseTitle && (
          <Link
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Navigate to course detail if we have courseId
            }}
            underline="hover"
          >
            {challenge.courseTitle}
          </Link>
        )}
        {challenge.lessonTitle && (
          <Link
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleBackToLesson();
            }}
            underline="hover"
          >
            {challenge.lessonTitle}
          </Link>
        )}
        <Typography color="text.primary">{challenge.title}</Typography>
      </Breadcrumbs>

      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBackToLesson}
        sx={{ mb: 3 }}
      >
        Quay lại bài học
      </Button>

      {/* Challenge Header */}
      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography variant="h3" component="h1" gutterBottom>
              {challenge.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {challenge.description || "Không có mô tả"}
            </Typography>
            
            {/* Challenge Stats */}
            <Box sx={{ display: "flex", gap: 2, mt: 3, flexWrap: "wrap" }}>
              <Chip
                icon={<AssignmentIcon />}
                label={`Thử thách #${challenge.order || 1}`}
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<TrophyIcon />}
                label={`Độ khó: ${challenge.difficulty || 1}/5`}
                color={challenge.difficulty >= 4 ? "error" : challenge.difficulty >= 3 ? "warning" : "success"}
                variant="outlined"
              />
              {challenge.submissionsCount !== undefined && (
                <Chip
                  icon={<TimerIcon />}
                  label={`${challenge.submissionsCount} lần nộp`}
                  color="info"
                  variant="outlined"
                />
              )}
            </Box>

            {/* Instructions */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom>
                <LightbulbIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Hướng dẫn
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                Sử dụng các khối lệnh để điều khiển robot hoàn thành nhiệm vụ.
                Hãy đọc kỹ mô tả thử thách và lập trình robot một cách hiệu quả nhất.
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: "center" }}>
              <AssignmentIcon 
                sx={{ 
                  fontSize: 120, 
                  color: "primary.main", 
                  mb: 2 
                }} 
              />
              <Typography variant="h6" gutterBottom>
                Sẵn sàng thử thách?
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrowIcon />}
                onClick={handleStartChallenge}
                sx={{ 
                  mt: 2,
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem"
                }}
              >
                Bắt đầu thử thách
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Challenge Info Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <AssignmentIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Thông tin thử thách
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Thứ tự: #{challenge.order || 1}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Độ khó: {challenge.difficulty || 1}/5
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Tạo: {new Date(challenge.createdAt).toLocaleDateString('vi-VN')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <TrophyIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Thống kê
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Số lần nộp: {challenge.submissionsCount || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Bài học: {challenge.lessonTitle || "Không xác định"}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Khóa học: {challenge.courseTitle || "Không xác định"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <LightbulbIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Gợi ý
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Đọc kỹ yêu cầu trước khi bắt đầu
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Sử dụng các khối lệnh phù hợp
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Kiểm tra logic trước khi chạy
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Start Challenge Button */}
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<PlayArrowIcon />}
          onClick={handleStartChallenge}
          sx={{ 
            px: 6,
            py: 2,
            fontSize: "1.2rem"
          }}
        >
          Bắt đầu thử thách ngay
        </Button>
      </Box>
    </Container>
  );
}