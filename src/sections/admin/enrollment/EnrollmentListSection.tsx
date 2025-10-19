import { useEffect, useState, useCallback } from "react";
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

// Helper function to safely handle numbers
function safeNumber(value: any, fallback: number = 0): number {
  return typeof value === 'number' && !isNaN(value) ? value : fallback;
}

interface EnrollmentListSectionProps {}

export default function EnrollmentListSection({}: EnrollmentListSectionProps) {
  const dispatch = useAppDispatch();
  const { translate } = useLocales();
  const { enrollments } = useAppSelector((state) => state.enrollment);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "" | "completed" | "in_progress"
  >("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Dialog state
  const [detailsDialog, setDetailsDialog] = useState<{
    open: boolean;
    enrollment?: EnrollmentResult;
  }>({ open: false });


  // Fetch enrollments on mount and filter/pagination changes (no search)
  useEffect(() => {
    const isCompleted =
      statusFilter === "completed"
        ? true
        : statusFilter === "in_progress"
        ? false
        : undefined;

    const params = {
      isCompleted,
      pageNumber,
      pageSize,
    };

    // Call Enrollment API without search term
    dispatch(getEnrollments(params));
  }, [dispatch, statusFilter, pageNumber, pageSize]);

  // Handlers
  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const triggerSearch = useCallback(() => {
    const isCompleted =
      statusFilter === "completed"
        ? true
        : statusFilter === "in_progress"
        ? false
        : undefined;

    const params = {
      searchTerm: searchTerm.trim() || undefined,
      isCompleted,
      pageNumber: 1,
      pageSize,
    };

    setPageNumber(1);
    dispatch(getEnrollments(params));
  }, [dispatch, searchTerm, statusFilter, pageSize]);


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
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ 
            display: "flex", 
            gap: { xs: 1, sm: 2 }, 
            alignItems: "flex-end", // Align to bottom to prevent shifting
            flexDirection: { xs: "column", md: "row" }
          }}>
            <TextField
              fullWidth
              placeholder={translate("admin.searchEnrollmentPlaceholder")}
              value={searchTerm}
              onChange={handleSearchInput}
              onKeyDown={(e) => {
                if (e.key === "Enter") triggerSearch();
              }}
              inputProps={{
                style: {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                }
              }}
              helperText={" "} // Fixed height to prevent layout shift
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
                sx: {
                  '& input': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }
                }
              }}
            />
            <Box sx={{ minHeight: 78 }}> {/* Match TextField with helperText height */}
              <FormControl sx={{ minWidth: { xs: "100%", md: 200 } }}>
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
        <Box sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: { xs: 800, md: "auto" } }}>
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
                <TableCell sx={{ minWidth: 150 }}>
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
                <TableCell sx={{ minWidth: 180 }}>
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
                <TableCell align="center" sx={{ minWidth: 120 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Typography variant="body2" fontWeight="medium">
                      {`${Math.round(safeNumber(enrollment.progress, 0))}%`}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {dayjs(enrollment.enrollmentDate).format("DD/MM/YYYY")}
                </TableCell>
                <TableCell>
                  {enrollment.updatedAt
                    ? dayjs(enrollment.updatedAt).format("DD/MM/YYYY")
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
        </Box>

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
              {searchTerm.trim() || statusFilter
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
              alignItems: { xs: "stretch", sm: "center" },
              p: { xs: 1, sm: 2 },
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
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
            <Box sx={{ display: "flex", justifyContent: { xs: "center", sm: "flex-end" } }}>
              <Pagination
                count={enrollments.data.totalPages}
                page={pageNumber}
                onChange={(_, v) => setPageNumber(v)}
                shape="rounded"
                color="primary"
              />
            </Box>
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
