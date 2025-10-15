import { useEffect, useState, useCallback } from "react";
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
import useLocales from "hooks/useLocales";

interface StudentListSectionProps {}

export default function StudentListSection({}: StudentListSectionProps) {
  const dispatch = useAppDispatch();
  const { translate } = useLocales();
  const { students, operations } = useAppSelector((state) => state.student);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [committedPhoneNumber, setCommittedPhoneNumber] = useState("");
  const [state, setState] = useState("");
  const [committedState, setCommittedState] = useState("");
  const [city, setCity] = useState("");
  const [committedCity, setCommittedCity] = useState("");
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
  }>({ open: false });

  // Debouncing for auto-search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCommittedSearch(searchTerm.trim());
      if (searchTerm.trim() !== committedSearch) {
        setPageNumber(1);
      }
    }, 800); // 800ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCommittedPhoneNumber(phoneNumber.trim());
      if (phoneNumber.trim() !== committedPhoneNumber) {
        setPageNumber(1);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [phoneNumber]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCommittedState(state.trim());
      if (state.trim() !== committedState) {
        setPageNumber(1);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [state]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCommittedCity(city.trim());
      if (city.trim() !== committedCity) {
        setPageNumber(1);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [city]);

  // Fetch students on mount and when filters change
  useEffect(() => {
    const params = {
      searchTerm: committedSearch || undefined,
      phoneNumber: committedPhoneNumber || undefined,
      state: committedState || undefined,
      city: committedCity || undefined,
      pageNumber,
      pageSize,
    };
    
    // Call API with search parameters
    dispatch(getStudents(params));
  }, [
    dispatch,
    committedSearch,
    committedPhoneNumber,
    committedState,
    committedCity,
    pageNumber,
    pageSize,
  ]);

  // Handlers
  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const triggerSearch = useCallback(() => {
    setCommittedSearch(searchTerm.trim());
    setCommittedPhoneNumber(phoneNumber.trim());
    setCommittedState(state.trim());
    setCommittedCity(city.trim());
    setPageNumber(1);
  }, [searchTerm, phoneNumber, state, city]);


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
              multiline
              maxRows={1} // Keep single line appearance but allow unlimited length
              placeholder={translate("admin.searchStudentPlaceholder")}
              value={searchTerm}
              onChange={handleSearchInput}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  triggerSearch();
                }
              }}
              helperText={" "} // Fixed height to prevent layout shift
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: {
                  '& textarea': {
                    resize: 'none', // Prevent manual resizing
                    overflow: 'auto', // Allow scrolling within input
                  }
                }
              }}
            />
            <TextField
              fullWidth
              placeholder={translate("admin.phoneNumber")}
              value={phoneNumber}
              onChange={(e) => {
                // Chỉ cho phép số và ký tự đặc biệt cho phone
                const value = e.target.value.replace(/[^0-9+\-\s\(\)]/g, '');
                setPhoneNumber(value);
              }}
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
              error={!!(phoneNumber && phoneNumber.length > 0 && phoneNumber.length < 9)}
            />
            <TextField
              fullWidth
              placeholder={translate("admin.stateProvince")}
              value={state}
              onChange={(e) => {
                // Chỉ cho phép chữ cái, khoảng trắng và dấu
                const value = e.target.value.replace(/[^a-zA-Z\s\u00C0-\u017F\u1EA0-\u1EF9]/g, '');
                setState(value);
              }}
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
            />
            <TextField
              fullWidth
              placeholder={translate("admin.cityDistrict")}
              value={city}
              onChange={(e) => {
                // Chỉ cho phép chữ cái, khoảng trắng và dấu
                const value = e.target.value.replace(/[^a-zA-Z\s\u00C0-\u017F\u1EA0-\u1EF9]/g, '');
                setCity(value);
              }}
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
            />
          </Box>
          <Box
            sx={{
              mt: { xs: 1.5, sm: 2 },
              display: "flex",
              gap: 2,
              justifyContent: "flex-end",
              flexDirection: { xs: "column", sm: "row" },
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
              {translate("admin.search")}
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
                <TableCell>{translate("admin.student")}</TableCell>
                <TableCell>{translate("admin.phone")}</TableCell>
                <TableCell>{translate("admin.location")}</TableCell>
                <TableCell align="center">{translate("admin.age")}</TableCell>
                <TableCell align="center">{translate("admin.enrollments")}</TableCell>
                <TableCell align="center">{translate("admin.submissions")}</TableCell>
                <TableCell>{translate("admin.joined")}</TableCell>
                <TableCell align="right">{translate("admin.actions")}</TableCell>
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
                      title={translate("admin.viewStudent")}
                      onClick={() => handleViewDetails(student)}
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      title={translate("admin.editStudent")}
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
              {translate("admin.noStudentsFound")}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              {(committedSearch || committedPhoneNumber || committedState || committedCity)
                ? translate("admin.tryAdjustingSearch")
                : translate("admin.noStudentsYet")}
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
