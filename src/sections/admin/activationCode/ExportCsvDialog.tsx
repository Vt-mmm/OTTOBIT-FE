import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";
import { Download as DownloadIcon } from "@mui/icons-material";

interface ExportCsvDialogProps {
  open: boolean;
  onClose: () => void;
  onExport: (batchId: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function ExportCsvDialog({
  open,
  onClose,
  onExport,
  isLoading = false,
  error = null,
}: ExportCsvDialogProps) {
  const [batchId, setBatchId] = useState("");

  useEffect(() => {
    if (open) {
      setBatchId("");
    }
  }, [open]);

  const handleExport = () => {
    if (batchId.trim()) {
      onExport(batchId.trim());
    }
  };

  const handleCancel = () => {
    setBatchId("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DownloadIcon />
          Export Activation Codes (CSV)
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <Alert severity="info">
            <Typography variant="body2">
              Nhập <strong>Batch ID</strong> để export tất cả mã kích hoạt trong
              batch đó ra file CSV.
            </Typography>
          </Alert>

          <TextField
            label="Batch ID *"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            placeholder="Ví dụ: PROMO2024, EVENT-JAN"
            helperText="Nhập chính xác Batch ID cần export"
            disabled={isLoading}
            autoFocus
          />

          <Alert severity="warning">
            <Typography variant="body2">
              File CSV sẽ bao gồm các cột:
            </Typography>
            <Typography
              variant="caption"
              component="div"
              sx={{ mt: 1, fontFamily: "monospace" }}
            >
              Code, Status, ExpiresAt, UsedAt, UsedById, RobotId, BatchId
            </Typography>
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCancel} disabled={isLoading}>
          Hủy
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={!batchId.trim() || isLoading}
          startIcon={
            isLoading ? (
              <CircularProgress size={16} />
            ) : (
              <DownloadIcon />
            )
          }
        >
          {isLoading ? "Đang export..." : "Export CSV"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}