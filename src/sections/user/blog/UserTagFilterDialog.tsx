import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  Checkbox,
  ListItemText,
  Stack,
  Pagination,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { ROUTES_API_TAG } from "constants/routesApiKeys";
import axios from "axios";

type TagItem = { id: string; name: string };

interface Props {
  open: boolean;
  onClose: () => void;
  selected: TagItem[];
  onConfirm: (tags: TagItem[]) => void;
}

// const PAGE_SIZES = [8, 12, 16];

export default function UserTagFilterDialog({
  open,
  onClose,
  selected,
  onConfirm,
}: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [items, setItems] = useState<TagItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [chosen, setChosen] = useState<Record<string, TagItem>>({});

  useEffect(() => {
    const map: Record<string, TagItem> = {};
    selected.forEach((t) => (map[t.id] = t));
    setChosen(map);
  }, [selected, open]);

  const fetchTags = async () => {
    // setLoading(true);
    try {
      const params = new URLSearchParams({
        SearchTerm: search,
        PageNumber: String(page),
        PageSize: String(pageSize),
      });
      const url = `${ROUTES_API_TAG.GET_ALL}?${params.toString()}`;
      const { data } = await axios.get(url);
      setItems(data?.data?.items || []);
      setTotalPages(data?.data?.totalPages || 1);
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, page]);

  const toggle = (t: TagItem) => {
    setChosen((prev) => {
      const next = { ...prev } as Record<string, TagItem>;
      if (next[t.id]) {
        delete next[t.id];
      } else {
        next[t.id] = t;
      }
      return next;
    });
  };

  const selectedList = useMemo(() => Object.values(chosen), [chosen]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        Chọn tag
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setPage(1);
              fetchTags();
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    setPage(1);
                    fetchTags();
                  }}
                >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <List dense disablePadding>
          {items.map((t) => (
            <ListItem
              key={t.id}
              onClick={() => toggle(t)}
              sx={{ cursor: "pointer" }}
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={!!chosen[t.id]}
                  tabIndex={-1}
                  disableRipple
                />
              </ListItemIcon>
              <ListItemText primary={t.name} />
            </ListItem>
          ))}
        </List>

        <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => setPage(v)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={() => onConfirm(selectedList)}>
          Áp dụng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
