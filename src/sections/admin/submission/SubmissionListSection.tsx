import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Alert,
  TextField,
  Rating,
  Slider,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "store/config";
import { getSubmissionsForAdminThunk } from "store/submission/submissionThunks";
import { SubmissionResult } from "common/@types/submission";
import { useNavigate } from "react-router-dom";
import { PATH_ADMIN } from "routes/paths";
import useLocales from "hooks/useLocales";

export default function SubmissionListSection() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { translate } = useLocales();
  const { adminSubmissions } = useAppSelector((state) => state.submission);

  // Pagination & Filter states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [starRange, setStarRange] = useState<number[]>([0, 3]);
  
  // Applied filters - only update when user clicks Search
  const [appliedSearchTerm, setAppliedSearchTerm] = useState<string>("");
  const [appliedStarRange, setAppliedStarRange] = useState<number[]>([0, 3]);

  const items = adminSubmissions.data?.items || [];
  const total = adminSubmissions.data?.total || 0;
  const isLoading = adminSubmissions.isLoading;
  const error = adminSubmissions.error;

  // Fetch data on mount and when pagination or applied filters change
  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, appliedSearchTerm, appliedStarRange]);

  const fetchData = () => {
    dispatch(
      getSubmissionsForAdminThunk({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        searchTerm: appliedSearchTerm || undefined,
        starFrom: appliedStarRange[0],
        starTo: appliedStarRange[1],
      })
    );
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = useCallback(() => {
    // Apply current filter values
    setAppliedSearchTerm(searchInput.trim());
    setAppliedStarRange(starRange);
    setPage(0); // Reset to first page when searching
  }, [searchInput, starRange]);

  const handleViewDetails = (submissionId: string) => {
    navigate(PATH_ADMIN.submissionDetail.replace(":id", submissionId));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h4">{translate("admin.submissionManagement")}</Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchData()}
            disabled={isLoading}
          >
            {translate("admin.refresh")}
          </Button>
        </Stack>

        {/* Filters */}
        <Card sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label={translate("admin.searchSubmissionPlaceholder")}
                variant="outlined"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                sx={{ minWidth: 120 }}
              >
                {translate("admin.search")}
              </Button>
            </Stack>

            <Box sx={{ width: '100%', maxWidth: 450, mx: 'auto', py: 1.5 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, px: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {translate("admin.starRangeFilter")}
                </Typography>
                <Typography variant="body2" fontWeight={600} color="primary.main">
                  {starRange[0]} ⭐ - {starRange[1]} ⭐
                </Typography>
              </Stack>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={starRange}
                  onChange={(_, newValue) => setStarRange(newValue as number[])}
                  valueLabelDisplay="auto"
                  min={0}
                  max={3}
                  step={1}
                  marks={[
                    { value: 0, label: '0⭐' },
                    { value: 1, label: '1⭐' },
                    { value: 2, label: '2⭐' },
                    { value: 3, label: '3⭐' },
                  ]}
                  sx={{
                    '& .MuiSlider-thumb': {
                      width: 20,
                      height: 20,
                    },
                    '& .MuiSlider-markLabel': {
                      fontSize: 12,
                      top: 28,
                    },
                  }}
                />
              </Box>
            </Box>
          </Stack>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => {}}>
            {error}
          </Alert>
        )}

        {/* Data Table */}
        <Card>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{translate("admin.no")}</TableCell>
                  <TableCell>{translate("admin.student")}</TableCell>
                  <TableCell>Challenge</TableCell>
                  <TableCell>Lesson</TableCell>
                  <TableCell>{translate("admin.rating")}</TableCell>
                  <TableCell>{translate("admin.submittedDate")}</TableCell>
                  <TableCell align="center">{translate("admin.actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                      <CircularProgress />
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        {translate("admin.loading")}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                      <Typography variant="body2" color="text.secondary">
                        {translate("admin.noSubmissions")}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((submission: SubmissionResult, index: number) => (
                    <TableRow
                      key={submission.id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleViewDetails(submission.id)}
                    >
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {submission.studentName || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {submission.challengeTitle || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {submission.lessonTitle || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Rating
                            value={submission.star}
                            max={3}
                            readOnly
                            size="small"
                          />
                          <Typography variant="body2" color="text.secondary">
                            ({submission.star}/3)
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(submission.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(submission.id);
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage={translate("admin.rowsPerPage")}
            labelDisplayedRows={({ from, to, count }) =>
              translate("admin.displayedRows", { from, to, count })
            }
          />
        </Card>
      </Stack>
    </Box>
  );
}
