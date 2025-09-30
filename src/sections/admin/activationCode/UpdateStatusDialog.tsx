import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Typography,
  SelectChangeEvent,
} from "@mui/material";
import { CodeStatus } from "common/@types/activationCode";

interface UpdateStatusDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (newStatus: CodeStatus) => void;
  currentStatus: CodeStatus;
  code: string;
  isLoading?: boolean;
  error?: string | null;
}

export default function UpdateStatusDialog({
  open,
  onClose,
  onConfirm,
  currentStatus,
  code,
  isLoading = false,
  error = null,
}: UpdateStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<CodeStatus>(currentStatus);

  useEffect(() => {
    if (open) {
      setSelectedStatus(currentStatus);
    }
  }, [open, currentStatus]);

  const handleStatusChange = (event: SelectChangeEvent<number>) => {
    setSelectedStatus(event.target.value as CodeStatus);
  };

  const handleConfirm = () => {
    onConfirm(selectedStatus);
  };

  const handleCancel = () => {
    setSelectedStatus(currentStatus);
    onClose();
  };

  // Disable Used status - không cho admin thay đổi thành Used
  const isUsed = currentStatus === CodeStatus.Used;

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Cập nhật Trạng thái Mã</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          {isUsed && (
            <Alert severity="warning">
              Mã đã được sử dụng. Không thể thay đổi trạng thái.
            </Alert>
          )}

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Mã kích hoạt:
            </Typography>
            <Typography
              variant="body1"
              fontFamily="monospace"
              fontWeight={600}
              sx={{
                p: 1.5,
                bgcolor: "action.hover",
                borderRadius: 1,
              }}
            >
              {code}
            </Typography>
          </Box>

          <FormControl fullWidth disabled={isUsed || isLoading}>
            <InputLabel>Trạng thái mới</InputLabel>
            <Select
              value={selectedStatus}
              label="Trạng thái mới"
              onChange={handleStatusChange}
            >
              <MenuItem value={CodeStatus.Active}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: "success.main",
                    }}
                  />
                  Chưa dùng (Active)
                </Box>
              </MenuItem>
              <MenuItem value={CodeStatus.Used} disabled>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: "action.disabled",
                    }}
                  />
                  Đã dùng (Used) - Không thể chọn
                </Box>
              </MenuItem>
              <MenuItem value={CodeStatus.Expired}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: "error.main",
                    }}
                  />
                  Hết hạn (Expired)
                </Box>
              </MenuItem>
              <MenuItem value={CodeStatus.Revoked}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: "error.main",
                    }}
                  />
                  Thu hồi (Revoked)
                </Box>
              </MenuItem>
              <MenuItem value={CodeStatus.Suspended}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: "warning.main",
                    }}
                  />
                  Tạm ngưng (Suspended)
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {selectedStatus !== currentStatus && !isUsed && (
            <Alert severity="info">
              <Typography variant="body2">
                Bạn đang thay đổi trạng thái từ{" "}
                <strong>{getStatusText(currentStatus)}</strong> sang{" "}
                <strong>{getStatusText(selectedStatus)}</strong>
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCancel} disabled={isLoading}>
          Hủy
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={selectedStatus === currentStatus || isUsed || isLoading}
          startIcon={isLoading && <CircularProgress size={16} />}
        >
          Cập nhật
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function getStatusText(status: CodeStatus): string {
  switch (status) {
    case CodeStatus.Active:
      return "Chưa dùng";
    case CodeStatus.Used:
      return "Đã dùng";
    case CodeStatus.Expired:
      return "Hết hạn";
    case CodeStatus.Revoked:
      return "Thu hồi";
    case CodeStatus.Suspended:
      return "Tạm ngưng";
    default:
      return "Không xác định";
  }
}