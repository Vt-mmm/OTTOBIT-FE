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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
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
  const [committedSearch, setCommittedSearch] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    dispatch(
      getStudents({
        searchTerm: committedSearch || undefined,
        phoneNumber: phoneNumber || undefined,
        state: state || undefined,
        city: city || undefined,
        pageNumber,
        pageSize,
      })
    );
  }, [dispatch, committedSearch, phoneNumber, state, city, pageNumber, pageSize]);

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const triggerSearch = () => {
    setCommittedSearch(searchTerm.trim());
    setPageNumber(1);
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

      {/* Search & Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr' }, gap: 2 }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
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
              }}
            />
            <TextField
              fullWidth
              placeholder="Số điện thoại"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") triggerSearch();
              }}
            />
            <TextField
              fullWidth
              placeholder="Tỉnh/Thành phố"
              value={state}
              onChange={(e) => setState(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") triggerSearch();
              }}
            />
            <TextField
              fullWidth
              placeholder="Quận/Huyện"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") triggerSearch();
              }}
            />
          </Box>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" onClick={triggerSearch} startIcon={<SearchIcon />}>
              Tìm kiếm
            </Button>
          </Box>
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
              <TableCell>Phone</TableCell>
              <TableCell>Location</TableCell>
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
                <TableCell>{student.phoneNumber || '-'}</TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {[student.city, student.state].filter(Boolean).join(', ') || '-'}
                  </Typography>
                </TableCell>
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
              {committedSearch
                ? "Try adjusting your search criteria"
                : "No students have joined yet"}
            </Typography>
          </Box>
        )}

        {/* Pagination */}
        {students.data?.totalPages ? (
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
              count={students.data.totalPages}
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
