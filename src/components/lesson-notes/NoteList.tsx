import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { NoteAlt as NoteIcon } from "@mui/icons-material";
import type { LessonNote } from "common/@types/lessonNote";
import NoteItem from "./NoteItem";

interface NoteListProps {
  notes: LessonNote[];
  onEdit: (note: LessonNote) => void;
  onDelete: (noteId: string) => void;
  onTimestampClick?: (timestamp: number) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export default function NoteList({
  notes,
  onEdit,
  onDelete,
  onTimestampClick,
  isUpdating = false,
  isDeleting = false,
}: NoteListProps) {
  if (notes.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 4,
            }}
          >
            <NoteIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Chưa có ghi chú nào
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Hãy tạo ghi chú đầu tiên để ghi lại những điểm quan trọng trong
              bài học!
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={2}>
      {notes.map((note) => (
        <NoteItem
          key={note.id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
          onTimestampClick={onTimestampClick}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      ))}
    </Stack>
  );
}
