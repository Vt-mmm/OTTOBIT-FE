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
import PopupSelect from "components/common/PopupSelect";
import { ChallengeMode } from "common/@types/challenge";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import Pagination from "@mui/material/Pagination";
import { axiosClient } from "axiosClient";
import { extractApiErrorMessage } from "utils/errorHandler";
import { useLocales } from "hooks";
import { useNotification } from "hooks/useNotification";

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
  const [pendingDeleteItem, setPendingDeleteItem] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [pendingRestoreItem, setPendingRestoreItem] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [committedSearch, setCommittedSearch] = useState<string>("");
  const [courseId, setCourseId] = useState<string>("");
  const [lessonId, setLessonId] = useState<string>("");
  const [status, setStatus] = useState<"all" | "active">("all");
  const [difficultyFrom, setDifficultyFrom] = useState<string>("");
  const [difficultyTo, setDifficultyTo] = useState<string>("");

  // Committed filter states (only sent to API when search is triggered)
  const [committedCourseId, setCommittedCourseId] = useState<string>("");
  const [committedLessonId, setCommittedLessonId] = useState<string>("");
  const [committedStatus, setCommittedStatus] = useState<"all" | "active">(
    "all"
  );
  const [committedDifficultyFrom, setCommittedDifficultyFrom] =
    useState<string>("");
  const [committedDifficultyTo, setCommittedDifficultyTo] =
    useState<string>("");

  // Pagination states for course and lesson selection
  const [coursePage, setCoursePage] = useState(1);
  const [lessonPage, setLessonPage] = useState(1);
  const [courseLoading, setCourseLoading] = useState(false);
  const [lessonLoading, setLessonLoading] = useState(false);
  const { showNotification, NotificationComponent } = useNotification();

  useEffect(() => {
    dispatch(
      getChallenges({
        searchTerm: committedSearch || undefined,
        pageNumber: page,
        pageSize,
        includeDeleted: committedStatus === "all",
        courseId: committedCourseId || undefined,
        lessonId: committedLessonId || undefined,
        difficultyFrom:
          committedDifficultyFrom !== ""
            ? Number(committedDifficultyFrom)
            : undefined,
        difficultyTo:
          committedDifficultyTo !== ""
            ? Number(committedDifficultyTo)
            : undefined,
      }) as any
    );
  }, [
    dispatch,
    committedSearch,
    page,
    pageSize,
    committedCourseId,
    committedLessonId,
    committedStatus,
    committedDifficultyFrom,
    committedDifficultyTo,
  ]);

  // Fetch courses with pagination
  useEffect(() => {
    const fetchCourses = async () => {
      setCourseLoading(true);
      try {
        await dispatch(
          getCoursesForAdmin({
            pageNumber: coursePage,
            pageSize: 12,
            includeDeleted: true,
          }) as any
        );
      } finally {
        setCourseLoading(false);
      }
    };
    fetchCourses();
  }, [dispatch, coursePage]);

  // Fetch lessons when courseId changes
  useEffect(() => {
    if (courseId) {
      setLessonId(""); // Reset lesson selection when course changes
      setLessonPage(1); // Reset lesson page when course changes
    }
  }, [courseId]);

  // Fetch lessons when courseId or lessonPage changes
  useEffect(() => {
    if (courseId) {
      const fetchLessons = async () => {
        setLessonLoading(true);
        try {
          await dispatch(
            getLessons({
              pageNumber: lessonPage,
              pageSize: 12,
              includeDeleted: true,
              courseId,
            }) as any
          );
        } finally {
          setLessonLoading(false);
        }
      };
      fetchLessons();
    }
  }, [dispatch, courseId, lessonPage]);

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
    setCommittedCourseId(courseId);
    setCommittedLessonId(lessonId);
    setCommittedStatus(status);
    setCommittedDifficultyFrom(difficultyFrom);
    setCommittedDifficultyTo(difficultyTo);
    setPage(1);
  };

  // removed mode filter

  const refresh = () => {
    dispatch(
      getChallenges({
        searchTerm: committedSearch || undefined,
        pageNumber: page,
        pageSize,
        includeDeleted: committedStatus === "all",
        courseId: committedCourseId || undefined,
        lessonId: committedLessonId || undefined,
        difficultyFrom:
          committedDifficultyFrom !== ""
            ? Number(committedDifficultyFrom)
            : undefined,
        difficultyTo:
          committedDifficultyTo !== ""
            ? Number(committedDifficultyTo)
            : undefined,
      }) as any
    );
  };

  const handleDelete = async (id: string, title?: string) => {
    try {
      await (axiosClient as any).delete(`/api/v1/challenges/admin/${id}`);
      refresh();
      showNotification(`Xóa thử thách "${title ?? ""}" thành công`, "success");
    } catch (error: any) {
      const errorMessage = extractApiErrorMessage(
        error,
        "Failed to delete challenge"
      );
      console.error("Delete challenge error:", errorMessage);
      showNotification(`Không thể xóa thử thách "${title ?? ""}"`, "error");
    }
  };

  const handleRestore = async (id: string, title?: string) => {
    try {
      await (axiosClient as any).post(`/api/v1/challenges/admin/${id}/restore`);
      refresh();
      showNotification(
        `Khôi phục thử thách "${title ?? ""}" thành công`,
        "success"
      );
    } catch (error: any) {
      const errorMessage = extractApiErrorMessage(
        error,
        "Failed to restore challenge"
      );
      console.error("Restore challenge error:", errorMessage);
      showNotification(
        `Không thể khôi phục thử thách "${title ?? ""}"`,
        "error"
      );
    }
  };

  const handleRestoreConfirm = (challenge: { id: string; title: string }) => {
    setPendingRestoreItem({ id: challenge.id, title: challenge.title });
    setRestoreConfirmOpen(true);
  };

  const handleViewChallenge = async (challenge: any) => {
    try {
      const res = await axiosClient.get(
        `/api/v1/challenges/admin/${challenge.id}`
      );
      const challengeData = res?.data?.data || challenge;
      setSelectedChallenge(challengeData);
      setViewDialogOpen(true);
    } catch (error: any) {
      const errorMessage = extractApiErrorMessage(
        error,
        "Failed to load challenge details"
      );
      console.error("Load challenge error:", errorMessage);
      // Fallback to original challenge data
      setSelectedChallenge(challenge);
      setViewDialogOpen(true);
    }
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
              display: "grid",
              gap: 2,
              alignItems: "center",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
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
                gridColumn: { xs: "1 / -1", md: "auto" },
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
            <PopupSelect
              label={translate("admin.course")}
              value={courseId}
              onChange={(value) => {
                setCourseId(value);
                setLessonId("");
              }}
              items={adminCourses?.items || []}
              loading={courseLoading}
              pageSize={12}
              getItemLabel={(course) => course.title}
              getItemValue={(course) => course.id}
              noDataMessage={translate("admin.allCourses")}
              currentPage={coursePage}
              onPageChange={setCoursePage}
              totalPages={adminCourses?.totalPages || 1}
              title="Chọn khóa học"
            />
            <PopupSelect
              label={translate("admin.lesson")}
              value={lessonId}
              onChange={setLessonId}
              items={lessonsState?.items || []}
              loading={lessonLoading}
              disabled={!courseId}
              pageSize={12}
              getItemLabel={(lesson) => lesson.title}
              getItemValue={(lesson) => lesson.id}
              noDataMessage={
                !courseId
                  ? "Vui lòng chọn khóa học trước"
                  : translate("admin.allLessons")
              }
              currentPage={lessonPage}
              onPageChange={setLessonPage}
              totalPages={lessonsState?.totalPages || 1}
              title="Chọn bài học"
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>{translate("admin.status")}</InputLabel>
              <Select
                label={translate("admin.status")}
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as any);
                  setPage(1);
                }}
              >
                <MenuItem value="all">{translate("admin.all")}</MenuItem>
                <MenuItem value="active">{translate("admin.active")}</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                size="small"
                label="Từ (độ khó)"
                type="number"
                value={difficultyFrom}
                onChange={(e) => setDifficultyFrom(e.target.value)}
                sx={{
                  width: 250,
                  "& .MuiInputLabel-root": {
                    whiteSpace: "nowrap",
                  },
                }}
                inputProps={{ min: 1, max: 5 }}
              />
              <TextField
                size="small"
                label="Đến (độ khó)"
                type="number"
                value={difficultyTo}
                onChange={(e) => setDifficultyTo(e.target.value)}
                sx={{
                  width: 250,
                  "& .MuiInputLabel-root": {
                    whiteSpace: "nowrap",
                  },
                }}
                inputProps={{ min: 1, max: 5 }}
              />
            </Box>
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
          {`Bạn có chắc muốn xóa thử thách: "${
            pendingDeleteItem?.title ?? ""
          }"?`}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>
            {translate("admin.cancel")}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (pendingDeleteItem)
                await handleDelete(
                  pendingDeleteItem.id,
                  pendingDeleteItem.title
                );
              setConfirmOpen(false);
              setPendingDeleteItem(null);
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
          {`Bạn có chắc muốn khôi phục thử thách: "${
            pendingRestoreItem?.title ?? ""
          }"?`}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreConfirmOpen(false)}>
            {translate("admin.cancel")}
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              if (pendingRestoreItem) {
                handleRestore(pendingRestoreItem.id, pendingRestoreItem.title);
                setRestoreConfirmOpen(false);
                setPendingRestoreItem(null);
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
                  handleRestoreConfirm({
                    id: selectedChallenge.id,
                    title: selectedChallenge.title,
                  });
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
                  setPendingDeleteItem({
                    id: selectedChallenge.id,
                    title: selectedChallenge.title,
                  });
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
      <NotificationComponent />
    </Box>
  );
}
