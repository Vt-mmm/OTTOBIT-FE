import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  Memory as ComponentIcon,
} from "@mui/icons-material";
import { AppDispatch } from "store/config";
import {
  getRobotComponentsForAdminThunk,
  createRobotComponentThunk,
  updateRobotComponentThunk,
  deleteRobotComponentThunk,
  restoreRobotComponentThunk,
} from "store/robotComponent/robotComponentThunks";
import { getComponentsThunk } from "store/component/componentThunks";
import type { RobotComponentFormData } from "common/@types/robotComponent";
import { toast } from "react-toastify";

interface RobotComponentsTabProps {
  robotId: string;
  robotName: string;
}

/**
 * Tab quản lý components cho một robot cụ thể
 * Hiển thị trong Robot Details Section
 */
export default function RobotComponentsTab({
  robotId,
  robotName,
}: RobotComponentsTabProps) {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const { robotComponents, isLoading } = useSelector(
    (state: any) => state.robotComponent
  );
  const { components } = useSelector((state: any) => state.component);

  // Local state
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [formData, setFormData] = useState<RobotComponentFormData>({
    robotId: robotId,
    componentId: "",
    quantity: 1,
  });

  // Load data
  useEffect(() => {
    dispatch(getComponentsThunk({ page: 1, size: 100 }));
    loadRobotComponents();
  }, []);

  const loadRobotComponents = () => {
    dispatch(
      getRobotComponentsForAdminThunk({
        robotId,
        includeDeleted,
        pageSize: 100,
      })
    );
  };

  useEffect(() => {
    loadRobotComponents();
  }, [includeDeleted]);

  // Dialog handlers
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ robotId, componentId: "", quantity: 1 });
    setOpenDialog(true);
  };

  const handleOpenEdit = (rc: any) => {
    setEditingId(rc.id);
    setFormData({
      robotId: rc.robotId,
      componentId: rc.componentId,
      quantity: rc.quantity,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({ robotId, componentId: "", quantity: 1 });
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await dispatch(
          updateRobotComponentThunk({ id: editingId, ...formData })
        ).unwrap();
        toast.success("Cập nhật thành công!");
      } else {
        await dispatch(createRobotComponentThunk(formData)).unwrap();
        toast.success("Thêm component thành công!");
      }
      handleCloseDialog();
      loadRobotComponents();
    } catch (error: any) {
      toast.error(error || "Có lỗi xảy ra!");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa component này?")) return;
    try {
      await dispatch(deleteRobotComponentThunk(id)).unwrap();
      toast.success("Xóa thành công!");
      loadRobotComponents();
    } catch (error: any) {
      toast.error(error || "Có lỗi xảy ra!");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await dispatch(restoreRobotComponentThunk(id)).unwrap();
      toast.success("Khôi phục thành công!");
      loadRobotComponents();
    } catch (error: any) {
      toast.error(error || "Có lỗi xảy ra!");
    }
  };

  // robotComponents is already an array from Redux state
  const componentsData = Array.isArray(robotComponents) ? robotComponents : [];

  return (
    <Box>
      {/* Header - Compact */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 0.5 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              📦 Bill of Materials (BOM)
            </Typography>
            <Chip
              label={robotName}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Danh sách linh kiện cần thiết để lắp ráp robot
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={includeDeleted ? "all" : "active"}
              onChange={(e) => setIncludeDeleted(e.target.value === "all")}
              label="Trạng thái"
            >
              <MenuItem value="active">Đang hoạt động</MenuItem>
              <MenuItem value="all">Tất cả</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{ whiteSpace: "nowrap" }}
          >
            Thêm Component
          </Button>
        </Stack>
      </Stack>

      {/* Table - Modern Design */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: "1px solid", borderColor: "divider" }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell sx={{ fontWeight: 600 }}>Component</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, width: 120 }}>
                Số lượng
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, width: 140 }}>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
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
            ) : componentsData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                  <ComponentIcon
                    sx={{ fontSize: 48, color: "text.disabled", mb: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Chưa có component nào. Nhấn "Thêm Component" để bắt đầu.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              componentsData.map((rc: any) => (
                <TableRow
                  key={rc.id}
                  sx={{
                    "&:hover": { bgcolor: "action.hover" },
                    opacity: rc.isDeleted ? 0.6 : 1,
                    bgcolor: rc.isDeleted
                      ? "action.disabledBackground"
                      : "inherit",
                  }}
                >
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <ComponentIcon color="primary" sx={{ fontSize: 20 }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {rc.componentName}
                        </Typography>
                        {rc.isDeleted && (
                          <Chip
                            label="Đã xóa"
                            size="small"
                            color="error"
                            sx={{ height: 20, fontSize: "0.7rem", mt: 0.5 }}
                          />
                        )}
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${rc.quantity} cái`}
                      size="small"
                      color="info"
                      variant="outlined"
                      sx={{ fontWeight: 500, minWidth: 70 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="flex-end"
                    >
                      {!rc.isDeleted ? (
                        <>
                          <Tooltip title="Chỉnh sửa" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEdit(rc)}
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
                              onClick={() => handleDelete(rc.id)}
                              sx={{
                                color: "error.main",
                                "&:hover": { bgcolor: "error.lighter" },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <Tooltip title="Khôi phục" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleRestore(rc.id)}
                            sx={{
                              color: "success.main",
                              "&:hover": { bgcolor: "success.lighter" },
                            }}
                          >
                            <RestoreIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingId ? "Chỉnh sửa Component" : "Thêm Component mới"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Component *</InputLabel>
              <Select
                value={formData.componentId}
                onChange={(e) =>
                  setFormData({ ...formData, componentId: e.target.value })
                }
                label="Component *"
                disabled={!!editingId}
              >
                {components?.data?.items?.map((component: any) => (
                  <MenuItem key={component.id} value={component.id}>
                    {component.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="number"
              label="Số lượng *"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantity: parseInt(e.target.value) || 1,
                })
              }
              inputProps={{ min: 1 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.componentId}
          >
            {editingId ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
