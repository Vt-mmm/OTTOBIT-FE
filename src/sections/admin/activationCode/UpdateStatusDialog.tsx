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
import { useLocales } from "hooks";

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
  const { translate } = useLocales();
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

  const getStatusText = (status: CodeStatus): string => {
    switch (status) {
      case CodeStatus.Active:
        return translate("admin.codeStatusUnused");
      case CodeStatus.Used:
        return translate("admin.codeStatusUsed");
      case CodeStatus.Expired:
        return translate("admin.codeStatusExpired");
      case CodeStatus.Revoked:
        return translate("admin.codeStatusRevoked");
      case CodeStatus.Suspended:
        return translate("admin.codeStatusSuspended");
      default:
        return translate("admin.codeStatusUnknown");
    }
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{translate("admin.updateStatusTitle")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          {isUsed && (
            <Alert severity="warning">
              {translate("admin.codeUsedCannotChange")}
            </Alert>
          )}

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {translate("admin.activationCodeColumn")}:
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
            <InputLabel>{translate("admin.newStatus")}</InputLabel>
            <Select
              value={selectedStatus}
              label={translate("admin.newStatus")}
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
                  {translate("admin.codeStatusActive")}
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
                  {translate("admin.codeStatusUsedDisabled")}
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
                  {translate("admin.codeStatusExpiredLabel")}
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
                  {translate("admin.codeStatusRevokedLabel")}
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
                  {translate("admin.codeStatusSuspendedLabel")}
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {selectedStatus !== currentStatus && !isUsed && (
            <Alert severity="info">
              <Typography
                variant="body2"
                dangerouslySetInnerHTML={{
                  __html: translate("admin.statusChangeInfo", {
                    from: getStatusText(currentStatus),
                    to: getStatusText(selectedStatus),
                  }),
                }}
              />
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCancel} disabled={isLoading}>
          {translate("admin.cancel")}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={selectedStatus === currentStatus || isUsed || isLoading}
          startIcon={isLoading && <CircularProgress size={16} />}
        >
          {translate("admin.update")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
