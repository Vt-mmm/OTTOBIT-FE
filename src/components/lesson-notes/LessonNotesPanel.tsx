import { useState, useEffect } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useLocales } from "hooks";
import { useAppDispatch, useAppSelector } from "store/config";
import {
  createLessonNote,
  deleteLessonNote,
  fetchMyLessonNotes,
  updateLessonNote,
} from "store/lessonNote/lessonNoteThunks";
import { clearMyNotes } from "store/lessonNote/lessonNoteSlice";
import type {
  CreateLessonNotePayload,
  LessonNote,
} from "common/@types/lessonNote";
import NoteList from "./NoteList";
import NoteEditor from "./NoteEditor";

interface LessonNotesPanelProps {
  lessonId: string;
  courseId?: string; // Add courseId for proper filtering
  lessonResourceId?: string;
  currentTimestamp?: number;
  onTimestampClick?: (timestamp: number) => void;
}

export default function LessonNotesPanel({
  lessonId,
  courseId,
  lessonResourceId,
  currentTimestamp,
  onTimestampClick,
}: LessonNotesPanelProps) {
  const { translate } = useLocales();
  const dispatch = useAppDispatch();
  const { myNotes, isCreating, isUpdating, isDeleting } = useAppSelector(
    (state) => state.lessonNote
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<LessonNote | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [noteTimestamp, setNoteTimestamp] = useState<number | undefined>(
    undefined
  );

  // Load notes when component mounts or lessonId/courseId changes
  useEffect(() => {
    // Clear old notes immediately to prevent flash of wrong data
    dispatch(clearMyNotes());

    // Then fetch new notes for current lesson
    dispatch(
      fetchMyLessonNotes({
        lessonId,
        courseId, // Add courseId to ensure proper scoping
        pageSize: 10,
      })
    );
  }, [dispatch, lessonId, courseId]); // Add courseId to dependency array

  const handleOpenDialog = (note?: LessonNote) => {
    if (note) {
      setEditingNote(note);
      setNoteContent(note.content);
      setNoteTimestamp(note.timestampInSeconds);
    } else {
      setEditingNote(null);
      setNoteContent("");
      setNoteTimestamp(currentTimestamp);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingNote(null);
    setNoteContent("");
    setNoteTimestamp(undefined);
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim()) return;

    try {
      if (editingNote) {
        // Update existing note
        await dispatch(
          updateLessonNote({
            id: editingNote.id,
            payload: {
              content: noteContent,
              timestampInSeconds: noteTimestamp,
            },
          })
        ).unwrap();
      } else {
        // Create new note
        const payload: CreateLessonNotePayload = {
          lessonId,
          lessonResourceId,
          content: noteContent,
          timestampInSeconds: noteTimestamp,
        };
        await dispatch(createLessonNote(payload)).unwrap();
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await dispatch(deleteLessonNote(noteId)).unwrap();
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const notes = myNotes?.items || [];

  return (
    <Box sx={{ width: "100%" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6">{translate("lessons.MyNotes")}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={isCreating}
        >
          Thêm ghi chú
        </Button>
      </Stack>

      <NoteList
        notes={notes}
        onEdit={handleOpenDialog}
        onDelete={handleDeleteNote}
        onTimestampClick={onTimestampClick}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
      />

      <NoteEditor
        open={isDialogOpen}
        editingNote={editingNote}
        noteContent={noteContent}
        noteTimestamp={noteTimestamp}
        onContentChange={setNoteContent}
        onTimestampChange={setNoteTimestamp}
        onSave={handleSaveNote}
        onClose={handleCloseDialog}
        isSaving={isCreating || isUpdating}
        hasResourceId={!!lessonResourceId}
      />
    </Box>
  );
}
