import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Edit as EditIcon,
  FileDownload as FileDownloadIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "store/config";
import { useLocales } from "hooks";
import {
  getActivationCodesThunk,
  deleteActivationCodeThunk,
  updateActivationCodeStatusThunk,
  exportActivationCodesCsvThunk,
} from "store/activationCode/activationCodeThunks";
import { clearSuccessFlags } from "store/activationCode/activationCodeSlice";
import { ActivationCodeResult, CodeStatus } from "common/@types/activationCode";
import CreateBatchDialog from "./CreateBatchDialog";
import UpdateStatusDialog from "./UpdateStatusDialog";
import ExportCsvDialog from "./ExportCsvDialog";

export default function ActivationCodeListSection() {
  const dispatch = useAppDispatch();
  const { translate } = useLocales();
  const { activationCodes, operations } = useAppSelector(
    (state) => state.activationCode
  );

  // Pagination & Dialog states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [exportCsvDialogOpen, setExportCsvDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string | null;
    code: string;
  }>({
    open: false,
    id: null,
    code: "",
  });
  const [updateStatusDialog, setUpdateStatusDialog] = useState<{
    open: boolean;
    id: string | null;
    code: string;
    currentStatus: CodeStatus;
  }>({
    open: false,
    id: null,
    code: "",
    currentStatus: CodeStatus.Active,
  });

  const items = activationCodes.data?.items || [];
  const total = activationCodes.data?.total || 0;
  const isLoading = activationCodes.isLoading;
  const error = activationCodes.error;

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage]);

  const fetchData = () => {
    dispatch(
      getActivationCodesThunk({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
      })
    );
  };

  // Handle success flags
  useEffect(() => {
    if (operations.createSuccess) {
      dispatch(clearSuccessFlags());
      fetchData();
    }
  }, [operations.createSuccess]);

  useEffect(() => {
    if (operations.deleteSuccess) {
      setDeleteDialog({ open: false, id: null, code: "" });
      dispatch(clearSuccessFlags());
      fetchData();
    }
  }, [operations.deleteSuccess]);

  useEffect(() => {
    if (operations.updateSuccess) {
      setUpdateStatusDialog({
        open: false,
        id: null,
        code: "",
        currentStatus: CodeStatus.Active,
      });
      dispatch(clearSuccessFlags());
    }
  }, [operations.updateSuccess]);

  useEffect(() => {
    if (operations.exportSuccess) {
      setExportCsvDialogOpen(false);
      dispatch(clearSuccessFlags());
    }
  }, [operations.exportSuccess]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // You can add a snackbar notification here
  };

  const handleDeleteClick = (id: string, code: string) => {
    setDeleteDialog({ open: true, id, code });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.id) {
      dispatch(deleteActivationCodeThunk(deleteDialog.id));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, id: null, code: "" });
  };

  const handleUpdateStatusClick = (
    id: string,
    code: string,
    status: CodeStatus
  ) => {
    setUpdateStatusDialog({ open: true, id, code, currentStatus: status });
  };

  const handleUpdateStatusConfirm = (newStatus: CodeStatus) => {
    if (updateStatusDialog.id) {
      dispatch(
        updateActivationCodeStatusThunk({
          id: updateStatusDialog.id,
          status: newStatus,
        })
      );
    }
  };

  const handleUpdateStatusCancel = () => {
    setUpdateStatusDialog({
      open: false,
      id: null,
      code: "",
      currentStatus: CodeStatus.Active,
    });
  };

  const handleCreateSuccess = () => {
    fetchData();
  };

  const handleExportCsv = (batchId: string) => {
    dispatch(exportActivationCodesCsvThunk(batchId));
  };

  const getStatusColor = (
    status: CodeStatus
  ): "default" | "success" | "error" | "warning" => {
    switch (status) {
      case CodeStatus.Active:
        return "success"; // Xanh lá - Chưa dùng
      case CodeStatus.Used:
        return "default"; // Xám - Đã dùng
      case CodeStatus.Expired:
        return "error"; // Đỏ - Hết hạn
      case CodeStatus.Revoked:
        return "error"; // Đỏ - Thu hồi
      case CodeStatus.Suspended:
        return "warning"; // Vàng - Tạm ngưng
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: CodeStatus): string => {
    switch (status) {
      case CodeStatus.Active:
        return translate("admin.codeStatusUnused");
      case CodeStatus.Used:
        return translate("admin.codeStatusUsed");
      case CodeStatus.Expired:
        return translate("admin.codeStatusExpired");
      case CodeStatus.Revoked:
        return translate("admin.codeStatusRevoked");
      case CodeStatus.Suspended:
        return translate("admin.codeStatusSuspended");
      default:
        return translate("admin.codeStatusUnknown");
    }
  };

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={() => setExportCsvDialogOpen(true)}
          >
            {translate("admin.exportCSV")}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            {translate("admin.createBatchCode")}
          </Button>
        </Box>
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {operations.deleteError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {operations.deleteError}
        </Alert>
      )}

      {operations.createSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {translate("admin.activationCodeCreatedSuccess")}
        </Alert>
      )}

      {operations.exportSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {translate("admin.exportCsvSuccess")}
        </Alert>
      )}

      {/* Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{translate("admin.activationCodeColumn")}</TableCell>
                <TableCell>{translate("admin.batchId")}</TableCell>
                <TableCell>{translate("admin.robotName")}</TableCell>
                <TableCell align="center">
                  {translate("admin.status")}
                </TableCell>
                <TableCell>{translate("admin.createdAt")}</TableCell>
                <TableCell>{translate("admin.expiresAt")}</TableCell>
                <TableCell>{translate("admin.studentFullname")}</TableCell>
                <TableCell align="right">
                  {translate("admin.actions")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Typography variant="body2" color="text.secondary">
                      {translate("admin.noActivationCodes")}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item: ActivationCodeResult) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="body2"
                          fontFamily="monospace"
                          fontWeight={500}
                        >
                          {item.code}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleCopyCode(item.code)}
                          title={translate("admin.copyCode")}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontFamily="monospace"
                        sx={{
                          px: 1,
                          py: 0.5,
                          bgcolor: "action.hover",
                          borderRadius: 1,
                          fontSize: "0.75rem",
                          display: "inline-block",
                        }}
                      >
                        {item.batchId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {item.robotName || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getStatusLabel(item.status)}
                        color={getStatusColor(item.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {item.expiresAt ? (
                        <Typography variant="body2">
                          {new Date(item.expiresAt).toLocaleDateString("vi-VN")}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          {translate("admin.noLimit")}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {item.studentFullname || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.5,
                          justifyContent: "flex-end",
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleUpdateStatusClick(
                              item.id,
                              item.code,
                              item.status
                            )
                          }
                          title={translate("admin.updateStatus")}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(item.id, item.code)}
                          disabled={
                            operations.isDeleting ||
                            item.status === CodeStatus.Used
                          }
                          title={
                            item.status === CodeStatus.Used
                              ? translate("admin.cannotDeleteUsedCode")
                              : translate("admin.delete")
                          }
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
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
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          labelRowsPerPage={translate("admin.rowsPerPage")}
          labelDisplayedRows={({ from, to, count }) =>
            translate("admin.displayedRows", {
              from,
              to,
              count: count !== -1 ? count : to,
            })
          }
        />
      </Card>

      {/* Create Batch Dialog */}
      <CreateBatchDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Update Status Dialog */}
      <UpdateStatusDialog
        open={updateStatusDialog.open}
        onClose={handleUpdateStatusCancel}
        onConfirm={handleUpdateStatusConfirm}
        currentStatus={updateStatusDialog.currentStatus}
        code={updateStatusDialog.code}
        isLoading={operations.isUpdating}
        error={operations.updateError}
      />

      {/* Export CSV Dialog */}
      <ExportCsvDialog
        open={exportCsvDialogOpen}
        onClose={() => setExportCsvDialogOpen(false)}
        onExport={handleExportCsv}
        isLoading={operations.isExporting}
        error={operations.exportError}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
        <DialogTitle>{translate("admin.confirmDeleteCode")}</DialogTitle>
        <DialogContent>
          <DialogContentText
            dangerouslySetInnerHTML={{
              __html: translate("admin.confirmDeleteCodeMessage", {
                code: deleteDialog.code,
              }),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={operations.isDeleting}>
            {translate("admin.cancel")}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={operations.isDeleting}
            startIcon={operations.isDeleting && <CircularProgress size={16} />}
          >
            {translate("admin.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
