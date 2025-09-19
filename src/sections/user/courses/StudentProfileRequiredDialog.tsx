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
          🎓 Tạo Hồ Sơ Học Sinh
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body1">
            Để tham gia <strong>{courseName}</strong>, bạn cần tạo hồ sơ học sinh trước.
          </Typography>
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <PersonIcon color="primary" />
            Hồ sơ học sinh giúp bạn:
          </Typography>
          
          <Box sx={{ pl: 3 }}>
            {[
              "Theo dõi tiến độ học tập cá nhân",
              "Lưu trữ kết quả bài tập và thành tích",
              "Tham gia đầy đủ các khóa học và thử thách",
              "Nhận chứng chỉ khi hoàn thành khóa học",
            ].map((benefit, index) => (
              <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <CheckIcon color="success" sx={{ fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">
                  {benefit}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
          Chỉ mất 2 phút để tạo hồ sơ và bắt đầu hành trình học tập!
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", p: 3 }}>
        <Button onClick={onClose} color="inherit">
          Để sau
        </Button>
        
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={handleViewMore} variant="outlined">
            Xem thêm
          </Button>
          <Button 
            onClick={handleCreateProfile} 
            variant="contained" 
            startIcon={<PersonIcon />}
          >
            Tạo hồ sơ ngay
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}