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
  Person as PersonIcon,
  School as SchoolIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "store/config";
import { getStudents } from "store/student/studentSlice";
import { StudentResult } from "common/@types/student";
import dayjs from "dayjs";
import StudentDetailsDialog from "./StudentDetailsDialog";
import useLocales from "hooks/useLocales";

interface StudentListSectionProps {}

export default function StudentListSection({}: StudentListSectionProps) {
  const dispatch = useAppDispatch();
  const { translate } = useLocales();
  const { students } = useAppSelector((state) => state.student);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(12);


  const [detailsDialog, setDetailsDialog] = useState<{
    open: boolean;
    student?: StudentResult;
  }>({ open: false });


  // Fetch students on mount and when pagination changes (without search filters)
  useEffect(() => {
    const params = {
      pageNumber,
      pageSize,
    };
    
    // Call API only on initial load and pagination changes (no search filters)
    dispatch(getStudents(params));
  }, [
    dispatch,
    pageNumber,
    pageSize,
  ]);

  // Handlers
  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const triggerSearch = useCallback(() => {
    const params = {
      searchTerm: searchTerm.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      state: state.trim() || undefined,
      city: city.trim() || undefined,
      pageNumber: 1,
      pageSize,
    };
    
    setPageNumber(1);
    dispatch(getStudents(params));
  }, [dispatch, searchTerm, phoneNumber, state, city, pageSize]);



  const handleViewDetails = (student: StudentResult) => {
    setDetailsDialog({ open: true, student });
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
              {(searchTerm.trim() || phoneNumber.trim() || state.trim() || city.trim())
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


      {/* Details Dialog */}
      <StudentDetailsDialog
        open={detailsDialog.open}
        student={detailsDialog.student || null}
        onClose={() => setDetailsDialog({ open: false })}
      />
    </Box>
  );
}
