import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  MenuItem,
  Button,
  Grid,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Pagination,
  Chip,
  Typography,
  Box,
  InputAdornment,
} from "@mui/material";
import axios from "axios";
import { ROUTES_API_TAG } from "constants/routesApiKeys";

export type AdminBlogFilters = {
  dateFrom?: string;
  dateTo?: string;
  readingTimeMin?: number;
  readingTimeMax?: number;
  viewCountMin?: number;
  viewCountMax?: number;
  sortBy?: "CreatedAt" | "ViewCount";
  sortDirection?: "Asc" | "Desc";
  status?: "all" | "active";
};

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: AdminBlogFilters;
  onApply: (values: AdminBlogFilters) => void;
  selectedTags: { id: string; name: string }[];
  onChangeTags: (tags: { id: string; name: string }[]) => void;
}

export default function AdminBlogFilterDialog({
  open,
  onClose,
  initial,
  onApply,
  selectedTags,
  onChangeTags,
}: Props) {
  const [values, setValues] = useState<AdminBlogFilters>({
    sortBy: "CreatedAt",
    sortDirection: "Desc",
    status: "all",
  });

  // Inline tag picker state
  const [tagSearch, setTagSearch] = useState("");
  const [tagPage, setTagPage] = useState(1);
  const [tagPageSize] = useState(12);
  const [tagItems, setTagItems] = useState<{ id: string; name: string }[]>([]);
  const [tagTotalPages, setTagTotalPages] = useState(1);
  const [loadingTags, setLoadingTags] = useState(false);

  useEffect(() => {
    if (open) {
      setValues({ sortBy: "CreatedAt", sortDirection: "Desc", ...initial });
      setTagSearch("");
      setTagPage(1);
    }
  }, [open, initial]);

  const handleChange = (key: keyof AdminBlogFilters, val: any) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const chosenMap = useMemo(() => {
    const m: Record<string, boolean> = {};
    selectedTags.forEach((t) => {
      m[t.id] = true;
    });
    return m;
  }, [selectedTags]);

  const toggleTag = (t: { id: string; name: string }) => {
    if (chosenMap[t.id]) {
      onChangeTags(selectedTags.filter((x) => x.id !== t.id));
    } else {
      onChangeTags([...selectedTags, t]);
    }
  };

  const fetchTags = async () => {
    setLoadingTags(true);
    try {
      const params = new URLSearchParams({
        SearchTerm: tagSearch,
        PageNumber: String(tagPage),
        PageSize: String(tagPageSize),
      });
      const url = `${ROUTES_API_TAG.GET_ALL}?${params.toString()}`;
      const { data } = await axios.get(url);
      setTagItems(data?.data?.items || []);
      setTagTotalPages(data?.data?.totalPages || 1);
    } finally {
      setLoadingTags(false);
    }
  };

  useEffect(() => {
    if (open) fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tagPage]);

  const handleSearchTags = () => {
    setTagPage(1);
    fetchTags();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Bộ lọc nâng cao</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Từ ngày"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={values.dateFrom || ""}
                onChange={(e) => handleChange("dateFrom", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Đến ngày"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={values.dateTo || ""}
                onChange={(e) => handleChange("dateTo", e.target.value)}
              />
            </Grid>
            {/* Reading time min/max grouped */}
            <Grid item xs={12}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="Reading time tối thiểu"
                  type="number"
                  placeholder="VD: 1"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">phút</InputAdornment>
                    ),
                  }}
                  inputProps={{ min: 0 }}
                  value={values.readingTimeMin ?? ""}
                  onChange={(e) =>
                    handleChange(
                      "readingTimeMin",
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                />
                <TextField
                  fullWidth
                  label="Reading time tối đa"
                  type="number"
                  placeholder="VD: 10"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">phút</InputAdornment>
                    ),
                  }}
                  inputProps={{ min: 0 }}
                  value={values.readingTimeMax ?? ""}
                  onChange={(e) =>
                    handleChange(
                      "readingTimeMax",
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                />
              </Stack>
            </Grid>
            {/* View count min/max grouped */}
            <Grid item xs={12}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="Lượt xem tối thiểu"
                  type="number"
                  placeholder="VD: 100"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">lượt</InputAdornment>
                    ),
                  }}
                  inputProps={{ min: 0 }}
                  value={values.viewCountMin ?? ""}
                  onChange={(e) =>
                    handleChange(
                      "viewCountMin",
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                />
                <TextField
                  fullWidth
                  label="Lượt xem tối đa"
                  type="number"
                  placeholder="VD: 1000"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">lượt</InputAdornment>
                    ),
                  }}
                  inputProps={{ min: 0 }}
                  value={values.viewCountMax ?? ""}
                  onChange={(e) =>
                    handleChange(
                      "viewCountMax",
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                />
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Sắp xếp theo"
                value={values.sortBy || "CreatedAt"}
                onChange={(e) =>
                  handleChange(
                    "sortBy",
                    e.target.value as AdminBlogFilters["sortBy"]
                  )
                }
              >
                <MenuItem value="CreatedAt">Ngày tạo</MenuItem>
                <MenuItem value="ViewCount">Lượt xem</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Thứ tự"
                value={values.sortDirection || "Desc"}
                onChange={(e) =>
                  handleChange(
                    "sortDirection",
                    e.target.value as AdminBlogFilters["sortDirection"]
                  )
                }
              >
                <MenuItem value="Asc">Tăng dần</MenuItem>
                <MenuItem value="Desc">Giảm dần</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Trạng thái"
                value={values.status || "all"}
                onChange={(e) => handleChange("status", e.target.value as any)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="active">Đang hoạt động</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {/* Inline Tags section (below) */}
          <Stack spacing={1}>
            <Typography fontWeight={700}>Tags</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {selectedTags.map((t) => (
                <Chip
                  key={t.id}
                  label={t.name}
                  onDelete={() =>
                    onChangeTags(selectedTags.filter((x) => x.id !== t.id))
                  }
                />
              ))}
              {selectedTags.length === 0 && (
                <Chip label="Chưa chọn tag" variant="outlined" />
              )}
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems="center"
            >
              <TextField
                size="small"
                fullWidth
                placeholder="Tìm tag..."
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearchTags();
                }}
              />
              <Button
                variant="outlined"
                onClick={handleSearchTags}
                disabled={loadingTags}
              >
                Tìm
              </Button>
            </Stack>
            <Box sx={{ border: "1px solid #eee", borderRadius: 1 }}>
              <List dense disablePadding>
                {tagItems.map((t) => (
                  <ListItem
                    key={t.id}
                    onClick={() => toggleTag(t)}
                    sx={{ cursor: "pointer" }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={!!chosenMap[t.id]}
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>
                    <ListItemText primary={t.name} />
                  </ListItem>
                ))}
              </List>
              <Stack direction="row" justifyContent="center" sx={{ py: 1 }}>
                <Pagination
                  count={tagTotalPages}
                  page={tagPage}
                  onChange={(_, v) => setTagPage(v)}
                  size="small"
                />
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={() => onApply(values)}>
          Áp dụng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
