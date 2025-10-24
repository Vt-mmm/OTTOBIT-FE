import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Pagination,
  Stack,
  CircularProgress,
} from "@mui/material";
import { axiosClient } from "axiosClient";

interface MapSummary {
  id: string;
  title: string;
  description?: string;
  mapJson?: string;
  createdAt?: string;
}

interface MapPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (map: MapSummary) => void;
  courseId?: string; // Filter maps by course
}

export default function MapPickerDialog({
  open,
  onClose,
  onSelect,
  courseId,
}: MapPickerDialogProps) {
  const [items, setItems] = useState<MapSummary[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const fetchMaps = async () => {
      try {
        setLoading(true);
        let res;

        if (courseId) {
          // Fetch course-maps for specific course
          res = await axiosClient.get("/api/v1/course-maps", {
            params: {
              CourseId: courseId,
              PageNumber: page,
              PageSize: pageSize,
            },
          });
          const data = (res as any)?.data?.data || (res as any)?.data || {};
          const courseMaps = Array.isArray(data.items) ? data.items : [];

          // Transform course-maps to MapSummary format
          const list = courseMaps.map((cm: any) => ({
            id: cm.mapId,
            title: cm.mapTitle || "Bản đồ không xác định",
            description: cm.mapDescription || "",
            mapJson: cm.mapJson,
            createdAt: cm.createdAt,
          }));

          const tp = Math.max(
            1,
            Math.ceil((data.total || list.length) / pageSize)
          );
          if (!cancelled) setItems(list);
          if (!cancelled) setTotalPages(tp);
        } else {
          // No courseId - show empty list with message
          if (!cancelled) setItems([]);
          if (!cancelled) setTotalPages(1);
        }
      } catch (e) {
        if (!cancelled) setItems([]);
        if (!cancelled) setTotalPages(1);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchMaps();
    return () => {
      cancelled = true;
    };
  }, [open, page, pageSize, courseId]);

  useEffect(() => {
    try {
      window.dispatchEvent(
        new CustomEvent("map-picker-open", { detail: !!open })
      );
    } catch {}
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      disableScrollLock
      keepMounted
      disableEnforceFocus
      disableAutoFocus
    >
      <DialogTitle>
        {courseId ? "Chọn bản đồ từ khóa học" : "Chọn bản đồ"}
      </DialogTitle>
      <DialogContent sx={{ pt: 2, pb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Chọn một bản đồ từ danh sách bên dưới
        </Typography>

        <Box
          sx={{
            maxHeight: 400,
            overflowY: "auto",
            border: "1px solid #e0e0e0",
            borderRadius: 1,
            p: 1,
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : items.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                {courseId
                  ? "Không tìm thấy bản đồ nào"
                  : "Vui lòng chọn khóa học trước khi chọn bản đồ"}
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1}>
              {items.map((m) => (
                <Box
                  key={m.id}
                  onClick={() => setSelectedMapId(m.id)}
                  sx={{
                    p: 2,
                    border:
                      selectedMapId === m.id
                        ? "2px solid #1976d2"
                        : "2px solid transparent",
                    borderRadius: 1,
                    bgcolor: selectedMapId === m.id ? "#f3f8ff" : "white",
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      bgcolor: selectedMapId === m.id ? "#f3f8ff" : "#f5f5f5",
                      borderColor:
                        selectedMapId === m.id ? "#1976d2" : "#e0e0e0",
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1,
                        bgcolor: "#e3f2fd",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Typography variant="h6" color="primary.main">
                        M
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={600} noWrap>
                        {m.title || "Untitled Map"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {m.description || "Không có mô tả"}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        ID: {m.id}
                      </Typography>
                    </Box>
                    {selectedMapId === m.id && (
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          bgcolor: "#1976d2",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="white"
                          sx={{ fontSize: "14px" }}
                        >
                          ✓
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Box>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
              size="small"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button
          onClick={() => {
            onClose();
            setSelectedMapId("");
          }}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          disabled={!selectedMapId}
          onClick={() => {
            const selectedItem = items.find(
              (item) => item.id === selectedMapId
            );
            if (selectedItem) {
              onSelect(selectedItem);
              onClose();
              setSelectedMapId("");
            }
          }}
        >
          Chọn
        </Button>
      </DialogActions>
    </Dialog>
  );
}
