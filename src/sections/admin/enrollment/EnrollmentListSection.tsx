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
  Avatar,
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
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SchoolOutlined as EnrollmentIcon,
  Person as PersonIcon,
  Book as CourseIcon,
  CheckCircle as CompletedIcon,
  Schedule as InProgressIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getEnrollments } from "../../../redux/enrollment/enrollmentSlice";
import { EnrollmentStatus } from "common/@types/enrollment";
import dayjs from "dayjs";

interface EnrollmentListSectionProps {
  onCreateNew?: () => void;
  onEditEnrollment?: (enrollment: any) => void;
  onViewDetails?: (enrollment: any) => void;
}

export default function EnrollmentListSection({
  onCreateNew,
  onEditEnrollment,
  onViewDetails,
}: EnrollmentListSectionProps) {
  const dispatch = useAppDispatch();
  const { enrollments } = useAppSelector((state) => state.enrollment);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | "">("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    const isCompleted =
      statusFilter === EnrollmentStatus.COMPLETED
        ? true
        : statusFilter === EnrollmentStatus.IN_PROGRESS
        ? false
        : undefined;

    dispatch(getEnrollments({
      searchTerm: committedSearch || undefined,
      isCompleted,
      pageNumber,
      pageSize,
    }));
  }, [dispatch, committedSearch, statusFilter, pageNumber, pageSize]);

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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          📚 Enrollments Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateNew}
          disabled
        >
          Add Enrollment
        </Button>
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
                <MenuItem value={EnrollmentStatus.IN_PROGRESS}>In Progress</MenuItem>
                <MenuItem value={EnrollmentStatus.COMPLETED}>Completed</MenuItem>
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
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                      <PersonIcon />
                    </Avatar>
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
                  <Typography variant="body2">
                    {`${Math.round(enrollment.progress ?? 0)}%`}
                  </Typography>
                </TableCell>
                <TableCell>
                  {dayjs(enrollment.enrollmentDate).format('DD/MM/YYYY')}
                </TableCell>
                <TableCell>
                  {enrollment.lastAccessedAt 
                    ? dayjs(enrollment.lastAccessedAt).format('DD/MM/YYYY') 
                    : 'Never'
                  }
                </TableCell>
                <TableCell align="right">
                  <IconButton 
                    size="small" 
                    title="View Details"
                    onClick={() => onViewDetails?.(enrollment)}
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    title="Edit Enrollment"
                    onClick={() => onEditEnrollment?.(enrollment)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error" title="Cancel Enrollment">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Empty State */}
        {!enrollments.isLoading && enrollments.data?.items?.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <EnrollmentIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
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
    </Box>
  );
}
