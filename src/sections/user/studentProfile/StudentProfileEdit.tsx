import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Save as SaveIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "store/config";
import { updateStudentThunk } from "store/student/studentThunks";
import { UpdateStudentRequest } from "common/@types/student";

interface StudentProfileEditProps {
  onEditComplete: () => void;
  onCancel: () => void;
}

export default function StudentProfileEdit({
  onEditComplete,
  onCancel,
}: StudentProfileEditProps) {
  const dispatch = useAppDispatch();
  const { currentStudent, operations } = useAppSelector((state) => state.student);
  const updateError = operations?.updateError;
  const isUpdating = operations?.isUpdating;

  const [formData, setFormData] = useState({
    fullname: "",
    phoneNumber: "",
    address: "",
    state: "",
    city: "",
    dateOfBirth: null as Dayjs | null,
  });

  const [errors, setErrors] = useState({
    fullname: "",
    phoneNumber: "",
    dateOfBirth: "",
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (currentStudent?.data) {
      const student = currentStudent.data;
      const initialData = {
        fullname: student.fullname,
        phoneNumber: student.phoneNumber || "",
        address: student.address || "",
        state: student.state || "",
        city: student.city || "",
        dateOfBirth: dayjs(student.dateOfBirth),
      };
      setFormData(initialData);
    }
  }, [currentStudent]);

  useEffect(() => {
    if (currentStudent?.data) {
      const student = currentStudent.data;
      const hasNameChange = formData.fullname !== student.fullname;
      const hasPhoneChange = formData.phoneNumber !== (student.phoneNumber || "");
      const hasAddressChange = formData.address !== (student.address || "");
      const hasStateChange = formData.state !== (student.state || "");
      const hasCityChange = formData.city !== (student.city || "");
      const hasDateChange = formData.dateOfBirth && 
        !formData.dateOfBirth.isSame(dayjs(student.dateOfBirth), 'day');
      
      setHasChanges(!!(hasNameChange || hasPhoneChange || hasAddressChange || hasStateChange || hasCityChange || hasDateChange));
    }
  }, [formData, currentStudent]);

  const validateForm = () => {
    const newErrors = {
      fullname: "",
      phoneNumber: "",
      dateOfBirth: "",
    };

    if (!formData.fullname.trim()) {
      newErrors.fullname = "Vui lòng nhập họ và tên";
    } else if (formData.fullname.trim().length < 2) {
      newErrors.fullname = "Họ và tên phải có ít nhất 2 ký tự";
    }

    if (formData.phoneNumber && !/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại phải có 10-11 chữ số";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Vui lòng chọn ngày sinh";
    } else if (dayjs().diff(formData.dateOfBirth, 'year') < 5) {
      newErrors.dateOfBirth = "Tuổi phải từ 5 tuổi trở lên";
    } else if (dayjs().diff(formData.dateOfBirth, 'year') > 100) {
      newErrors.dateOfBirth = "Tuổi không hợp lệ";
    }

    setErrors(newErrors);
    return !newErrors.fullname && !newErrors.phoneNumber && !newErrors.dateOfBirth;
  };

  const handleSubmit = async () => {
    if (!currentStudent?.data || !validateForm()) {
      return;
    }

    try {
      const updateData: UpdateStudentRequest = {
        fullname: formData.fullname.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        state: formData.state.trim(),
        city: formData.city.trim(),
        dateOfBirth: formData.dateOfBirth!.toISOString(),
      };

      await dispatch(updateStudentThunk({ 
        id: currentStudent.data.id, 
        data: updateData 
      })).unwrap();
      
      onEditComplete();
    } catch (error) {
      console.error("Failed to update student profile:", error);
    }
  };

  const handleReset = () => {
    if (currentStudent?.data) {
      const student = currentStudent.data;
      setFormData({
        fullname: student.fullname,
        phoneNumber: student.phoneNumber || "",
        address: student.address || "",
        state: student.state || "",
        city: student.city || "",
        dateOfBirth: dayjs(student.dateOfBirth),
      });
      setErrors({
        fullname: "",
        phoneNumber: "",
        dateOfBirth: "",
      });
    }
  };

  if (!currentStudent?.data) {
    return null;
  }

  return (
    <Box sx={{
      bgcolor: "transparent",
      minHeight: "100vh", 
      p: { xs: 2, md: 3 },
      borderRadius: 4,
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card 
          sx={{ 
            borderRadius: { xs: 3, md: 4 },
            boxShadow: (theme) => `0 8px 32px ${theme.palette.primary.main}20`,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            backdropFilter: "blur(16px)",
            maxWidth: 600,
            mx: "auto"
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Avatar
              sx={{
                width: { xs: 72, md: 96 },
                height: { xs: 72, md: 96 },
                bgcolor: (theme) => theme.palette.primary.light,
                mx: "auto",
                mb: 2,
                p: 1.25,
                boxShadow: (theme) => `0 8px 24px ${theme.palette.primary.main}40`
              }}
            >
              <Box component="img" src="/asset/IconEdit3D.png" alt="Edit profile"
                sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1, color: 'text.primary' }}>
            Chỉnh sửa hồ sơ học sinh
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Cập nhật thông tin cá nhân của bạn
            </Typography>
            {hasChanges && (
            <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="primary.main" sx={{ 
            fontWeight: "bold",
            px: 2,
            py: 0.5,
            bgcolor: (theme) => theme.palette.action.hover,
            borderRadius: 1,
            border: (theme) => `1px solid ${theme.palette.divider}`
            }}>
            Có thay đổi chưa lưu
            </Typography>
            </Box>
            )}
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Box sx={{ maxWidth: 600 }}>
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
              helperText={errors.fullname || "Nhập họ và tên đầy đủ"}
              placeholder="Ví dụ: Nguyễn Văn An"
            />

            <TextField
              fullWidth
              label="Số điện thoại"
              value={formData.phoneNumber}
              onChange={(e) => {
                setFormData(prev => ({ 
                  ...prev, 
                  phoneNumber: e.target.value 
                }));
                if (errors.phoneNumber) {
                  setErrors(prev => ({ ...prev, phoneNumber: "" }));
                }
              }}
              margin="normal"
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber || "Tùy chọn"}
              placeholder="Nhập số điện thoại"
            />

            <TextField
              fullWidth
              label="Địa chỉ"
              value={formData.address}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, address: e.target.value }))
              }
              margin="normal"
              placeholder="Nhập địa chỉ (Tùy chọn)"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Tỉnh/Thành phố"
                value={formData.state}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, state: e.target.value }))
                }
                margin="normal"
                placeholder="Tùy chọn"
              />

              <TextField
                fullWidth
                label="Quận/Huyện"
                value={formData.city}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, city: e.target.value }))
                }
                margin="normal"
                placeholder="Tùy chọn"
              />
            </Box>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Ngày sinh"
                value={formData.dateOfBirth}
                onChange={(newValue: dayjs.Dayjs | null) => {
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
                    helperText: errors.dateOfBirth || "Chọn ngày sinh của bạn",
                  },
                }}
                maxDate={dayjs().subtract(5, 'year')}
                minDate={dayjs().subtract(100, 'year')}
              />
            </LocalizationProvider>

            {updateError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {updateError}
              </Alert>
            )}

            <Box sx={{ display: "flex", gap: 2, mt: 4, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleReset}
                disabled={isUpdating}
                startIcon={<CloseIcon />}
              >
                Đặt lại
              </Button>
              <Button
                variant="text"
                onClick={onCancel}
                disabled={isUpdating}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={!hasChanges || isUpdating}
                startIcon={isUpdating ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
    </Box>
  );
}
