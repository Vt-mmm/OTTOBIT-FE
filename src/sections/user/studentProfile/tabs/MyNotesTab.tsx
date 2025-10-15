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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
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
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  // Load all notes on mount
  useEffect(() => {
    dispatch(fetchMyLessonNotes({ pageSize: 10 }));
  }, [dispatch]);

  // Get unique courses from notes
  const coursesMap = useMemo(() => {
    const map = new Map<string, number>();

    if (myNotes?.items) {
      myNotes.items.forEach((note) => {
        const courseTitle =
          note.courseTitle || translate("student.UndefinedCourse");
        map.set(courseTitle, (map.get(courseTitle) || 0) + 1);
      });
    }

    return map;
  }, [myNotes]);

  // Filter notes
  const filteredNotes = useMemo(() => {
    let filtered = myNotes?.items || [];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (note) =>
          note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.lessonTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by course
    if (selectedCourse !== "all") {
      filtered = filtered.filter(
        (note) =>
          (note.courseTitle || translate("student.UndefinedCourse")) ===
          selectedCourse
      );
    }

    return filtered;
  }, [myNotes, searchTerm, selectedCourse]);

  // Group filtered notes by course title
  const filteredGroupedNotes = useMemo(() => {
    const groups = new Map<string, typeof filteredNotes>();

    filteredNotes.forEach((note) => {
      const courseTitle =
        note.courseTitle || translate("student.UndefinedCourse");
      if (!groups.has(courseTitle)) {
        groups.set(courseTitle, []);
      }
      groups.get(courseTitle)!.push(note);
    });

    return groups;
  }, [filteredNotes]);

  const handleDelete = async (noteId: string) => {
    if (window.confirm(translate("student.ConfirmDeleteNote"))) {
      await dispatch(deleteLessonNote(noteId));
      // Reload notes after delete
      dispatch(fetchMyLessonNotes({ pageSize: 10 }));
    }
  };

  // Loading state
  if (loading || isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Empty state
  if (!myNotes?.items || myNotes.items.length === 0) {
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

          {/* Course Filter */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>{translate("student.Course")}</InputLabel>
            <Select
              value={selectedCourse}
              label={translate("student.Course")}
              onChange={(e) => setSelectedCourse(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <FilterIcon />
                </InputAdornment>
              }
            >
              <MenuItem value="all">Tất cả</MenuItem>
              {Array.from(coursesMap.entries()).map(([courseTitle, count]) => (
                <MenuItem key={courseTitle} value={courseTitle}>
                  {courseTitle} ({count})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Stats */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            icon={<NoteIcon />}
            label={`${filteredNotes.length} ${translate("student.Notes")}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<SchoolIcon />}
            label={`${filteredGroupedNotes.size} khóa học`}
            size="small"
            color="secondary"
            variant="outlined"
          />
        </Stack>
      </Stack>

      {/* No results */}
      {filteredNotes.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {translate("student.NoNotesFound")}
        </Alert>
      )}

      {/* Notes grouped by course */}
      <Stack spacing={2}>
        {Array.from(filteredGroupedNotes.entries()).map(
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
    </Box>
  );
}
