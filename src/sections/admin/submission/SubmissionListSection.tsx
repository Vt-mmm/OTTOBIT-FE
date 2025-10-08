import { useEffect, useState } from "react";
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Rating,
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

export default function SubmissionListSection() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { adminSubmissions } = useAppSelector((state) => state.submission);

  // Pagination & Filter states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [starFrom, setStarFrom] = useState<number | "">("");
  const [starTo, setStarTo] = useState<number | "">("");

  const items = adminSubmissions.data?.items || [];
  const total = adminSubmissions.data?.total || 0;
  const isLoading = adminSubmissions.isLoading;
  const error = adminSubmissions.error;

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, searchTerm, starFrom, starTo]);

  const fetchData = () => {
    dispatch(
      getSubmissionsForAdminThunk({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        searchTerm: searchTerm || undefined,
        starFrom: starFrom !== "" ? starFrom : undefined,
        starTo: starTo !== "" ? starTo : undefined,
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

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setPage(0);
  };

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
          <Typography variant="h4">Quản lý Bài nộp</Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            disabled={isLoading}
          >
            Làm mới
          </Button>
        </Stack>

        {/* Filters */}
        <Card sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Tìm kiếm (Sinh viên, Challenge)"
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
                Tìm kiếm
              </Button>
            </Stack>

            <Stack direction="row" spacing={2}>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Sao từ</InputLabel>
                <Select
                  value={starFrom}
                  label="Sao từ"
                  onChange={(e) =>
                    setStarFrom(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value={0}>0 ⭐</MenuItem>
                  <MenuItem value={1}>1 ⭐</MenuItem>
                  <MenuItem value={2}>2 ⭐</MenuItem>
                  <MenuItem value={3}>3 ⭐</MenuItem>
                  <MenuItem value={4}>4 ⭐</MenuItem>
                  <MenuItem value={5}>5 ⭐</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Sao đến</InputLabel>
                <Select
                  value={starTo}
                  label="Sao đến"
                  onChange={(e) =>
                    setStarTo(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value={0}>0 ⭐</MenuItem>
                  <MenuItem value={1}>1 ⭐</MenuItem>
                  <MenuItem value={2}>2 ⭐</MenuItem>
                  <MenuItem value={3}>3 ⭐</MenuItem>
                  <MenuItem value={4}>4 ⭐</MenuItem>
                  <MenuItem value={5}>5 ⭐</MenuItem>
                </Select>
              </FormControl>
            </Stack>
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
                  <TableCell>STT</TableCell>
                  <TableCell>Sinh viên</TableCell>
                  <TableCell>Challenge</TableCell>
                  <TableCell>Lesson</TableCell>
                  <TableCell>Đánh giá</TableCell>
                  <TableCell>Ngày nộp</TableCell>
                  <TableCell align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                      <CircularProgress />
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Đang tải dữ liệu...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                      <Typography variant="body2" color="text.secondary">
                        Không có bài nộp nào
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
                            readOnly
                            size="small"
                          />
                          <Typography variant="body2" color="text.secondary">
                            ({submission.star}/5)
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
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} trên tổng ${count}`
            }
          />
        </Card>
      </Stack>
    </Box>
  );
}
