import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useLocales from "hooks/useLocales";
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
  const { translate } = useLocales();

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
      dispatch(getCoursesThunk({ pageNumber: 1, pageSize: 10 }));
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
        bodyHtml: `<div style="width:100%;min-height:600px;box-sizing:border-box;
            padding:56px;background:#ffffff;
            font-family:Segoe UI, Arial, Helvetica, sans-serif;color:#0A0A0A;">

  <div style="max-width:1000px;margin:0 auto;border:3px solid #1f6f3f;
              padding:48px;border-radius:12px;
              background:rgba(255,255,255,.92);">

    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:14px;letter-spacing:3px;color:#1f6f3f;font-weight:700;">
        CERTIFICATE OF COMPLETION
      </div>
    </div>

    <div style="text-align:center;font-size:16px;color:#4b5563;margin-top:8px;">
      This certifies that
    </div>

    <div style="text-align:center;margin:14px 0 10px 0;">
      <span style="display:inline-block;font-size:34px;font-weight:800;color:#0f5132;
                   border-bottom:2px solid #1f6f3f;padding:6px 14px;">
        {{StudentName}}
      </span>
    </div>

    <div style="text-align:center;font-size:18px;color:#374151;margin-top:8px;">
      has successfully completed the course
    </div>

    <div style="text-align:center;margin-top:8px;">
      <span style="display:inline-block;font-size:22px;font-weight:700;color:#14532d;">
        {{CourseTitle}}
      </span>
    </div>

    <div style="display:flex;justify-content:center;gap:18px;margin-top:18px;
                color:#6b7280;font-size:14px;">
      <div>Issued on: <strong style="color:#0f5132;">{{IssueDate}}</strong></div>
      <div style="opacity:.5;">|</div>
      <div>Certificate ID: <strong style="color:#0f5132;">{{CertificateId}}</strong></div>
    </div>

    <div style="height:1px;background:linear-gradient(90deg,#1f6f3f,rgba(31,111,63,0));
                margin:32px 0;"></div>

    <div style="text-align:center;">
      <img src="{{SignatureImageUrl}}" alt="signature"
           style="max-height:72px;max-width:200px;object-fit:contain;margin-bottom:6px;"/>
      <div style="font-weight:700;color:#0f5132;">{{IssuerName}}</div>
      <div style="color:#4b5563;font-size:14px;">{{IssuerTitle}}</div>
    </div>

    <div style="text-align:center;margin-top:28px;color:#9ca3af;font-size:12px;">
      Ottobit Academy · Robotics & STEM Education
    </div>

  </div>
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
      toast.error(translate("admin.certificateTemplate.errorSelectCourse"));
      return;
    }
    if (!formData.name?.trim()) {
      toast.error(translate("admin.certificateTemplate.errorEnterName"));
      return;
    }
    if (!formData.bodyHtml?.trim()) {
      toast.error(translate("admin.certificateTemplate.errorEnterContent"));
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
        toast.success(translate("admin.certificateTemplate.updateSuccess"));
      } else {
        // Create
        await dispatch(
          createCertificateTemplateThunk(
            formData as CreateCertificateTemplateRequest
          )
        ).unwrap();
        toast.success(translate("admin.certificateTemplate.createSuccess"));
      }
      onClose();
    } catch (error: any) {
      toast.error(error || translate("admin.certificateTemplate.error"));
    }
  };

  const coursesData = courses.data?.items || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {template
          ? translate("admin.certificateTemplate.editTitle")
          : translate("admin.certificateTemplate.createTitle")}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Course Selection */}
          <FormControl fullWidth required>
            <InputLabel>
              {translate("admin.certificateTemplate.course")}
            </InputLabel>
            <Select
              value={formData.courseId}
              onChange={(e) =>
                setFormData({ ...formData, courseId: e.target.value })
              }
              label={`${translate("admin.certificateTemplate.course")} *`}
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
            label={translate("admin.certificateTemplate.templateName")}
            placeholder={translate(
              "admin.certificateTemplate.templateNamePlaceholder"
            )}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={operations.isCreating || operations.isUpdating}
          />

          {/* Background Image URL */}
          <TextField
            fullWidth
            label={translate("admin.certificateTemplate.backgroundImageUrl")}
            placeholder="https://..."
            value={formData.backgroundImageUrl}
            onChange={(e) =>
              setFormData({ ...formData, backgroundImageUrl: e.target.value })
            }
            disabled={operations.isCreating || operations.isUpdating}
            helperText={translate(
              "admin.certificateTemplate.backgroundImageHelp"
            )}
          />

          {/* Body HTML */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              {translate("admin.certificateTemplate.content")} *
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>
                  {translate("admin.certificateTemplate.placeholdersTitle")}
                </strong>
              </Typography>
              <Typography variant="body2" component="div">
                • <code>{"{{StudentName}}"}</code> - Tên học viên
                <br />• <code>{"{{CourseTitle}}"}</code> - Tên khóa học
                <br />• <code>{"{{IssueDate}}"}</code> - Ngày cấp
                <br />• <code>{"{{CertificateId}}"}</code> - Mã chứng chỉ
                <br />• <code>{"{{SignatureImageUrl}}"}</code> - URL hình chữ ký
                (tự động thay thế)
                <br />• <code>{"{{IssuerName}}"}</code> - Tên người cấp
                <br />• <code>{"{{IssuerTitle}}"}</code> - Chức danh người cấp
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
              placeholder={translate(
                "admin.certificateTemplate.contentPlaceholder"
              )}
              sx={{
                "& .MuiInputBase-input": {
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                },
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {translate("admin.certificateTemplate.htmlSupport")}
            </Typography>
          </Box>

          {/* Issuer Information */}
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label={translate("admin.certificateTemplate.issuerName")}
              placeholder={translate(
                "admin.certificateTemplate.issuerNamePlaceholder"
              )}
              value={formData.issuerName}
              onChange={(e) =>
                setFormData({ ...formData, issuerName: e.target.value })
              }
              disabled={operations.isCreating || operations.isUpdating}
            />
            <TextField
              fullWidth
              label={translate("admin.certificateTemplate.issuerTitle")}
              placeholder={translate(
                "admin.certificateTemplate.issuerTitlePlaceholder"
              )}
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
            label={translate("admin.certificateTemplate.signatureImageUrl")}
            placeholder="https://..."
            value={formData.signatureImageUrl}
            onChange={(e) =>
              setFormData({ ...formData, signatureImageUrl: e.target.value })
            }
            disabled={operations.isCreating || operations.isUpdating}
            helperText={translate(
              "admin.certificateTemplate.signatureImageHelp"
            )}
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
            label={translate("admin.certificateTemplate.activateTemplate")}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={operations.isCreating || operations.isUpdating}
        >
          {translate("common.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={operations.isCreating || operations.isUpdating}
        >
          {operations.isCreating || operations.isUpdating
            ? translate("common.processing")
            : template
            ? translate("common.update")
            : translate("common.create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
