import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import type { LessonNote } from "common/@types/lessonNote";

interface NoteItemProps {
  note: LessonNote;
  onEdit: (note: LessonNote) => void;
  onDelete: (noteId: string) => void;
  onTimestampClick?: (timestamp: number) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export default function NoteItem({
  note,
  onEdit,
  onDelete,
  onTimestampClick,
  isUpdating = false,
  isDeleting = false,
}: NoteItemProps) {
  const formatTimestamp = (seconds?: number) => {
    if (seconds === undefined) return null;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleDeleteClick = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa ghi chú này?")) {
      onDelete(note.id);
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" sx={{ mb: 1, whiteSpace: "pre-wrap" }}>
              {note.content}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
            >
              {note.timestampInSeconds !== undefined && (
                <Chip
                  icon={<TimeIcon />}
                  label={formatTimestamp(note.timestampInSeconds)}
                  size="small"
                  onClick={() =>
                    onTimestampClick &&
                    note.timestampInSeconds !== undefined &&
                    onTimestampClick(note.timestampInSeconds)
                  }
                  sx={{
                    cursor: onTimestampClick ? "pointer" : "default",
                    "&:hover": onTimestampClick
                      ? {
                          backgroundColor: "action.hover",
                        }
                      : undefined,
                  }}
                  color="primary"
                  variant="outlined"
                />
              )}
              {note.resourceTitle && (
                <Chip
                  label={note.resourceTitle}
                  size="small"
                  variant="outlined"
                />
              )}
            </Stack>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              {formatDistanceToNow(new Date(note.createdAt), {
                addSuffix: true,
                locale: vi,
              })}
              {note.updatedAt !== note.createdAt && " • Đã chỉnh sửa"}
            </Typography>
          </Box>

          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Chỉnh sửa">
              <IconButton
                size="small"
                onClick={() => onEdit(note)}
                disabled={isUpdating}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Xóa">
              <IconButton
                size="small"
                onClick={handleDeleteClick}
                disabled={isDeleting}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
