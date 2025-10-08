import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import type { LessonNote } from "common/@types/lessonNote";

interface NoteEditorProps {
  open: boolean;
  editingNote: LessonNote | null;
  noteContent: string;
  noteTimestamp?: number;
  onContentChange: (content: string) => void;
  onTimestampChange: (timestamp: number | undefined) => void;
  onSave: () => void;
  onClose: () => void;
  isSaving?: boolean;
  hasResourceId?: boolean;
}

export default function NoteEditor({
  open,
  editingNote,
  noteContent,
  noteTimestamp,
  onContentChange,
  onTimestampChange,
  onSave,
  onClose,
  isSaving = false,
  hasResourceId = false,
}: NoteEditorProps) {
  const handleTimestampChange = (value: string) => {
    if (value === "") {
      onTimestampChange(undefined);
    } else {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= 0) {
        onTimestampChange(numValue);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey && noteContent.trim()) {
      onSave();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">
            {editingNote ? "Chỉnh sửa ghi chú" : "Thêm ghi chú mới"}
          </Typography>
          <IconButton size="small" onClick={onClose} disabled={isSaving}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            label="Nội dung ghi chú"
            multiline
            rows={6}
            fullWidth
            value={noteContent}
            onChange={(e) => onContentChange(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Nhập nội dung ghi chú của bạn..."
            required
            autoFocus
            helperText="Nhấn Ctrl + Enter để lưu nhanh"
          />

          {hasResourceId && (
            <TextField
              label="Timestamp (giây)"
              type="number"
              fullWidth
              value={noteTimestamp ?? ""}
              onChange={(e) => handleTimestampChange(e.target.value)}
              placeholder="Vị trí trong video (không bắt buộc)"
              helperText="Vị trí thời gian trong video khi bạn tạo ghi chú này"
              inputProps={{ min: 0, step: 1 }}
            />
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={!noteContent.trim() || isSaving}
          startIcon={isSaving && <CircularProgress size={16} />}
        >
          {editingNote ? "Cập nhật" : "Tạo ghi chú"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
