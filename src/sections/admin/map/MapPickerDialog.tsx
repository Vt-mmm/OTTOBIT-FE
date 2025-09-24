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
}

export default function MapPickerDialog({
  open,
  onClose,
  onSelect,
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
        const res = await axiosClient.get("/api/v1/maps", {
          params: {
            SearchTerm: committed || undefined,
            IncludeDeleted: false,
            PageNumber: page,
            PageSize: pageSize,
          },
        });
        const data = (res as any)?.data?.data || (res as any)?.data || {};
        const list = Array.isArray(data.items) ? data.items : [];
        const tp =
          typeof data.totalPages === "number"
            ? data.totalPages
            : typeof data.total === "number" &&
              typeof data.pageSize === "number"
            ? Math.max(1, Math.ceil(data.total / data.pageSize))
            : list.length < pageSize && page === 1
            ? 1
            : 1;
        if (!cancelled) setItems(list);
        if (!cancelled) setTotalPages(tp);
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
  }, [open, committed, page, pageSize]);

  const triggerSearch = () => {
    setCommitted(search.trim());
    setPage(1);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Select a Map</DialogTitle>
      <DialogContent dividers>
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
              <Typography variant="body2">No maps found</Typography>
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
