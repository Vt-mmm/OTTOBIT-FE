import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
} from "@mui/material";
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "store/config";
import { createStudentThunk } from "store/student/studentThunks";
import { CreateStudentRequest } from "common/@types/student";
import { alpha } from "@mui/material/styles";

interface StudentProfileCreateProps {
  onStudentCreated: () => void;
  onCancel: () => void;
}

export default function StudentProfileCreate({
  onStudentCreated,
  onCancel,
}: StudentProfileCreateProps) {
  const dispatch = useAppDispatch();
  const { operations } = useAppSelector((state) => state.student);
  const createError = operations?.createError;
  const isCreating = operations?.isCreating;

  const [formData, setFormData] = useState({
    fullname: "",
    dateOfBirth: null as Dayjs | null,
  });

  const [errors, setErrors] = useState({
    fullname: "",
    dateOfBirth: "",
  });

  const validateForm = () => {
    const newErrors = {
      fullname: "",
      dateOfBirth: "",
    };

    if (!formData.fullname.trim()) {
      newErrors.fullname = "Vui lòng nhập họ và tên";
    } else if (formData.fullname.trim().length < 2) {
      newErrors.fullname = "Họ và tên phải có ít nhất 2 ký tự";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Vui lòng chọn ngày sinh";
    } else if (dayjs().diff(formData.dateOfBirth, 'year') < 5) {
      newErrors.dateOfBirth = "Tuổi phải từ 5 tuổi trở lên";
    } else if (dayjs().diff(formData.dateOfBirth, 'year') > 100) {
      newErrors.dateOfBirth = "Tuổi không hợp lệ";
    }

    setErrors(newErrors);
    return !newErrors.fullname && !newErrors.dateOfBirth;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const studentData: CreateStudentRequest = {
        fullname: formData.fullname.trim(),
        dateOfBirth: formData.dateOfBirth!.toISOString(),
      };

      console.log('🚀 Creating student with data:', studentData);
      const result = await dispatch(createStudentThunk(studentData)).unwrap();
      console.log('✅ Student created successfully:', result);
      onStudentCreated();
    } catch (error) {
      console.error('❌ Failed to create student profile:', error);
    }
  };

  const handleReset = () => {
    setFormData({
      fullname: "",
      dateOfBirth: null,
    });
    setErrors({
      fullname: "",
      dateOfBirth: "",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        sx={{ 
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(34, 197, 94, 0.15)",
          border: `1px solid ${alpha("#22c55e", 0.2)}`,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: "primary.main",
                mx: "auto",
                mb: 2,
              }}
            >
              <SchoolIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
              🎆 Tạo hồ sơ mới
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Điền thông tin cơ bản để bắt đầu hành trình học tập
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Box sx={{ maxWidth: 500, mx: "auto" }}>
            <TextField
              fullWidth
              label="Họ và tên"
              value={formData.fullname}
              onChange={(e) => {
                setFormData(prev => ({ 
                  ...prev, 
                  fullname: e.target.value 
                }));
                if (errors.fullname) {
                  setErrors(prev => ({ ...prev, fullname: "" }));
                }
              }}
              margin="normal"
              required
              error={!!errors.fullname}
              helperText={errors.fullname}
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />,
              }}
              placeholder="Nhập họ và tên đầy đủ"
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Ngày sinh"
                value={formData.dateOfBirth}
                onChange={(newValue) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    dateOfBirth: newValue 
                  }));
                  if (errors.dateOfBirth) {
                    setErrors(prev => ({ ...prev, dateOfBirth: "" }));
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: "normal",
                    required: true,
                    error: !!errors.dateOfBirth,
                    helperText: errors.dateOfBirth,
                  },
                }}
                maxDate={dayjs().subtract(5, 'year')}
                minDate={dayjs().subtract(100, 'year')}
              />
            </LocalizationProvider>

            {createError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {createError}
              </Alert>
            )}

            <Box sx={{ display: "flex", gap: 2, mt: 4, justifyContent: "center" }}>
              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={isCreating}
                startIcon={<CloseIcon />}
                sx={{ minWidth: 120 }}
              >
                Làm mới
              </Button>
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={isCreating}
                sx={{ minWidth: 120 }}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isCreating}
                startIcon={isCreating ? <CircularProgress size={20} /> : <AddIcon />}
                sx={{ minWidth: 120 }}
              >
                {isCreating ? "Đang tạo..." : "✨ Tạo hồ sơ"}
              </Button>
            </Box>
          </Box>

          <Box 
            sx={{ 
              mt: 4, 
              p: 2.5, 
              bgcolor: alpha("#22c55e", 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha("#22c55e", 0.2)}`,
              textAlign: "center"
            }}
          >
            <Typography variant="body2" color="text.secondary">
              🔒 Thông tin của bạn được bảo mật an toàn
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}