import { useState, useEffect, useRef } from "react";
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
import { redeemActivationCodeThunk } from "store/activationCode/activationCodeThunks";
import { useLocales } from "hooks";
import { clearRedeemStatus } from "store/activationCode/activationCodeSlice";

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
  const { translate } = useLocales();
  const { operations } = useAppSelector((state) => state.activationCode);

  const [activationCode, setActivationCode] = useState("");
  const [codeError, setCodeError] = useState("");

  // Use refs to store latest callbacks to avoid infinite loop
  const onSuccessRef = useRef(onSuccess);
  const onCloseRef = useRef(onClose);

  // Update refs when callbacks change
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onCloseRef.current = onClose;
  }, [onSuccess, onClose]);

  useEffect(() => {
    if (!open) {
      // Reset when dialog closes
      setActivationCode("");
      setCodeError("");
      dispatch(clearRedeemStatus());
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (operations.redeemSuccess) {
      // Call onSuccess immediately to refresh parent component using ref
      onSuccessRef.current?.();

      // Wait a bit to show success message then close dialog
      const timer = setTimeout(() => {
        onCloseRef.current?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [operations.redeemSuccess]);

  const validateCode = (code: string): boolean => {
    if (!code || code.trim().length === 0) {
      setCodeError(translate("common.EnterActivationCode"));
      return false;
    }
    if (code.length < 6) {
      setCodeError(translate("common.InvalidActivationCode"));
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

    dispatch(redeemActivationCodeThunk({ code: trimmedCode }));
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
          {operations.redeemSuccess && (
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
          {operations.redeemError && (
            <Alert severity="error">{operations.redeemError}</Alert>
          )}

          {/* Input Form */}
          {!operations.redeemSuccess && (
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
                helperText={codeError || translate("common.ExampleCode")}
                placeholder="OTTO-XXXX-XXXX-XXXX"
                fullWidth
                autoFocus
                disabled={operations.isRedeeming}
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
        {!operations.redeemSuccess && (
          <>
            <Button onClick={handleCancel} disabled={operations.isRedeeming}>
              Hủy
            </Button>
            <Button
              onClick={handleActivate}
              variant="contained"
              disabled={!activationCode.trim() || operations.isRedeeming}
              startIcon={
                operations.isRedeeming && <CircularProgress size={16} />
              }
            >
              {operations.isRedeeming
                ? translate("common.Activating")
                : translate("common.Activate")}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
