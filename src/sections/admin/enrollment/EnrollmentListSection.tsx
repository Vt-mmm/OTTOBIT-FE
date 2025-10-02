import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  Pagination,
} from "@mui/material";
import {
  Search as SearchIcon,
  SchoolOutlined as EnrollmentIcon,
  Person as PersonIcon,
  Book as CourseIcon,
  CheckCircle as CompletedIcon,
  Schedule as InProgressIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "store/config";
import { getEnrollments } from "store/enrollment/enrollmentSlice";
import { EnrollmentResult } from "common/@types/enrollment";
import dayjs from "dayjs";
import EnrollmentDetailsDialog from "./EnrollmentDetailsDialog";

interface EnrollmentListSectionProps {}

export default function EnrollmentListSection({}: EnrollmentListSectionProps) {
  const dispatch = useAppDispatch();
  const { enrollments } = useAppSelector((state) => state.enrollment);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "" | "completed" | "in_progress"
  >("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Dialog state
  const [detailsDialog, setDetailsDialog] = useState<{
    open: boolean;
    enrollment?: EnrollmentResult;
  }>({ open: false }); // Fetch enrollments
  useEffect(() => {
    const isCompleted =
      statusFilter === "completed"
        ? true
        : statusFilter === "in_progress"
        ? false
        : undefined;

    dispatch(
      getEnrollments({
        searchTerm: committedSearch || undefined,
        isCompleted,
        pageNumber,
        pageSize,
      })
    );
  }, [dispatch, committedSearch, statusFilter, pageNumber, pageSize]);

  // Handlers
  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const triggerSearch = () => {
    setCommittedSearch(searchTerm.trim());
    setPageNumber(1);
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
    setPageNumber(1);
  };

  const handleViewDetails = (enrollment: EnrollmentResult) => {
    setDetailsDialog({ open: true, enrollment });
  };

  const getStatusIcon = (isCompleted: boolean) => {
    return isCompleted ? (
      <CompletedIcon fontSize="small" />
    ) : (
      <InProgressIcon fontSize="small" />
    );
  };

  const getStatusColor = (isCompleted: boolean) => {
    return isCompleted ? "success" : "primary";
  };

  if (enrollments.isLoading && !enrollments.data) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            📚 Enrollments Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            View and manage student course enrollments
          </Typography>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              fullWidth
              placeholder="Search by student name, course title..."
              value={searchTerm}
              onChange={handleSearchInput}
              onKeyDown={(e) => {
                if (e.key === "Enter") triggerSearch();
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
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
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Error Display */}
      {enrollments.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {enrollments.error}
        </Alert>
      )}

      {/* Enrollments Table */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Course</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Progress</TableCell>
              <TableCell>Enrolled</TableCell>
              <TableCell>Last Activity</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {enrollments.data?.items?.map((enrollment) => (
              <TableRow key={enrollment.id} hover>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <PersonIcon color="primary" />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                        {enrollment.studentName || "Unknown Student"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {enrollment.studentId.slice(-8)}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CourseIcon sx={{ mr: 1, color: "secondary.main" }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                        {enrollment.courseTitle || "Unknown Course"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {enrollment.courseDescription || "No description"}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={enrollment.isCompleted ? "COMPLETED" : "IN_PROGRESS"}
                    size="small"
                    color={getStatusColor(!!enrollment.isCompleted) as any}
                    variant="outlined"
                    icon={getStatusIcon(!!enrollment.isCompleted)}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Typography variant="body2" fontWeight="medium">
                      {`${Math.round(enrollment.progress ?? 0)}%`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {enrollment.completedLessonsCount}/
                      {enrollment.totalLessonsCount} lessons
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {dayjs(enrollment.enrollmentDate).format("DD/MM/YYYY")}
                </TableCell>
                <TableCell>
                  {enrollment.lastAccessedAt
                    ? dayjs(enrollment.lastAccessedAt).format("DD/MM/YYYY")
                    : "Never"}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    title="View Details"
                    onClick={() => handleViewDetails(enrollment)}
                    color="primary"
                  >
                    <ViewIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Empty State */}
        {!enrollments.isLoading && enrollments.data?.items?.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <EnrollmentIcon
              sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Enrollments Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {committedSearch || statusFilter
                ? "Try adjusting your search or filter criteria"
                : "No student enrollments exist yet"}
            </Typography>
          </Box>
        )}

        {/* Pagination */}
        {enrollments.data?.totalPages ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
            }}
          >
            <FormControl size="small">
              <InputLabel>Page Size</InputLabel>
              <Select
                label="Page Size"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPageNumber(1);
                }}
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
              count={enrollments.data.totalPages}
              page={pageNumber}
              onChange={(_, v) => setPageNumber(v)}
              shape="rounded"
              color="primary"
            />
          </Box>
        ) : null}
      </Paper>

      {/* Details Dialog */}
      <EnrollmentDetailsDialog
        open={detailsDialog.open}
        enrollment={detailsDialog.enrollment || null}
        onClose={() => setDetailsDialog({ open: false })}
      />
    </Box>
  );
}
