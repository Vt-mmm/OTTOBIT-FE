import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { NoteAlt as NoteIcon } from "@mui/icons-material";
import { useLocales } from "hooks";
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
  const { translate } = useLocales();

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
              {translate("lessons.NoNotesYet")}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              {translate("lessons.CreateFirstNote")}
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
