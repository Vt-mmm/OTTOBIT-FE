import { useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  Alert,
  Rating,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  Code as CodeIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "store/config";
import { getSubmissionByIdForAdminThunk } from "store/submission/submissionThunks";
import { useNavigate, useParams } from "react-router-dom";
import { PATH_ADMIN } from "routes/paths";
import useLocales from "hooks/useLocales";

export default function SubmissionDetailSection() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { translate } = useLocales();
  const { id } = useParams<{ id: string }>();
  const { adminSubmission } = useAppSelector((state) => state.submission);

  const submission = adminSubmission.data;
  const isLoading = adminSubmission.isLoading;
  const error = adminSubmission.error;

  useEffect(() => {
    if (id) {
      dispatch(getSubmissionByIdForAdminThunk(id));
    }
  }, [id, dispatch]);

  const handleBack = () => {
    navigate(PATH_ADMIN.submissions);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const parseCodeJson = (codeJson: string) => {
    try {
      return JSON.parse(codeJson);
    } catch {
      return codeJson;
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={60} />
          <Typography variant="body1">{translate("admin.loadingSubmissionData")}</Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          {translate("admin.back")}
        </Button>
      </Box>
    );
  }

  if (!submission) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {translate("admin.submissionNotFound")}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          {translate("admin.back")}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            {translate("admin.back")}
          </Button>
          <Typography variant="h4">{translate("admin.submissionDetails")}</Typography>
        </Stack>

        {/* Submission Info */}
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Stack spacing={3}>
                  {/* Challenge Info */}
                  <Box>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      mb={1}
                    >
                      <AssignmentIcon color="primary" />
                      <Typography variant="h6">{translate("admin.challengeInfo")}</Typography>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Challenge
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {submission.challengeTitle || "N/A"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {translate("admin.lesson")}
                        </Typography>
                        <Typography variant="body1">
                          {submission.lessonTitle || "N/A"}
                        </Typography>
                      </Box>
                      {submission.courseTitle && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {translate("admin.course")}
                          </Typography>
                          <Typography variant="body1">
                            {submission.courseTitle}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>

                  {/* Student Info */}
                  <Box>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      mb={1}
                    >
                      <PersonIcon color="primary" />
                      <Typography variant="h6">{translate("admin.studentInfo")}</Typography>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {translate("admin.student")}
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {submission.studentName || "N/A"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Code JSON */}
                  <Box>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      mb={1}
                    >
                      <CodeIcon color="primary" />
                      <Typography variant="h6">{translate("admin.codeJson")}</Typography>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        maxHeight: 400,
                        overflow: "auto",
                        backgroundColor: "grey.900",
                        color: "common.white",
                        fontFamily: "monospace",
                        fontSize: "0.875rem",
                      }}
                    >
                      <pre
                        style={{
                          margin: 0,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {JSON.stringify(
                          parseCodeJson(submission.codeJson),
                          null,
                          2
                        )}
                      </pre>
                    </Paper>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Rating Card */}
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">{translate("admin.rating")}</Typography>
                    <Divider />
                    <Box textAlign="center">
                      <Rating
                        value={submission.star}
                        max={3}
                        readOnly
                        size="large"
                        sx={{ fontSize: "3rem" }}
                      />
                      <Typography variant="h4" fontWeight={600} mt={1}>
                        {submission.star}/3
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Timestamp Card */}
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarIcon color="primary" />
                      <Typography variant="h6">{translate("admin.time")}</Typography>
                    </Stack>
                    <Divider />
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {translate("admin.submittedDate")}
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(submission.createdAt)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {translate("admin.updatedAt")}
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(submission.updatedAt)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              {/* IDs Card (for debugging) */}
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">IDs</Typography>
                    <Divider />
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Submission ID
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "0.75rem",
                            wordBreak: "break-all",
                          }}
                        >
                          {submission.id}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Challenge ID
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "0.75rem",
                            wordBreak: "break-all",
                          }}
                        >
                          {submission.challengeId}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Student ID
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "0.75rem",
                            wordBreak: "break-all",
                          }}
                        >
                          {submission.studentId}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}
