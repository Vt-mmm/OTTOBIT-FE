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
import useLocales from "hooks/useLocales";

interface EnrollmentListSectionProps {}

export default function EnrollmentListSection({}: EnrollmentListSectionProps) {
  const dispatch = useAppDispatch();
  const { translate } = useLocales();
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

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              fullWidth
              placeholder={translate("admin.searchEnrollmentPlaceholder")}
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
              <InputLabel>{translate("admin.status")}</InputLabel>
              <Select
                value={statusFilter}
                label={translate("admin.status")}
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="">{translate("admin.all")}</MenuItem>
                <MenuItem value="in_progress">
                  {translate("admin.inProgress")}
                </MenuItem>
                <MenuItem value="completed">
                  {translate("admin.completed")}
                </MenuItem>
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
              <TableCell>{translate("admin.student")}</TableCell>
              <TableCell>{translate("admin.course")}</TableCell>
              <TableCell align="center">{translate("admin.status")}</TableCell>
              <TableCell align="center">
                {translate("admin.progress")}
              </TableCell>
              <TableCell>{translate("admin.enrolled")}</TableCell>
              <TableCell>{translate("admin.lastActivity")}</TableCell>
              <TableCell align="right">{translate("admin.actions")}</TableCell>
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
                        {enrollment.studentName ||
                          translate("admin.unknownStudent")}
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
                        {enrollment.courseTitle ||
                          translate("admin.unknownCourse")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {enrollment.courseDescription ||
                          translate("admin.noDescription")}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={
                      enrollment.isCompleted
                        ? translate("admin.completed").toUpperCase()
                        : translate("admin.inProgress").toUpperCase()
                    }
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
                      {enrollment.totalLessonsCount}{" "}
                      {translate("admin.lessons")}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {dayjs(enrollment.enrollmentDate).format("DD/MM/YYYY")}
                </TableCell>
                <TableCell>
                  {enrollment.lastAccessedAt
                    ? dayjs(enrollment.lastAccessedAt).format("DD/MM/YYYY")
                    : translate("admin.never")}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    title={translate("admin.viewDetail")}
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
              {translate("admin.noEnrollmentsFound")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {committedSearch || statusFilter
                ? translate("admin.tryAdjustingFilters")
                : translate("admin.noEnrollmentsYet")}
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
              <InputLabel>{translate("admin.pageSize")}</InputLabel>
              <Select
                label={translate("admin.pageSize")}
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
