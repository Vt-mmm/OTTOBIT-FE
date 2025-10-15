import { useEffect, useMemo, useState } from "react";
import {
  Drawer,
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
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { ROUTES_API_TAG } from "constants/routesApiKeys";

export type UserBlogFilters = {
  dateFrom?: string;
  dateTo?: string;
  readingTimeMin?: number;
  readingTimeMax?: number;
  viewCountMin?: number;
  viewCountMax?: number;
  sortBy?: "CreatedAt" | "ViewCount";
  sortDirection?: "Asc" | "Desc";
};

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: UserBlogFilters;
  onApply: (values: UserBlogFilters) => void;
  selectedTags: { id: string; name: string }[];
  onChangeTags: (tags: { id: string; name: string }[]) => void;
}

export default function UserBlogFilterDialog({
  open,
  onClose,
  initial,
  onApply,
  selectedTags,
  onChangeTags,
}: Props) {
  const [values, setValues] = useState<UserBlogFilters>({
    sortBy: "CreatedAt",
    sortDirection: "Desc",
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
      // reset tag search/page when open
      setTagSearch("");
      setTagPage(1);
    }
  }, [open, initial]);

  const handleChange = (key: keyof UserBlogFilters, val: any) => {
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
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100%", sm: 450 },
          maxWidth: "100vw",
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            p: 3,
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Bộ lọc nâng cao
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
          <Stack spacing={4}>
            {/* Date Range */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Khoảng thời gian
              </Typography>
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
              </Grid>
            </Box>

            <Divider />

            {/* Reading Time */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Thời gian đọc
              </Typography>
              <Grid container spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    fullWidth
                    label="Thời gian đọc tối thiểu"
                    type="number"
                    placeholder="Ví dụ: 1"
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
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value)
                      )
                    }
                  />
                  <TextField
                    fullWidth
                    label="Thời gian đọc tối đa"
                    type="number"
                    placeholder="Ví dụ: 10"
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
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value)
                      )
                    }
                  />
                </Stack>
              </Grid>
            </Box>

            <Divider />

            {/* View Count */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Lượt xem
              </Typography>
              <Grid container spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    fullWidth
                    label="Lượt xem tối thiểu"
                    type="number"
                    placeholder="Ví dụ: 100"
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
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value)
                      )
                    }
                  />
                  <TextField
                    fullWidth
                    label="Lượt xem tối đa"
                    type="number"
                    placeholder="Ví dụ: 1000"
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
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value)
                      )
                    }
                  />
                </Stack>
              </Grid>
            </Box>

            <Divider />

            {/* Sort */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Sắp xếp
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Sắp xếp theo"
                    value={values.sortBy || "CreatedAt"}
                    onChange={(e) =>
                      handleChange(
                        "sortBy",
                        e.target.value as UserBlogFilters["sortBy"]
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
                        e.target.value as UserBlogFilters["sortDirection"]
                      )
                    }
                  >
                    <MenuItem value="Asc">Tăng dần</MenuItem>
                    <MenuItem value="Desc">Giảm dần</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Tags */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Tags
              </Typography>
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
            </Box>
          </Stack>

          {/* Footer */}
          <Box
            sx={{
              p: 3,
              borderTop: "1px solid #e0e0e0",
              display: "flex",
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              fullWidth
              onClick={onClose}
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={() => onApply(values)}
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                bgcolor: "#1976d2",
                "&:hover": {
                  bgcolor: "#1565c0",
                },
              }}
            >
              Áp dụng
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
