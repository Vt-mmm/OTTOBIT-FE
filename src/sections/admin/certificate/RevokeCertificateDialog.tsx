import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { AppDispatch } from "store/config";
import { revokeCertificateThunk } from "store/certificate/certificateThunks";
import type { CertificateResult } from "common/@types/certificate";
import { toast } from "react-toastify";

interface RevokeCertificateDialogProps {
  open: boolean;
  onClose: (success?: boolean) => void;
  certificate: CertificateResult;
}

export default function RevokeCertificateDialog({
  open,
  onClose,
  certificate,
}: RevokeCertificateDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do thu hồi!");
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        revokeCertificateThunk({
          id: certificate.id,
          data: { reason: reason.trim() },
        })
      ).unwrap();
      toast.success("Đã thu hồi chứng chỉ thành công!");
      setReason("");
      onClose(true);
    } catch (error: any) {
      toast.error(error || "Có lỗi xảy ra khi thu hồi chứng chỉ!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason("");
      onClose(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Thu hồi chứng chỉ</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Alert severity="warning">
            Bạn đang thu hồi chứng chỉ này. Hành động này sẽ thay đổi trạng thái
            chứng chỉ thành "Đã thu hồi" và có thể ảnh hưởng đến học viên.
          </Alert>

          {/* Certificate Info */}
          <Box
            sx={{
              p: 2,
              bgcolor: "grey.50",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack spacing={1}>
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" fontWeight={600}>
                  Mã chứng chỉ:
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontFamily: "monospace" }}
                >
                  {certificate.certificateNo}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" fontWeight={600}>
                  Học viên:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {certificate.studentFullname}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" fontWeight={600}>
                  Khóa học:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {certificate.courseTitle}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" fontWeight={600}>
                  Ngày cấp:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(certificate.issuedAt).toLocaleDateString("vi-VN")}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {/* Reason Input */}
          <TextField
            fullWidth
            required
            multiline
            rows={4}
            label="Lý do thu hồi"
            placeholder="Nhập lý do thu hồi chứng chỉ..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isSubmitting}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={handleSubmit}
          disabled={isSubmitting || !reason.trim()}
        >
          {isSubmitting ? "Đang xử lý..." : "Thu hồi chứng chỉ"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
