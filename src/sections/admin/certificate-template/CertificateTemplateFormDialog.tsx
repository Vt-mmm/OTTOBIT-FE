import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { AppDispatch } from "store/config";
import {
  createCertificateTemplateThunk,
  updateCertificateTemplateThunk,
} from "store/certificateTemplate/certificateTemplateThunks";
import { getCoursesThunk } from "store/course/courseThunks";
import type {
  CertificateTemplateResult,
  CreateCertificateTemplateRequest,
  UpdateCertificateTemplateRequest,
} from "common/@types/certificateTemplate";
import { toast } from "react-toastify";

// Note: ReactQuill will be imported dynamically to avoid SSR issues
// For now, using basic textarea. Team can upgrade to ReactQuill later.

interface CertificateTemplateFormDialogProps {
  open: boolean;
  onClose: () => void;
  template?: CertificateTemplateResult | null;
}

export default function CertificateTemplateFormDialog({
  open,
  onClose,
  template,
}: CertificateTemplateFormDialogProps) {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const { operations } = useSelector((state: any) => state.certificateTemplate);
  const { courses } = useSelector((state: any) => state.course);

  // Form state
  const [formData, setFormData] = useState<
    CreateCertificateTemplateRequest | UpdateCertificateTemplateRequest
  >({
    courseId: "",
    name: "",
    backgroundImageUrl: "",
    bodyHtml: "",
    issuerName: "",
    issuerTitle: "",
    signatureImageUrl: "",
    isActive: true,
  });

  // Load courses
  useEffect(() => {
    if (open) {
      dispatch(getCoursesThunk({ pageNumber: 1, pageSize: 100 }));
    }
  }, [open]);

  // Load template data when editing
  useEffect(() => {
    if (template) {
      setFormData({
        courseId: template.courseId,
        name: template.name,
        backgroundImageUrl: template.backgroundImageUrl,
        bodyHtml: template.bodyHtml,
        issuerName: template.issuerName,
        issuerTitle: template.issuerTitle,
        signatureImageUrl: template.signatureImageUrl,
        isActive: template.isActive,
      });
    } else {
      // Reset form
      setFormData({
        courseId: "",
        name: "",
        backgroundImageUrl: "",
        bodyHtml: `<div style="text-align: center; padding: 40px;">
  <h1 style="font-size: 48px; color: #1976d2;">CHỨNG CHỈ HOÀN THÀNH</h1>
  <p style="font-size: 20px; margin: 20px 0;">Chứng nhận rằng</p>
  <h2 style="font-size: 36px; color: #333; margin: 20px 0;">{{studentName}}</h2>
  <p style="font-size: 18px; margin: 20px 0;">đã hoàn thành xuất sắc khóa học</p>
  <h3 style="font-size: 28px; color: #1976d2; margin: 20px 0;">{{courseName}}</h3>
  <p style="font-size: 16px; margin: 40px 0;">Cấp ngày: {{issueDate}}</p>
  <p style="font-size: 14px; color: #666;">Mã chứng chỉ: {{certificateNo}}</p>
</div>`,
        issuerName: "",
        issuerTitle: "",
        signatureImageUrl: "",
        isActive: true,
      });
    }
  }, [template, open]);

  const handleSubmit = async () => {
    // Validation
    if (!formData.courseId) {
      toast.error("Vui lòng chọn khóa học!");
      return;
    }
    if (!formData.name?.trim()) {
      toast.error("Vui lòng nhập tên mẫu!");
      return;
    }
    if (!formData.bodyHtml?.trim()) {
      toast.error("Vui lòng nhập nội dung chứng chỉ!");
      return;
    }

    try {
      if (template) {
        // Update
        await dispatch(
          updateCertificateTemplateThunk({
            id: template.id,
            data: formData as UpdateCertificateTemplateRequest,
          })
        ).unwrap();
        toast.success("Đã cập nhật mẫu chứng chỉ!");
      } else {
        // Create
        await dispatch(
          createCertificateTemplateThunk(
            formData as CreateCertificateTemplateRequest
          )
        ).unwrap();
        toast.success("Đã tạo mẫu chứng chỉ mới!");
      }
      onClose();
    } catch (error: any) {
      toast.error(error || "Có lỗi xảy ra!");
    }
  };

  const coursesData = courses.data?.items || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {template ? "Chỉnh sửa mẫu chứng chỉ" : "Tạo mẫu chứng chỉ mới"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Course Selection */}
          <FormControl fullWidth required>
            <InputLabel>Khóa học</InputLabel>
            <Select
              value={formData.courseId}
              onChange={(e) =>
                setFormData({ ...formData, courseId: e.target.value })
              }
              label="Khóa học *"
              disabled={operations.isCreating || operations.isUpdating}
            >
              {coursesData.map((course: any) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Template Name */}
          <TextField
            fullWidth
            required
            label="Tên mẫu"
            placeholder="VD: Chứng chỉ hoàn thành khóa học cơ bản"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={operations.isCreating || operations.isUpdating}
          />

          {/* Background Image URL */}
          <TextField
            fullWidth
            label="URL ảnh nền"
            placeholder="https://..."
            value={formData.backgroundImageUrl}
            onChange={(e) =>
              setFormData({ ...formData, backgroundImageUrl: e.target.value })
            }
            disabled={operations.isCreating || operations.isUpdating}
            helperText="URL ảnh nền cho chứng chỉ (tùy chọn)"
          />

          {/* Body HTML */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Nội dung chứng chỉ *
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Placeholders có thể dùng:</strong>
              </Typography>
              <Typography variant="body2" component="div">
                • <code>{"{{studentName}}"}</code> - Tên học viên
                <br />• <code>{"{{courseName}}"}</code> - Tên khóa học
                <br />• <code>{"{{issueDate}}"}</code> - Ngày cấp
                <br />• <code>{"{{certificateNo}}"}</code> - Mã chứng chỉ
              </Typography>
            </Alert>
            <TextField
              fullWidth
              multiline
              rows={12}
              value={formData.bodyHtml}
              onChange={(e) =>
                setFormData({ ...formData, bodyHtml: e.target.value })
              }
              disabled={operations.isCreating || operations.isUpdating}
              placeholder="Nhập HTML content..."
              sx={{
                "& .MuiInputBase-input": {
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                },
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Hỗ trợ HTML. Team có thể tích hợp ReactQuill editor sau.
            </Typography>
          </Box>

          {/* Issuer Information */}
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="Tên người ký"
              placeholder="VD: Nguyễn Văn A"
              value={formData.issuerName}
              onChange={(e) =>
                setFormData({ ...formData, issuerName: e.target.value })
              }
              disabled={operations.isCreating || operations.isUpdating}
            />
            <TextField
              fullWidth
              label="Chức danh"
              placeholder="VD: Giám đốc đào tạo"
              value={formData.issuerTitle}
              onChange={(e) =>
                setFormData({ ...formData, issuerTitle: e.target.value })
              }
              disabled={operations.isCreating || operations.isUpdating}
            />
          </Stack>

          {/* Signature Image URL */}
          <TextField
            fullWidth
            label="URL chữ ký"
            placeholder="https://..."
            value={formData.signatureImageUrl}
            onChange={(e) =>
              setFormData({ ...formData, signatureImageUrl: e.target.value })
            }
            disabled={operations.isCreating || operations.isUpdating}
            helperText="URL ảnh chữ ký (tùy chọn)"
          />

          {/* Active Status */}
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                disabled={operations.isCreating || operations.isUpdating}
              />
            }
            label="Kích hoạt mẫu này"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={operations.isCreating || operations.isUpdating}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={operations.isCreating || operations.isUpdating}
        >
          {operations.isCreating || operations.isUpdating
            ? "Đang xử lý..."
            : template
            ? "Cập nhật"
            : "Tạo mới"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
