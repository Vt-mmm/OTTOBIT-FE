import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { CertificateResult } from "common/@types/certificate";
import {
  CERTIFICATE_STATUS_LABELS,
  CERTIFICATE_STATUS_COLORS,
} from "common/enums/certificate.enum";

interface CertificateDetailDialogProps {
  open: boolean;
  onClose: () => void;
  certificate: CertificateResult;
}

export default function CertificateDetailDialog({
  open,
  onClose,
  certificate,
}: CertificateDetailDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h6">Chi tiết chứng chỉ</Typography>
          <Chip
            label={CERTIFICATE_STATUS_LABELS[certificate.status]}
            size="small"
            color={CERTIFICATE_STATUS_COLORS[certificate.status] as any}
            sx={{ fontWeight: 500 }}
          />
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {/* Certificate Number */}
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              bgcolor: "primary.lighter",
              borderColor: "primary.main",
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
              Mã chứng chỉ
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, fontFamily: "monospace" }}
            >
              {certificate.certificateNo}
            </Typography>
          </Paper>

          {/* Certificate Information */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Thông tin chứng chỉ
            </Typography>
            <Stack spacing={2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" color="text.secondary">
                  Học viên
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {certificate.studentFullname}
                </Typography>
              </Stack>
              <Divider />

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" color="text.secondary">
                  Khóa học
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {certificate.courseTitle}
                </Typography>
              </Stack>
              <Divider />

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" color="text.secondary">
                  Ngày cấp
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {new Date(certificate.issuedAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </Stack>
              <Divider />

              {certificate.expiresAt && (
                <>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" color="text.secondary">
                      Ngày hết hạn
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {new Date(certificate.expiresAt).toLocaleDateString(
                        "vi-VN",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )}
                    </Typography>
                  </Stack>
                  <Divider />
                </>
              )}

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" color="text.secondary">
                  Trạng thái
                </Typography>
                <Chip
                  label={CERTIFICATE_STATUS_LABELS[certificate.status]}
                  size="small"
                  color={CERTIFICATE_STATUS_COLORS[certificate.status] as any}
                />
              </Stack>
            </Stack>
          </Box>

          {/* Verification Code */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Mã xác thực
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: "grey.50",
                textAlign: "center",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontFamily: "monospace",
                  letterSpacing: 2,
                }}
              >
                {certificate.verificationCode}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Dùng để xác thực tính hợp lệ của chứng chỉ
              </Typography>
            </Paper>
          </Box>

          {/* Metadata */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Thông tin hệ thống
            </Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  ID Template:
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontFamily: "monospace", color: "text.secondary" }}
                >
                  {certificate.templateId}
                </Typography>
              </Stack>
              {certificate.enrollmentId && (
                <Stack direction="row" spacing={1}>
                  <Typography variant="caption" color="text.secondary">
                    ID Enrollment:
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ fontFamily: "monospace", color: "text.secondary" }}
                  >
                    {certificate.enrollmentId}
                  </Typography>
                </Stack>
              )}
              <Stack direction="row" spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Ngày tạo:
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(certificate.createdAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
