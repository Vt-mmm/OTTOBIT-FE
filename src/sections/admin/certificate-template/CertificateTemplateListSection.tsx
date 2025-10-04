import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
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
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { AppDispatch } from "store/config";
import {
  getCertificateTemplatesThunk,
  deleteCertificateTemplateThunk,
} from "store/certificateTemplate/certificateTemplateThunks";
import { clearSuccessFlags } from "store/certificateTemplate/certificateTemplateSlice";
import type { CertificateTemplateResult } from "common/@types/certificateTemplate";
import { toast } from "react-toastify";
import CertificateTemplateFormDialog from "./CertificateTemplateFormDialog";
import CertificateTemplatePreviewDialog from "./CertificateTemplatePreviewDialog";

interface CertificateTemplateListSectionProps {
  onViewModeChange?: (
    mode: string,
    template?: CertificateTemplateResult
  ) => void;
}

export default function CertificateTemplateListSection({
  onViewModeChange: _onViewModeChange,
}: CertificateTemplateListSectionProps) {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const { templates, operations } = useSelector(
    (state: any) => state.certificateTemplate
  );

  // Local state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseIdFilter] = useState(""); // Removed unused setter
  const [isActiveFilter, setIsActiveFilter] = useState<string>("all");
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<CertificateTemplateResult | null>(null);
  const [previewTemplate, setPreviewTemplate] =
    useState<CertificateTemplateResult | null>(null);

  // Load data
  useEffect(() => {
    loadTemplates();
  }, [page, rowsPerPage, searchTerm, courseIdFilter, isActiveFilter]);

  const loadTemplates = () => {
    const params: any = {
      page: page + 1,
      size: rowsPerPage,
    };

    if (searchTerm.trim()) params.searchTerm = searchTerm.trim();
    if (courseIdFilter) params.courseId = courseIdFilter;
    if (isActiveFilter !== "all") params.isActive = isActiveFilter === "active";

    dispatch(getCertificateTemplatesThunk(params));
  };

  // Handle success
  useEffect(() => {
    if (operations.createSuccess || operations.updateSuccess) {
      loadTemplates();
      dispatch(clearSuccessFlags());
      setOpenFormDialog(false);
      setEditingTemplate(null);
    }
  }, [operations.createSuccess, operations.updateSuccess]);

  // Handlers
  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setOpenFormDialog(true);
  };

  const handleOpenEdit = (template: CertificateTemplateResult) => {
    setEditingTemplate(template);
    setOpenFormDialog(true);
  };

  const handleCloseFormDialog = () => {
    setOpenFormDialog(false);
    setEditingTemplate(null);
  };

  const handleOpenPreview = (template: CertificateTemplateResult) => {
    setPreviewTemplate(template);
    setOpenPreviewDialog(true);
  };

  const handleClosePreviewDialog = () => {
    setOpenPreviewDialog(false);
    setPreviewTemplate(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa template "${name}"?`)) return;

    try {
      await dispatch(deleteCertificateTemplateThunk(id)).unwrap();
      toast.success("Đã xóa template thành công!");
      loadTemplates();
    } catch (error: any) {
      toast.error(error || "Có lỗi xảy ra khi xóa template!");
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

  const templatesData = templates.data?.items || [];
  const total = templates.data?.total || 0;

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
            📜 Mẫu chứng chỉ (Certificate Templates)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý mẫu chứng chỉ cho các khóa học
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          size="large"
        >
          Tạo mẫu mới
        </Button>
      </Stack>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FilterIcon color="action" />
          <TextField
            size="small"
            placeholder="Tìm kiếm theo tên template..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={isActiveFilter}
              onChange={(e) => setIsActiveFilter(e.target.value)}
              label="Trạng thái"
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="active">Đang hoạt động</MenuItem>
              <MenuItem value="inactive">Không hoạt động</MenuItem>
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
              <TableCell sx={{ fontWeight: 600 }}>Tên mẫu</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Khóa học</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, width: 120 }}>
                Trạng thái
              </TableCell>
              <TableCell sx={{ fontWeight: 600, width: 180 }}>
                Ngày tạo
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, width: 180 }}>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
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
            ) : templatesData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary">
                    Chưa có mẫu chứng chỉ nào. Nhấn "Tạo mẫu mới" để bắt đầu.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              templatesData.map((template: CertificateTemplateResult) => (
                <TableRow
                  key={template.id}
                  sx={{ "&:hover": { bgcolor: "action.hover" } }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {template.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {template.courseTitle}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={template.isActive ? "Hoạt động" : "Tạm dừng"}
                      size="small"
                      color={template.isActive ? "success" : "default"}
                      sx={{ fontWeight: 500, minWidth: 90 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(template.createdAt).toLocaleDateString("vi-VN")}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="flex-end"
                    >
                      <Tooltip title="Xem trước" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenPreview(template)}
                          sx={{
                            color: "info.main",
                            "&:hover": { bgcolor: "info.lighter" },
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(template)}
                          sx={{
                            color: "primary.main",
                            "&:hover": { bgcolor: "primary.lighter" },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa" arrow>
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleDelete(template.id, template.name)
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

      {/* Form Dialog */}
      <CertificateTemplateFormDialog
        open={openFormDialog}
        onClose={handleCloseFormDialog}
        template={editingTemplate}
      />

      {/* Preview Dialog */}
      {previewTemplate && (
        <CertificateTemplatePreviewDialog
          open={openPreviewDialog}
          onClose={handleClosePreviewDialog}
          template={previewTemplate}
        />
      )}
    </Box>
  );
}
