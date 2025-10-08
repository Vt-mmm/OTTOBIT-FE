import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Divider,
  Alert,
} from "@mui/material";
import {
  School as SchoolIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { PATH_USER } from "../../../routes/paths";
import { useLocales } from "../../../hooks";

interface StudentProfileRequiredDialogProps {
  open: boolean;
  onClose: () => void;
  courseName?: string;
  onCreateProfile?: () => void;
}

export default function StudentProfileRequiredDialog({
  open,
  onClose,
  courseName = "khóa học này",
  onCreateProfile,
}: StudentProfileRequiredDialogProps) {
  const { translate } = useLocales();
  const navigate = useNavigate();

  const handleCreateProfile = () => {
    if (onCreateProfile) {
      onCreateProfile();
    } else {
      navigate(PATH_USER.studentProfile);
    }
    onClose();
  };

  const handleViewMore = () => {
    navigate(PATH_USER.studentProfile);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(34, 197, 94, 0.15)",
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            bgcolor: "primary.main",
            mx: "auto",
            mb: 2,
          }}
        >
          <SchoolIcon sx={{ fontSize: 32 }} />
        </Avatar>
        <Typography variant="h5" component="div" sx={{ fontWeight: "bold" }}>
          🎓 {translate("courses.CreateStudentProfile")}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body1">
            <span
              dangerouslySetInnerHTML={{
                __html: translate("courses.ProfileRequiredFor", { courseName }),
              }}
            />
          </Typography>
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
          >
            <PersonIcon color="primary" />
            {translate("courses.ProfileBenefitsTitle")}
          </Typography>

          <Box sx={{ pl: 3 }}>
            {[
              translate("courses.TrackProgress"),
              translate("courses.SaveResults"),
              translate("courses.JoinCourses"),
              translate("courses.EarnCertificates"),
            ].map((benefit, index) => (
              <Box
                key={index}
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <CheckIcon color="success" sx={{ fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">
                  {benefit}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          {translate("courses.QuickSetup")}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", p: 3 }}>
        <Button onClick={onClose} color="inherit">
          {translate("courses.Later")}
        </Button>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={handleViewMore} variant="outlined">
            {translate("courses.ViewMore")}
          </Button>
          <Button
            onClick={handleCreateProfile}
            variant="contained"
            startIcon={<PersonIcon />}
          >
            {translate("courses.CreateProfileNow")}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
