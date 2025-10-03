import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Box,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
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
  const [search, setSearch] = useState("");
  const [committed, setCommitted] = useState("");
  const [items, setItems] = useState<MapSummary[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

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
            title: cm.mapTitle || "Unknown Map",
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
  }, [open, committed, page, pageSize, courseId]);

  const triggerSearch = () => {
    setCommitted(search.trim());
    setPage(1);
  };

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
        {courseId ? "Select a Map from Course" : "Select a Map"}
      </DialogTitle>
      <DialogContent dividers>
        {!courseId && (
          <TextField
            fullWidth
            placeholder="Search maps..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && triggerSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        )}
        <List
          dense
          sx={{
            maxHeight: 420,
            overflow: "auto",
            border: "1px solid #eee",
            borderRadius: 1,
          }}
        >
          {loading && (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2">Loading...</Typography>
            </Box>
          )}
          {!loading && items.length === 0 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2">
                {courseId
                  ? "No maps found"
                  : "Vui lòng chọn khóa học trước khi chọn map"}
              </Typography>
            </Box>
          )}
          {items.map((m) => (
            <ListItemButton key={m.id} onClick={() => onSelect(m)}>
              <ListItemText
                primary={m.title}
                secondary={
                  m.description && m.description.length > 0
                    ? m.description
                    : "(No description)"
                }
              />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
      <DialogActions sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
          >
            Prev
          </Button>
          <Typography variant="body2" sx={{ mx: 1 }}>
            Page {page} / {totalPages}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
          >
            Next
          </Button>
        </Box>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
