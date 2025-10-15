import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Map as MapIcon,
  PlayArrow as PlayIcon,
  Restore as RestoreIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getChallenges } from "../../../redux/challenge/challengeSlice";
import { getCoursesForAdmin } from "../../../redux/course/courseSlice";
import { getLessons } from "../../../redux/lesson/lessonSlice";
import { ChallengeMode } from "common/@types/challenge";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import Pagination from "@mui/material/Pagination";
import { axiosClient } from "axiosClient";
import { extractApiErrorMessage } from "utils/errorHandler";
import { useLocales } from "hooks";

interface ChallengeListSectionProps {
  onCreateNew?: () => void;
  onEditChallenge?: (challenge: any) => void;
  onViewDetails?: (challenge: any) => void;
}

export default function ChallengeListSection({
  onCreateNew,
  onEditChallenge,
}: ChallengeListSectionProps) {
  const { translate } = useLocales();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { challenges } = useAppSelector((state) => state.challenge);
  const adminCourses = useAppSelector(
    (s) => (s as any).course.adminCourses?.data
  );
  const lessonsState = useAppSelector((s) => (s as any).lesson.lessons?.data);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [pendingRestoreId, setPendingRestoreId] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [committedSearch, setCommittedSearch] = useState<string>("");
  const [courseId, setCourseId] = useState<string>("");
  const [lessonId, setLessonId] = useState<string>("");

  useEffect(() => {
    dispatch(
      getChallenges({
        searchTerm: committedSearch || undefined,
        pageNumber: page,
        pageSize,
        includeDeleted: true,
        courseId: courseId || undefined,
        lessonId: lessonId || undefined,
      }) as any
    );
  }, [dispatch, committedSearch, page, pageSize, courseId, lessonId]);

  // Load courses once
  useEffect(() => {
    dispatch(
      getCoursesForAdmin({
        pageNumber: 1,
        pageSize: 10,
        includeDeleted: true,
      }) as any
    );
  }, [dispatch]);

  // Load lessons when course changes
  useEffect(() => {
    if (!courseId) return;
    dispatch(
      getLessons({
        pageNumber: 1,
        pageSize: 10,
        includeDeleted: true,
        courseId,
      }) as any
    );
  }, [dispatch, courseId]);

  useEffect(() => {
    const meta = (challenges as any)?.data;
    if (meta?.totalPages) setTotalPages(meta.totalPages);
    else if (meta?.total && meta?.pageSize)
      setTotalPages(Math.max(1, Math.ceil(meta.total / meta.pageSize)));
  }, [challenges]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  const triggerSearch = () => {
    setCommittedSearch(searchTerm.trim());
    setPage(1);
  };

  // removed mode filter

  const refresh = () => {
    dispatch(
      getChallenges({
        searchTerm: committedSearch || undefined,
        pageNumber: page,
        pageSize,
        includeDeleted: true,
        courseId: courseId || undefined,
        lessonId: lessonId || undefined,
      }) as any
    );
  };

  const handleDelete = async (id: string) => {
    try {
      await (axiosClient as any).delete(`/api/v1/challenges/admin/${id}`);
      refresh();
    } catch (error: any) {
      const errorMessage = extractApiErrorMessage(
        error,
        "Failed to delete challenge"
      );
      console.error("Delete challenge error:", errorMessage);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await (axiosClient as any).post(`/api/v1/challenges/admin/${id}/restore`);
      refresh();
    } catch (error: any) {
      const errorMessage = extractApiErrorMessage(
        error,
        "Failed to restore challenge"
      );
      console.error("Restore challenge error:", errorMessage);
    }
  };

  const handleRestoreConfirm = (id: string) => {
    setPendingRestoreId(id);
    setRestoreConfirmOpen(true);
  };

  const handleViewChallenge = (challenge: any) => {
    setSelectedChallenge(challenge);
    setViewDialogOpen(true);
  };

  const getModeColor = (mode: ChallengeMode) => {
    switch (mode) {
      case ChallengeMode.Simulation:
        return "primary"; // Simulator (0) - blue
      case ChallengeMode.PhysicalFirst:
        return "success"; // Vật lý (1) - green
      default:
        return "default";
    }
  };

  if (challenges.isLoading && !challenges.data) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              flexWrap: { xs: "wrap", sm: "nowrap" },
            }}
          >
            <TextField
              fullWidth
              placeholder={translate("admin.searchChallengePlaceholder")}
              value={searchTerm}
              onChange={handleSearch}
              onKeyDown={(e) => {
                if (e.key === "Enter") triggerSearch();
              }}
              sx={{
                "& .MuiInputBase-root": { pr: 4 },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={triggerSearch}
                      sx={{ mr: 0 }}
                    >
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>{translate("admin.course")}</InputLabel>
              <Select
                label={translate("admin.course")}
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value as string);
                  setLessonId("");
                }}
              >
                <MenuItem value="">{translate("admin.allCourses")}</MenuItem>
                {(adminCourses?.items || []).map((c: any) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl
              size="small"
              sx={{ minWidth: 200 }}
              disabled={!courseId}
            >
              <InputLabel>{translate("admin.lesson")}</InputLabel>
              <Select
                label={translate("admin.lesson")}
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value as string)}
              >
                <MenuItem value="">{translate("admin.allLessons")}</MenuItem>
                {((lessonsState?.items as any[]) || []).map((l: any) => (
                  <MenuItem key={l.id} value={l.id}>
                    {l.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() =>
                onCreateNew
                  ? onCreateNew()
                  : navigate("/admin/challenge-designer?mode=create")
              }
              sx={{
                flexShrink: 0,
                whiteSpace: "nowrap",
                minWidth: "auto",
              }}
            >
              {translate("admin.addChallenge")}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Error Display */}
      {challenges.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {challenges.error}
        </Alert>
      )}

      {/* Challenges Table */}
      <Paper>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>{translate("admin.challenge")}</TableCell>
              <TableCell>{translate("admin.description")}</TableCell>
              <TableCell align="center">{translate("admin.mode")}</TableCell>
              <TableCell align="center">
                {translate("admin.difficulty")}
              </TableCell>
              <TableCell align="center">{translate("admin.order")}</TableCell>
              <TableCell>{translate("admin.status")}</TableCell>
              <TableCell>{translate("admin.created")}</TableCell>
              <TableCell align="center">{translate("admin.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {challenges.data?.items?.map((challenge) => (
              <TableRow
                key={challenge.id}
                hover
                sx={{
                  bgcolor: challenge.isDeleted
                    ? "rgba(255,0,0,0.04)"
                    : undefined,
                  // Use outline for table rows to ensure visible dashed border
                  outline: challenge.isDeleted
                    ? "1px dashed rgba(244,67,54,0.6)"
                    : undefined,
                  outlineOffset: challenge.isDeleted ? "-1px" : undefined,
                }}
              >
                <TableCell>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "medium",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 200,
                      }}
                      title={challenge.title}
                    >
                      {challenge.title}
                    </Typography>
                    {/* status chip moved to dedicated Status column */}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 200,
                        display: "block",
                      }}
                      title={challenge.description}
                    >
                      {challenge.description}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      maxWidth: 340,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {challenge.description || "No description"}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={challenge.challengeMode}
                    size="small"
                    color={getModeColor(challenge.challengeMode) as any}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {challenge.difficulty || 1}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{challenge.order}</Typography>
                </TableCell>
                <TableCell>
                  {challenge.isDeleted ? (
                    <Chip
                      size="small"
                      label={translate("admin.deleted")}
                      color="error"
                      variant="outlined"
                    />
                  ) : (
                    <Chip
                      size="small"
                      label={translate("admin.active")}
                      color="success"
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {dayjs(challenge.createdAt).format("DD/MM/YYYY")}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    title={translate("admin.view")}
                    onClick={() => handleViewChallenge(challenge)}
                  >
                    <ViewIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Empty State */}
        {!challenges.isLoading && challenges.data?.items?.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <MapIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Challenges Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm
                ? "Try adjusting your search or filter criteria"
                : "No challenges have been created yet"}
            </Typography>
            {onCreateNew && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onCreateNew}
              >
                Create First Challenge
              </Button>
            )}
          </Box>
        )}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
          }}
        >
          <FormControl size="small">
            <InputLabel>Page size</InputLabel>
            <Select
              label="Page size"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              sx={{ minWidth: 120 }}
            >
              {[6, 12, 24, 48].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => setPage(v)}
            shape="rounded"
            color="primary"
          />
        </Box>
      </Paper>

      {/* Delete Confirm Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>{translate("admin.confirmDelete")}</DialogTitle>
        <DialogContent>
          {translate("admin.confirmDeleteMessage", { name: "challenge" })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>
            {translate("admin.cancel")}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (pendingDeleteId) await handleDelete(pendingDeleteId);
              setConfirmOpen(false);
              setPendingDeleteId(null);
            }}
          >
            {translate("admin.delete")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog
        open={restoreConfirmOpen}
        onClose={() => setRestoreConfirmOpen(false)}
      >
        <DialogTitle>{translate("admin.confirmRestore")}</DialogTitle>
        <DialogContent>
          {translate("admin.confirmRestoreMessage", { name: "challenge" })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreConfirmOpen(false)}>
            {translate("admin.cancel")}
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              if (pendingRestoreId) {
                handleRestore(pendingRestoreId);
                setRestoreConfirmOpen(false);
                setPendingRestoreId(null);
              }
            }}
          >
            Restore
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Challenge Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Challenge Details</DialogTitle>
        <DialogContent dividers>
          {selectedChallenge && (
            <Box sx={{ p: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedChallenge.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {selectedChallenge.description}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Basic Information
                  </Typography>
                  <Typography variant="body2">
                    <strong>Order:</strong> {selectedChallenge.order}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Difficulty:</strong> {selectedChallenge.difficulty}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Mode:</strong>{" "}
                    {selectedChallenge.challengeMode === 0
                      ? "Simulation"
                      : selectedChallenge.challengeMode === 1
                      ? "Physical First"
                      : "Simulation Physical"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Created:</strong>{" "}
                    {dayjs(selectedChallenge.createdAt).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Updated:</strong>{" "}
                    {dayjs(selectedChallenge.updatedAt).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Statistics
                  </Typography>
                  <Typography variant="body2">
                    <strong>Submissions:</strong>{" "}
                    {selectedChallenge.submissionsCount || 0}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Lesson:</strong>{" "}
                    {selectedChallenge.lessonTitle || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Course:</strong>{" "}
                    {selectedChallenge.courseTitle || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Status:</strong>{" "}
                    {selectedChallenge.isDeleted ? "Deleted" : "Active"}
                  </Typography>
                </Box>
              </Box>

              {selectedChallenge.challengeJson && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Challenge Configuration
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "grey.100",
                      borderRadius: 1,
                      maxHeight: 200,
                      overflow: "auto",
                    }}
                  >
                    <pre style={{ margin: 0, fontSize: "0.75rem" }}>
                      {JSON.stringify(
                        JSON.parse(selectedChallenge.challengeJson),
                        null,
                        2
                      )}
                    </pre>
                  </Box>
                </Box>
              )}

              {selectedChallenge.solutionJson && (
                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Solution Configuration
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "grey.100",
                      borderRadius: 1,
                      maxHeight: 200,
                      overflow: "auto",
                    }}
                  >
                    <pre style={{ margin: 0, fontSize: "0.75rem" }}>
                      {JSON.stringify(
                        JSON.parse(selectedChallenge.solutionJson),
                        null,
                        2
                      )}
                    </pre>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", p: 2 }}>
          <Box>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => {
                setViewDialogOpen(false);
                onEditChallenge?.(selectedChallenge);
              }}
            >
              Edit
            </Button>
            <Button variant="outlined" startIcon={<PlayIcon />} sx={{ ml: 1 }}>
              Test
            </Button>
          </Box>
          <Box>
            {selectedChallenge?.isDeleted ? (
              <Button
                variant="contained"
                color="success"
                startIcon={<RestoreIcon />}
                onClick={() => {
                  handleRestoreConfirm(selectedChallenge.id);
                  setViewDialogOpen(false);
                }}
              >
                Restore
              </Button>
            ) : (
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  setPendingDeleteId(selectedChallenge.id);
                  setConfirmOpen(true);
                  setViewDialogOpen(false);
                }}
              >
                Delete
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
