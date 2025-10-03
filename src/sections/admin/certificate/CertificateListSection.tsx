import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Block as RevokeIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { AppDispatch } from "store/config";
import {
  getCertificatesThunk,
  deleteCertificateThunk,
} from "store/certificate/certificateThunks";
import type { CertificateResult } from "common/@types/certificate";
import {
  CertificateStatus,
  CERTIFICATE_STATUS_LABELS,
  CERTIFICATE_STATUS_COLORS,
} from "common/enums/certificate.enum";
import { toast } from "react-toastify";
import CertificateDetailDialog from "./CertificateDetailDialog";
import RevokeCertificateDialog from "./RevokeCertificateDialog";

export default function CertificateListSection() {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const { certificates } = useSelector((state: any) => state.certificate);

  // Local state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openRevokeDialog, setOpenRevokeDialog] = useState(false);
  const [selectedCertificate, setSelectedCertificate] =
    useState<CertificateResult | null>(null);

  // Load data
  useEffect(() => {
    loadCertificates();
  }, [page, rowsPerPage, searchTerm, statusFilter]);

  const loadCertificates = () => {
    const params: any = {
      page: page + 1,
      size: rowsPerPage,
    };

    if (searchTerm.trim()) params.searchTerm = searchTerm.trim();
    if (statusFilter !== "all") params.status = parseInt(statusFilter);

    dispatch(getCertificatesThunk(params));
  };

  // Handlers
  const handleOpenDetail = (certificate: CertificateResult) => {
    setSelectedCertificate(certificate);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedCertificate(null);
  };

  const handleOpenRevoke = (certificate: CertificateResult) => {
    setSelectedCertificate(certificate);
    setOpenRevokeDialog(true);
  };

  const handleCloseRevokeDialog = (success?: boolean) => {
    setOpenRevokeDialog(false);
    setSelectedCertificate(null);
    if (success) {
      loadCertificates();
    }
  };

  const handleDelete = async (id: string, certificateNo: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa chứng chỉ "${certificateNo}"?`))
      return;

    try {
      await dispatch(deleteCertificateThunk(id)).unwrap();
      toast.success("Đã xóa chứng chỉ thành công!");
      loadCertificates();
    } catch (error: any) {
      toast.error(error || "Có lỗi xảy ra khi xóa chứng chỉ!");
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const certificatesData = certificates.data?.items || [];
  const total = certificates.data?.total || 0;

  return (
    <Box>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            🎓 Quản lý chứng chỉ (Certificates)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Danh sách chứng chỉ đã cấp cho học viên
          </Typography>
        </Box>
      </Stack>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FilterIcon color="action" />
          <TextField
            size="small"
            placeholder="Tìm kiếm theo tên học viên, mã chứng chỉ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Trạng thái"
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value={CertificateStatus.DRAFT.toString()}>
                {CERTIFICATE_STATUS_LABELS[CertificateStatus.DRAFT]}
              </MenuItem>
              <MenuItem value={CertificateStatus.ISSUED.toString()}>
                {CERTIFICATE_STATUS_LABELS[CertificateStatus.ISSUED]}
              </MenuItem>
              <MenuItem value={CertificateStatus.REVOKED.toString()}>
                {CERTIFICATE_STATUS_LABELS[CertificateStatus.REVOKED]}
              </MenuItem>
              <MenuItem value={CertificateStatus.EXPIRED.toString()}>
                {CERTIFICATE_STATUS_LABELS[CertificateStatus.EXPIRED]}
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Card>

      {/* Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: "1px solid", borderColor: "divider" }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell sx={{ fontWeight: 600 }}>Mã chứng chỉ</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Học viên</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Khóa học</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, width: 120 }}>
                Trạng thái
              </TableCell>
              <TableCell sx={{ fontWeight: 600, width: 150 }}>
                Ngày cấp
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, width: 160 }}>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {certificates.isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <CircularProgress size={32} />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                  >
                    Đang tải...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : certificatesData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary">
                    Chưa có chứng chỉ nào được cấp.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              certificatesData.map((cert: CertificateResult) => (
                <TableRow
                  key={cert.id}
                  sx={{ "&:hover": { bgcolor: "action.hover" } }}
                >
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, fontFamily: "monospace" }}
                    >
                      {cert.certificateNo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {cert.studentFullname}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {cert.courseTitle}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={CERTIFICATE_STATUS_LABELS[cert.status]}
                      size="small"
                      color={CERTIFICATE_STATUS_COLORS[cert.status] as any}
                      sx={{ fontWeight: 500, minWidth: 90 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(cert.issuedAt).toLocaleDateString("vi-VN")}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="flex-end"
                    >
                      <Tooltip title="Xem chi tiết" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDetail(cert)}
                          sx={{
                            color: "info.main",
                            "&:hover": { bgcolor: "info.lighter" },
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {cert.status === CertificateStatus.ISSUED && (
                        <Tooltip title="Thu hồi" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenRevoke(cert)}
                            sx={{
                              color: "warning.main",
                              "&:hover": { bgcolor: "warning.lighter" },
                            }}
                          >
                            <RevokeIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Xóa" arrow>
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleDelete(cert.id, cert.certificateNo)
                          }
                          sx={{
                            color: "error.main",
                            "&:hover": { bgcolor: "error.lighter" },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} của ${count !== -1 ? count : `nhiều hơn ${to}`}`
          }
        />
      </TableContainer>

      {/* Detail Dialog */}
      {selectedCertificate && (
        <CertificateDetailDialog
          open={openDetailDialog}
          onClose={handleCloseDetailDialog}
          certificate={selectedCertificate}
        />
      )}

      {/* Revoke Dialog */}
      {selectedCertificate && (
        <RevokeCertificateDialog
          open={openRevokeDialog}
          onClose={handleCloseRevokeDialog}
          certificate={selectedCertificate}
        />
      )}
    </Box>
  );
}
