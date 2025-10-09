import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Divider,
  CircularProgress,
  LinearProgress,
  Chip,
} from "@mui/material";
import {
  Close as CloseIcon,
  SchoolOutlined as EnrollmentIcon,
  Person as PersonIcon,
  Book as CourseIcon,
  CheckCircle as CompletedIcon,
  Schedule as InProgressIcon,
  CalendarToday as DateIcon,
} from "@mui/icons-material";
import { EnrollmentResult } from "common/@types/enrollment";
import dayjs from "dayjs";
import useLocales from "hooks/useLocales";

interface EnrollmentDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  enrollment: EnrollmentResult | null;
  isLoading?: boolean;
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | React.ReactNode;
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        py: 1.5,
      }}
    >
      <Box sx={{ color: "primary.main", mt: 0.5 }}>{icon}</Box>
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 0.5, fontWeight: 500 }}
        >
          {label}
        </Typography>
        <Typography variant="body1">{value || "N/A"}</Typography>
      </Box>
    </Box>
  );
}

export default function EnrollmentDetailsDialog({
  open,
  onClose,
  enrollment,
  isLoading = false,
}: EnrollmentDetailsDialogProps) {
  const { translate } = useLocales();
  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 5,
          }}
        >
          <CircularProgress />
        </Box>
      </Dialog>
    );
  }

  if (!enrollment) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Typography>{translate("admin.noEnrollmentData")}</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  const getStatusColor = () => {
    if (enrollment.isCompleted) return "success";
    return "warning";
  };

  const getStatusIcon = () => {
    return enrollment.isCompleted ? (
      <CompletedIcon fontSize="small" />
    ) : (
      <InProgressIcon fontSize="small" />
    );
  };

  const progressPercentage = Math.round(enrollment.progress ?? 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <EnrollmentIcon color="primary" />
          <Typography variant="h6">{translate("admin.enrollmentDetails")}</Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Status Badge */}
        <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
          <Chip
            icon={getStatusIcon()}
            label={enrollment.isCompleted ? translate("admin.completed") : translate("admin.inProgress")}
            color={getStatusColor()}
            sx={{ px: 2, py: 2.5, fontSize: "0.9rem" }}
          />
        </Box>

        {/* Progress Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {translate("admin.progressOverview")}
          </Typography>
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: "primary.lighter",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="body2" fontWeight="medium">
                {translate("admin.overallProgress")}
              </Typography>
              <Typography variant="h5" color="primary" fontWeight="bold">
                {progressPercentage}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 10,
                borderRadius: 5,
                mb: 2,
              }}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {translate("admin.completedLessons")}
                </Typography>
                <Typography variant="h6" color="success.main">
                  {enrollment.completedLessonsCount}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {translate("admin.totalLessons")}
                </Typography>
                <Typography variant="h6">
                  {enrollment.totalLessonsCount}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {translate("admin.remaining")}
                </Typography>
                <Typography variant="h6" color="warning.main">
                  {enrollment.totalLessonsCount -
                    enrollment.completedLessonsCount}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Student Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {translate("admin.studentInfo")}
          </Typography>
          <DetailRow
            icon={<PersonIcon fontSize="small" />}
            label={translate("admin.studentName")}
            value={enrollment.studentName || "N/A"}
          />
          <DetailRow
            icon={<PersonIcon fontSize="small" />}
            label={translate("admin.studentID")}
            value={
              <Typography variant="body2" fontFamily="monospace">
                {enrollment.studentId}
              </Typography>
            }
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Course Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {translate("admin.courseInfo")}
          </Typography>
          <DetailRow
            icon={<CourseIcon fontSize="small" />}
            label={translate("admin.courseTitle")}
            value={enrollment.courseTitle || "N/A"}
          />
          {enrollment.courseDescription && (
            <DetailRow
              icon={<CourseIcon fontSize="small" />}
              label={translate("admin.description")}
              value={enrollment.courseDescription}
            />
          )}
          <DetailRow
            icon={<CourseIcon fontSize="small" />}
            label={translate("admin.courseID")}
            value={
              <Typography variant="body2" fontFamily="monospace">
                {enrollment.courseId}
              </Typography>
            }
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Timeline Information */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {translate("admin.timeline")}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <DetailRow
              icon={<DateIcon fontSize="small" />}
              label={translate("admin.enrollmentDate")}
              value={dayjs(enrollment.enrollmentDate).format(
                "MMM DD, YYYY HH:mm"
              )}
            />
            {enrollment.lastAccessedAt && (
              <DetailRow
                icon={<DateIcon fontSize="small" />}
                label={translate("admin.lastAccessed")}
                value={dayjs(enrollment.lastAccessedAt).format(
                  "MMM DD, YYYY HH:mm"
                )}
              />
            )}
            <DetailRow
              icon={<DateIcon fontSize="small" />}
              label={translate("admin.createdAt")}
              value={dayjs(enrollment.createdAt).format("MMM DD, YYYY HH:mm")}
            />
            <DetailRow
              icon={<DateIcon fontSize="small" />}
              label={translate("admin.updatedAt")}
              value={dayjs(enrollment.updatedAt).format("MMM DD, YYYY HH:mm")}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Metadata */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {translate("admin.additionalInfo")}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {translate("admin.enrollmentID")}:
            </Typography>
            <Typography variant="body2" fontFamily="monospace">
              {enrollment.id}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">
          {translate("admin.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
