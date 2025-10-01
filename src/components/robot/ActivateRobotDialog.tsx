import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "store/config";
import { activateRobotThunk } from "store/studentRobot/studentRobotThunks";
import { clearActivationStatus } from "store/studentRobot/studentRobotSlice";

interface ActivateRobotDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ActivateRobotDialog({
  open,
  onClose,
  onSuccess,
}: ActivateRobotDialogProps) {
  const dispatch = useAppDispatch();
  const { activation } = useAppSelector((state) => state.studentRobot);

  const [activationCode, setActivationCode] = useState("");
  const [codeError, setCodeError] = useState("");

  useEffect(() => {
    if (!open) {
      // Reset when dialog closes
      setActivationCode("");
      setCodeError("");
      dispatch(clearActivationStatus());
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (activation.activationSuccess) {
      // Wait a bit to show success message then close
      const timer = setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [activation.activationSuccess, onSuccess, onClose]);

  const validateCode = (code: string): boolean => {
    if (!code || code.trim().length === 0) {
      setCodeError("Vui lòng nhập mã kích hoạt");
      return false;
    }
    if (code.length < 6) {
      setCodeError("Mã kích hoạt không hợp lệ");
      return false;
    }
    setCodeError("");
    return true;
  };

  const handleActivate = () => {
    const trimmedCode = activationCode.trim().toUpperCase();

    if (!validateCode(trimmedCode)) {
      return;
    }

    dispatch(activateRobotThunk({ activationCode: trimmedCode }));
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setActivationCode(value);
    if (codeError) {
      setCodeError("");
    }
  };

  const handleCancel = () => {
    setActivationCode("");
    setCodeError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Kích hoạt Robot</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          {/* Success State */}
          {activation.activationSuccess && (
            <Card
              sx={{ bgcolor: "success.light", borderColor: "success.main" }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CheckCircleIcon
                    sx={{ fontSize: 48, color: "success.dark" }}
                  />
                  <Box>
                    <Typography variant="h6" color="success.dark" gutterBottom>
                      Kích hoạt thành công!
                    </Typography>
                    <Typography variant="body2" color="success.dark">
                      Robot đã được thêm vào tài khoản của bạn.
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {activation.activationError && (
            <Alert severity="error">{activation.activationError}</Alert>
          )}

          {/* Input Form */}
          {!activation.activationSuccess && (
            <>
              <Typography variant="body2" color="text.secondary">
                Nhập mã kích hoạt đi kèm với robot của bạn. Mã này thường được
                in trên thẻ hoặc hộp sản phẩm.
              </Typography>

              <TextField
                label="Mã kích hoạt"
                value={activationCode}
                onChange={handleCodeChange}
                error={!!codeError}
                helperText={codeError || "Ví dụ: OTTO-XXXX-XXXX-XXXX"}
                placeholder="OTTO-XXXX-XXXX-XXXX"
                fullWidth
                autoFocus
                disabled={activation.isActivating}
                inputProps={{
                  style: { textTransform: "uppercase" },
                  maxLength: 50,
                }}
              />

              <Alert severity="info" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  <strong>Lưu ý:</strong> Mỗi mã kích hoạt chỉ có thể sử dụng
                  một lần. Sau khi kích hoạt, bạn có thể sử dụng robot này cho
                  các khóa học tương ứng.
                </Typography>
              </Alert>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {!activation.activationSuccess && (
          <>
            <Button onClick={handleCancel} disabled={activation.isActivating}>
              Hủy
            </Button>
            <Button
              onClick={handleActivate}
              variant="contained"
              disabled={!activationCode.trim() || activation.isActivating}
              startIcon={
                activation.isActivating && <CircularProgress size={16} />
              }
            >
              {activation.isActivating ? "Đang kích hoạt..." : "Kích hoạt"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
