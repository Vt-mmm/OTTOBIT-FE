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
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getStudents } from "../../../redux/student/studentSlice";
import dayjs from "dayjs";

interface StudentListSectionProps {
  onCreateNew?: () => void;
  onEditStudent?: (student: any) => void;
  onViewDetails?: (student: any) => void;
}

export default function StudentListSection({
  onCreateNew,
  onEditStudent,
  onViewDetails,
}: StudentListSectionProps) {
  const dispatch = useAppDispatch();
  const { students } = useAppSelector((state) => state.student);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(
      getStudents({
        searchTerm: searchTerm || undefined,
        pageNumber: 1,
        pageSize: 50,
      })
    );
  }, [dispatch, searchTerm]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  if (students.isLoading && !students.data) {
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
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          👥 Students Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateNew}
          disabled
        >
          Add Student
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search students by name or email..."
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
        </CardContent>
      </Card>

      {/* Error Display */}
      {students.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {students.error}
        </Alert>
      )}

      {/* Students Table */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="center">Age</TableCell>
              <TableCell align="center">Enrollments</TableCell>
              <TableCell align="center">Submissions</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.data?.items?.map((student) => (
              <TableRow key={student.id} hover>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                      {student.fullname?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                        {student.fullname}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {student.id.slice(-8)}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell align="center">
                  {student.dateOfBirth
                    ? dayjs().diff(dayjs(student.dateOfBirth), "year")
                    : "-"}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={student.enrollmentsCount || 0}
                    size="small"
                    color="primary"
                    variant="outlined"
                    icon={<SchoolIcon />}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={student.submissionsCount || 0}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {dayjs(student.createdAt).format("DD/MM/YYYY")}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    title="View Student"
                    onClick={() => onViewDetails?.(student)}
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    title="Edit Student"
                    onClick={() => onEditStudent?.(student)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error" title="Delete Student">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Empty State */}
        {!students.isLoading && students.data?.items?.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <PersonIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Students Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm
                ? "Try adjusting your search criteria"
                : "No students have joined yet"}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
