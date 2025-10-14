import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  IconButton,
} from "@mui/material";
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  type: "delete" | "restore";
  isLoading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText = "Hủy",
  type,
  isLoading = false,
}: ConfirmDialogProps) {
  const getIcon = () => {
    switch (type) {
      case "delete":
        return <DeleteIcon sx={{ fontSize: 40, color: "error.main" }} />;
      case "restore":
        return <RestoreIcon sx={{ fontSize: 40, color: "success.main" }} />;
      default:
        return <WarningIcon sx={{ fontSize: 40, color: "warning.main" }} />;
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case "delete":
        return "error";
      case "restore":
        return "success";
      default:
        return "primary";
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 2,
        }}
      >
        <Typography variant="h6" component="div" fontWeight="bold">
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small" disabled={isLoading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 60,
              height: 60,
              borderRadius: "50%",
              bgcolor: type === "delete" ? "error.light" : "success.light",
              opacity: 0.1,
            }}
          >
            {getIcon()}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
              {message}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, fontStyle: "italic" }}
            >
              {type === "delete"
                ? "Hành động này không thể hoàn tác."
                : "Blog sẽ được khôi phục và có thể chỉnh sửa lại."}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: 1, borderColor: "divider" }}>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant="contained"
            color={getConfirmButtonColor()}
            onClick={onConfirm}
            disabled={isLoading}
            startIcon={getIcon()}
          >
            {confirmText}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
