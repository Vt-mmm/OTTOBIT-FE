import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getLessonByIdThunk } from "../../../redux/lesson/lessonThunks";
import LessonMapSelectorSection from "./LessonMapSelectorSection";
import { PATH_USER } from "../../../routes/paths";

interface LessonDetailSectionProps {
  lessonId: string;
}

export default function LessonDetailSection({ lessonId }: LessonDetailSectionProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { data: lesson, isLoading: lessonLoading, error: lessonError } = useAppSelector(
    (state) => state.lesson.currentLesson
  );

  useEffect(() => {
    // Only fetch if lesson not already loaded or lessonId changed
    if (!lesson || lesson.id !== lessonId) {
      dispatch(getLessonByIdThunk(lessonId));
    }
  }, [dispatch, lessonId, lesson?.id]);

  const handleChallengeSelect = (challengeId: string) => {
    // Navigate to studio with challenge ID
    navigate(`${PATH_USER.studio}/${challengeId}`);
  };

  const handleBackToCourse = () => {
    if (lesson?.courseId) {
      navigate(PATH_USER.courseDetail.replace(":id", lesson.courseId));
    } else {
      navigate(PATH_USER.courses);
    }
  };

  const isLoading = lessonLoading;
  const error = lessonError;

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

  if (!lesson) {
    return (
      <Container>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Không tìm thấy bài học
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bài học không tồn tại hoặc đã bị xóa.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* Interactive Map Selector with Tablet UI - Fix sát header */}
      <LessonMapSelectorSection 
        courseId={lesson.courseId || ""}
        lessonId={lessonId}
        onChallengeSelect={handleChallengeSelect}
        onBackToCourse={handleBackToCourse}
      />
    </Box>
  );
}