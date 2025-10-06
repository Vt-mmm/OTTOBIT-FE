import { useEffect, useState } from "react";
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
  Edit as EditIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "store/config";
import { getStudents, updateStudent } from "store/student/studentSlice";
import { StudentResult } from "common/@types/student";
import dayjs from "dayjs";
import StudentFormDialog from "./StudentFormDialog";
import StudentDetailsDialog from "./StudentDetailsDialog";

interface StudentListSectionProps {}

export default function StudentListSection({}: StudentListSectionProps) {
  const dispatch = useAppDispatch();
  const { students, operations } = useAppSelector((state) => state.student);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Dialog states
  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    student?: StudentResult;
  }>({ open: false, mode: "create" });

  const [detailsDialog, setDetailsDialog] = useState<{
    open: boolean;
    student?: StudentResult;
  }>({ open: false }); // Fetch students on mount and when filters change
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
  }, [
    dispatch,
    committedSearch,
    phoneNumber,
    state,
    city,
    pageNumber,
    pageSize,
  ]);

  // Handlers
  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const triggerSearch = () => {
    setCommittedSearch(searchTerm.trim());
    setPageNumber(1);
  };

  const handleEditStudent = (student: StudentResult) => {
    setFormDialog({ open: true, mode: "edit", student });
  };

  const handleViewDetails = (student: StudentResult) => {
    setDetailsDialog({ open: true, student });
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (formDialog.mode === "edit" && formDialog.student) {
        await dispatch(
          updateStudent({ id: formDialog.student.id, ...data })
        ).unwrap();
        setFormDialog({ open: false, mode: "create" });
      }
      // Create is disabled for admin (users create their own profile)
    } catch (error) {
      // Error is handled in Redux
    }
  };

  const handleEditFromDetails = () => {
    if (detailsDialog.student) {
      setDetailsDialog({ open: false });
      handleEditStudent(detailsDialog.student);
    }
  };

  // Loading state
  if (students.isLoading && !students.data) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Search & Filters */}
      <Card sx={{ mb: { xs: 2, sm: 3 } }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "2fr 1fr 1fr 1fr",
              },
              gap: { xs: 1.5, sm: 2 },
            }}
          >
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
          <Box
            sx={{
              mt: { xs: 1.5, sm: 2 },
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="contained"
              onClick={triggerSearch}
              startIcon={<SearchIcon />}
              sx={{
                minHeight: { xs: 44, sm: 36 },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Tìm kiếm
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Error Display */}
      {students.error && (
        <Alert severity="error" sx={{ mb: { xs: 2, sm: 3 } }}>
          {students.error}
        </Alert>
      )}

      {/* Students Table */}
      <Paper sx={{ overflow: "hidden" }}>
        <Box sx={{ overflowX: "auto" }}>
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
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "medium" }}
                        >
                          {student.fullname}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {student.id.slice(-8)}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{student.phoneNumber || "-"}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {[student.city, student.state]
                        .filter(Boolean)
                        .join(", ") || "-"}
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
                      onClick={() => handleViewDetails(student)}
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      title="Edit Student"
                      onClick={() => handleEditStudent(student)}
                      color="secondary"
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        {/* Empty State */}
        {!students.isLoading && students.data?.items?.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: { xs: 6, sm: 8 },
              px: { xs: 2, sm: 3 },
            }}
          >
            <PersonIcon
              sx={{
                fontSize: { xs: 48, sm: 64 },
                color: "text.secondary",
                mb: 2,
              }}
            />
            <Typography
              variant="h6"
              color="text.secondary"
              gutterBottom
              sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
            >
              No Students Found
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
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
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: "center",
              gap: { xs: 2, sm: 0 },
              p: { xs: 1.5, sm: 2 },
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
              size="small"
              siblingCount={0}
            />
          </Box>
        ) : null}
      </Paper>

      {/* Form Dialog */}
      <StudentFormDialog
        open={formDialog.open}
        mode={formDialog.mode}
        initialData={formDialog.student}
        onClose={() => setFormDialog({ open: false, mode: "create" })}
        onSubmit={handleFormSubmit}
        isLoading={operations.isUpdating}
        error={operations.updateError}
      />

      {/* Details Dialog */}
      <StudentDetailsDialog
        open={detailsDialog.open}
        student={detailsDialog.student || null}
        onClose={() => setDetailsDialog({ open: false })}
        onEdit={handleEditFromDetails}
      />
    </Box>
  );
}
