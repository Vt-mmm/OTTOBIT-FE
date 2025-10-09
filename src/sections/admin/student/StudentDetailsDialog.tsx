import React from "react";
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
} from "@mui/material";
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Cake as BirthdayIcon,
  School as EnrollmentIcon,
  Assignment as SubmissionIcon,
} from "@mui/icons-material";
import { StudentResult } from "common/@types/student";
import dayjs from "dayjs";
import useLocales from "hooks/useLocales";

interface StudentDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  student: StudentResult | null;
  isLoading?: boolean;
  onEdit?: () => void;
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

export default function StudentDetailsDialog({
  open,
  onClose,
  student,
  isLoading = false,
  onEdit,
}: StudentDetailsDialogProps) {
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

  if (!student) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Typography>{translate("admin.noStudentData")}</Typography>
        </DialogContent>
      </Dialog>
    );
  }

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
          <PersonIcon color="primary" />
          <Typography variant="h6">{translate("admin.studentDetails")}</Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Basic Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {translate("admin.basicInfo")}
          </Typography>
          <DetailRow
            icon={<PersonIcon fontSize="small" />}
            label={translate("admin.fullName")}
            value={student.fullname}
          />
          <DetailRow
            icon={<PhoneIcon fontSize="small" />}
            label={translate("admin.phoneNumber")}
            value={student.phoneNumber}
          />
          <DetailRow
            icon={<BirthdayIcon fontSize="small" />}
            label={translate("admin.dateOfBirth")}
            value={
              student.dateOfBirth
                ? dayjs(student.dateOfBirth).format("MMM DD, YYYY")
                : "N/A"
            }
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Address Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {translate("admin.addressInfo")}
          </Typography>
          <DetailRow
            icon={<LocationIcon fontSize="small" />}
            label={translate("admin.address")}
            value={student.address}
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <DetailRow
              icon={<LocationIcon fontSize="small" />}
              label={translate("admin.city")}
              value={student.city}
            />
            <DetailRow
              icon={<LocationIcon fontSize="small" />}
              label={translate("admin.stateProvince")}
              value={student.state}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Statistics */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {translate("admin.statistics")}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "primary.lighter",
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <EnrollmentIcon color="primary" />
              <Box>
                <Typography variant="h4" color="primary">
                  {student.enrollmentsCount || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {translate("admin.enrollments")}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "success.lighter",
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <SubmissionIcon color="success" />
              <Box>
                <Typography variant="h4" color="success.main">
                  {student.submissionsCount || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {translate("admin.submissions")}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Metadata */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Account Information
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", py: 1 }}
            >
              <Typography variant="body2" color="text.secondary">
                Student ID:
              </Typography>
              <Typography variant="body2" fontFamily="monospace">
                {student.id}
              </Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", py: 1 }}
            >
              <Typography variant="body2" color="text.secondary">
                User ID:
              </Typography>
              <Typography variant="body2" fontFamily="monospace">
                {student.userId}
              </Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", py: 1 }}
            >
              <Typography variant="body2" color="text.secondary">
                Created At:
              </Typography>
              <Typography variant="body2">
                {dayjs(student.createdAt).format("MMM DD, YYYY HH:mm")}
              </Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", py: 1 }}
            >
              <Typography variant="body2" color="text.secondary">
                Updated At:
              </Typography>
              <Typography variant="body2">
                {dayjs(student.updatedAt).format("MMM DD, YYYY HH:mm")}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        {onEdit && (
          <Button onClick={onEdit} variant="contained">
            Edit Student
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
