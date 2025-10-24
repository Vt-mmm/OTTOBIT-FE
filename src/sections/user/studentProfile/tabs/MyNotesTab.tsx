/**
 * MyNotesTab - Display all user's lesson notes grouped by course
 * Part of Student Profile section
 */

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  Chip,
  IconButton,
  Stack,
  Alert,
  CircularProgress,
  Pagination,
} from "@mui/material";
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  NoteAlt as NoteIcon,
  School as SchoolIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "store/config";
import { useLocales } from "hooks";
import {
  fetchMyLessonNotes,
  deleteLessonNote,
} from "store/lessonNote/lessonNoteThunks";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface MyNotesTabProps {
  loading?: boolean;
}

export default function MyNotesTab({ loading }: MyNotesTabProps) {
  const { translate } = useLocales();
  const dispatch = useAppDispatch();
  const { myNotes, isLoading, isDeleting } = useAppSelector(
    (state) => state.lessonNote
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 8; // 8 notes mỗi trang

  // Reset to page 1 when search changes (MUST be before fetch effect)
  useEffect(() => {
    setPageNumber(1);
  }, [searchTerm]);

  // Load all notes on mount, page change, or search change
  useEffect(() => {
    console.log("📄 Fetching notes - Page:", pageNumber, "Search:", searchTerm); // Debug log
    dispatch(
      fetchMyLessonNotes({
        pageNumber,
        pageSize,
        searchTerm: searchTerm || undefined,
      })
    );
  }, [dispatch, pageNumber, searchTerm, pageSize]);

  // Get notes directly from API response (already filtered by server)
  const notes = myNotes?.items || [];

  // Group notes by course title
  const groupedNotes = useMemo(() => {
    const groups = new Map<string, typeof notes>();

    notes.forEach((note) => {
      const courseTitle =
        note.courseTitle || translate("student.UndefinedCourse");
      if (!groups.has(courseTitle)) {
        groups.set(courseTitle, []);
      }
      groups.get(courseTitle)!.push(note);
    });

    return groups;
  }, [notes]);

  const handleDelete = async (noteId: string) => {
    if (window.confirm(translate("student.ConfirmDeleteNote"))) {
      await dispatch(deleteLessonNote(noteId));
      // Reload notes after delete with current search
      dispatch(
        fetchMyLessonNotes({
          pageNumber,
          pageSize,
          searchTerm: searchTerm || undefined,
        })
      );
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    console.log("🔄 Page changed to:", value); // Debug log
    setPageNumber(value);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = myNotes?.totalPages || 0;

  // Loading state
  if (loading || isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Empty state - check total, not items (items might be empty due to pagination)
  if (myNotes?.total === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <NoteIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
        <Typography variant="h5" gutterBottom color="text.secondary">
          {translate("student.NoNotes")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {translate("lessons.CreateFirstNote")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Filters */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          {/* Search */}
          <TextField
            fullWidth
            placeholder={translate("student.SearchNotes")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* Note: Course filter removed - need to fetch all courses from API first */}
        </Stack>

        {/* Stats */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            icon={<NoteIcon />}
            label={`${myNotes?.total || 0} ${translate("student.Notes")}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<SchoolIcon />}
            label={`${groupedNotes.size} khóa học (trang này)`}
            size="small"
            color="secondary"
            variant="outlined"
          />
        </Stack>
      </Stack>

      {/* No results */}
      {notes.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {translate("student.NoNotesFound")}
        </Alert>
      )}

      {/* Notes grouped by course */}
      <Stack spacing={2}>
        {Array.from(groupedNotes.entries()).map(
          ([courseTitle, notes]) => {
            return (
              <Accordion key={courseTitle} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ width: "100%" }}
                  >
                    <SchoolIcon color="primary" />
                    <Typography variant="h6" sx={{ flex: 1 }}>
                      {courseTitle}
                    </Typography>
                    <Chip
                      label={`${notes.length} ${translate("student.Notes")}`}
                      size="small"
                    />
                  </Stack>
                </AccordionSummary>

                <AccordionDetails>
                  <Stack spacing={2}>
                    {notes.map((note) => (
                      <Card
                        key={note.id}
                        sx={{
                          p: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          transition: "all 0.2s",
                          "&:hover": {
                            boxShadow: 3,
                            borderColor: "primary.main",
                          },
                        }}
                      >
                        <Stack spacing={1.5}>
                          {/* Lesson info */}
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-start"
                          >
                            <Box>
                              <Typography
                                variant="subtitle2"
                                color="primary"
                                gutterBottom
                              >
                                📌 {note.lessonTitle || "Bài học"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {note.createdAt
                                  ? format(
                                      new Date(note.createdAt),
                                      "dd/MM/yyyy HH:mm",
                                      { locale: vi }
                                    )
                                  : "N/A"}
                                {note.timestampInSeconds && (
                                  <> • ⏱️ {note.timestampInSeconds}s</>
                                )}
                              </Typography>
                            </Box>

                            {/* Actions */}
                            <Stack direction="row" spacing={0.5}>
                              {/* Edit button removed - not implemented yet */}
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(note.id)}
                                disabled={isDeleting}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Stack>

                          {/* Note content */}
                          <Typography
                            variant="body2"
                            sx={{
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                            }}
                          >
                            {note.content}
                          </Typography>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          }
        )}
      </Stack>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box 
          sx={{ 
            display: "flex", 
            justifyContent: "center", 
            mt: 4, 
            mb: 2,
            pt: 3,
            borderTop: "1px solid",
            borderColor: "divider"
          }}
        >
          <Pagination
            count={totalPages}
            page={pageNumber}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
}
