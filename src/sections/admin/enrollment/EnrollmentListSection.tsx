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
  Cancel as CancelledIcon,
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
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | "">("");

  useEffect(() => {
    dispatch(getEnrollments({
      searchTerm: searchTerm || undefined,
      status: statusFilter || undefined,
      pageNumber: 1,
      pageSize: 50,
    }));
  }, [dispatch, searchTerm, statusFilter]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
  };

  const getStatusIcon = (status: EnrollmentStatus) => {
    switch (status) {
      case EnrollmentStatus.COMPLETED:
        return <CompletedIcon fontSize="small" />;
      case EnrollmentStatus.IN_PROGRESS:
        return <InProgressIcon fontSize="small" />;
      case EnrollmentStatus.CANCELLED:
        return <CancelledIcon fontSize="small" />;
      default:
        return <InProgressIcon fontSize="small" />;
    }
  };

  const getStatusColor = (status: EnrollmentStatus) => {
    switch (status) {
      case EnrollmentStatus.COMPLETED:
        return "success";
      case EnrollmentStatus.IN_PROGRESS:
        return "primary";
      case EnrollmentStatus.CANCELLED:
        return "error";
      default:
        return "default";
    }
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
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
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
                <MenuItem value={EnrollmentStatus.CANCELLED}>Cancelled</MenuItem>
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
                    label={enrollment.status}
                    size="small"
                    color={getStatusColor(enrollment.status) as any}
                    variant="outlined"
                    icon={getStatusIcon(enrollment.status)}
                  />
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {enrollment.completedLessonsCount || 0} / {enrollment.totalLessonsCount || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {enrollment.totalLessonsCount > 0 
                      ? `${Math.round((enrollment.completedLessonsCount / enrollment.totalLessonsCount) * 100)}%`
                      : '0%'
                    }
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
              {searchTerm || statusFilter
                ? "Try adjusting your search or filter criteria"
                : "No student enrollments exist yet"}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}