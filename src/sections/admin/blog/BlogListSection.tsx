import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Chip,
  Grid,
  IconButton,
  InputLabel,
  InputAdornment,
  MenuItem,
  Pagination,
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
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import RestoreIcon from "@mui/icons-material/Restore";
import AddIcon from "@mui/icons-material/Add";
import BlogDetailDialog from "./BlogDetailDialog";
import ConfirmDialog from "./ConfirmDialog";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_BLOG } from "constants/routesApiKeys";
import { BlogItem, BlogListResponse, BlogTag } from "types/blog";
import { useNotification } from "hooks/useNotification";
import AdminBlogFilterDialog, {
  AdminBlogFilters,
} from "./AdminBlogFilterDialog";

interface Props {
  onCreateNew?: () => void;
  onEditBlog?: (blog: BlogItem) => void;
}

export default function BlogListSection({ onCreateNew, onEditBlog }: Props) {
  const [items, setItems] = useState<BlogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTags, setSelectedTags] = useState<BlogTag[]>([]);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdminBlogFilters>({
    sortBy: "CreatedAt",
    sortDirection: "Desc",
    status: "all",
  });
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<BlogItem | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "restore";
    blog: BlogItem;
  } | null>(null);
  const { showNotification, NotificationComponent } = useNotification();

  const fetchList = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        IncludeDeleted: String((advancedFilters.status || "all") === "all"),
        PageNumber: String(pageNumber),
        PageSize: String(pageSize),
      });
      if (advancedFilters.dateFrom)
        params.append("DateFrom", advancedFilters.dateFrom);
      if (advancedFilters.dateTo)
        params.append("DateTo", advancedFilters.dateTo);
      if (advancedFilters.readingTimeMin != null)
        params.append("ReadingTimeMin", String(advancedFilters.readingTimeMin));
      if (advancedFilters.readingTimeMax != null)
        params.append("ReadingTimeMax", String(advancedFilters.readingTimeMax));
      if (advancedFilters.viewCountMin != null)
        params.append("ViewCountMin", String(advancedFilters.viewCountMin));
      if (advancedFilters.viewCountMax != null)
        params.append("ViewCountMax", String(advancedFilters.viewCountMax));
      if (advancedFilters.sortBy)
        params.append("SortBy", advancedFilters.sortBy);
      if (advancedFilters.sortDirection)
        params.append("SortDirection", advancedFilters.sortDirection);
      if (committedSearch.trim()) {
        params.append("SearchTerm", committedSearch.trim());
      }
      selectedTags.forEach((t) => params.append("TagIds", t.id));
      const url = `${ROUTES_API_BLOG.ADMIN_GET_ALL}?${params.toString()}`;
      const res = await axiosClient.get<BlogListResponse>(url);
      const data = res?.data?.data;
      const raw = data?.items || [];
      setItems(raw);
      setTotalPages(data?.totalPages || 1);
    } catch (error) {
      // Silent fail; optionally add notification hook
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, pageSize, selectedTags, status, committedSearch]);

  const handleSearch = () => {
    setCommittedSearch(searchTerm);
    setPageNumber(1);
  };

  const openDetails = async (id: string) => {
    setDetailOpen(true);
    setDetailItem(null);
    try {
      const url = ROUTES_API_BLOG.ADMIN_GET_BY_ID(id);
      const res = await axiosClient.get(url);
      const data = res?.data?.data || null;
      setDetailItem(data);
    } catch (error) {
      showNotification("Không thể tải chi tiết blog", "error");
    }
  };

  const showConfirmDialog = (type: "delete" | "restore", blog: BlogItem) => {
    setConfirmAction({ type, blog });
    setConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    const { type, blog } = confirmAction;
    setConfirmOpen(false);

    // Optimistic update
    const previousItems = items.map((it) => ({ ...it }));
    const previousDetail = detailItem ? { ...detailItem } : null;

    const newIsDeleted = type === "delete";
    setItems((curr) =>
      curr.map((it) =>
        it.id === blog.id ? { ...it, isDeleted: newIsDeleted } : it
      )
    );
    if (detailItem?.id === blog.id) {
      setDetailItem({ ...detailItem, isDeleted: newIsDeleted });
    }

    try {
      if (type === "delete") {
        await axiosClient.delete(ROUTES_API_BLOG.DELETE(blog.id));
        showNotification("Xóa blog thành công", "success");
      } else {
        await axiosClient.put(ROUTES_API_BLOG.RESTORE(blog.id));
        showNotification("Khôi phục blog thành công", "success");
      }
    } catch (error) {
      // Rollback on failure
      setItems(previousItems);
      setDetailItem(previousDetail);
      showNotification(
        type === "delete" ? "Không thể xóa blog" : "Không thể khôi phục blog",
        "error"
      );
    }
  };

  const handleDelete = (blog: BlogItem) => {
    showConfirmDialog("delete", blog);
  };

  const handleRestore = (blog: BlogItem) => {
    showConfirmDialog("restore", blog);
  };

  const handleEdit = (blog: BlogItem) => {
    onEditBlog?.(blog);
    setDetailOpen(false); // Close detail dialog when editing
  };

  const handleChangePage = (_: any, value: number) => {
    setPageNumber(value);
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Tìm theo tiêu đề, nội dung, tác giả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        edge="end"
                        onClick={handleSearch}
                        sx={{ mr: 0 }}
                        aria-label="search"
                      >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack
                direction="row"
                spacing={1}
                justifyContent={{ xs: "flex-start", md: "flex-end" }}
              >
                <IconButton
                  color="primary"
                  onClick={() => setAdvancedFilterOpen(true)}
                  aria-label="Mở bộ lọc"
                >
                  <FilterListIcon />
                </IconButton>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  onClick={() => onCreateNew?.()}
                >
                  Tạo blog
                </Button>
              </Stack>
            </Grid>
            {/* Selected Tag Chips */}
            {selectedTags.length > 0 && (
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {selectedTags.map((t) => (
                    <Chip
                      key={t.id}
                      label={t.name}
                      onDelete={() =>
                        setSelectedTags((prev) =>
                          prev.filter((x) => x.id !== t.id)
                        )
                      }
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                  <Chip
                    label="Xóa bộ lọc"
                    onClick={() => setSelectedTags([])}
                    onDelete={() => setSelectedTags([])}
                    sx={{ mr: 1, mb: 1 }}
                  />
                </Stack>
              </Grid>
            )}

            {/* Removed top page-size and action buttons as requested */}
          </Grid>
        </CardContent>
      </Card>

      <Paper elevation={0} sx={{ border: "1px solid #eee", borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Tác giả</TableCell>
                <TableCell align="right">Lượt xem</TableCell>
                <TableCell align="right">Thời gian đọc (phút)</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((it) => (
                <TableRow key={it.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      {it.thumbnailUrl ? (
                        <Box
                          component="img"
                          src={it.thumbnailUrl}
                          alt={it.title}
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 1,
                            objectFit: "cover",
                            border: "1px solid #eee",
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 1,
                            bgcolor: "#f5f5f5",
                            border: "1px solid #eee",
                          }}
                        />
                      )}
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight={600}
                          noWrap
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 260,
                          }}
                        >
                          {it.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 320,
                          }}
                        >
                          {it.content}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>{it.authorName}</TableCell>
                  <TableCell align="right">
                    {it.viewCount?.toLocaleString?.() ?? it.viewCount}
                  </TableCell>
                  <TableCell align="right">{it.readingTime}</TableCell>
                  <TableCell>
                    {new Date(it.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: "wrap" }}
                    >
                      {(it.tags || []).map((t) => (
                        <Box
                          key={t.id}
                          sx={{
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            bgcolor: "#f0f7ff",
                            color: "#1a73e8",
                            fontSize: 12,
                            border: "1px solid #e0ecff",
                          }}
                        >
                          {t.name}
                        </Box>
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton
                        size="small"
                        onClick={() => openDetails(it.id)}
                        aria-label="view details"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      {!it.isDeleted && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(it)}
                          aria-label="edit"
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      {it.isDeleted ? (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleRestore(it)}
                          aria-label="restore"
                        >
                          <RestoreIcon />
                        </IconButton>
                      ) : (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(it)}
                          aria-label="delete"
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="text.secondary">
                      Không có dữ liệu
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
          sx={{ p: 2 }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="page-size-bottom-label">Hiển thị</InputLabel>
              <Select
                labelId="page-size-bottom-label"
                label="Hiển thị"
                value={pageSize}
                onChange={(e) => {
                  setPageNumber(1);
                  setPageSize(Number(e.target.value));
                }}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={12}>12</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <Pagination
              page={pageNumber}
              count={totalPages}
              color="primary"
              onChange={handleChangePage}
            />
          </Stack>
        </Stack>
      </Paper>

      <BlogDetailDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        blog={detailItem}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        title={
          confirmAction?.type === "delete"
            ? "Xác nhận xóa blog"
            : "Xác nhận khôi phục blog"
        }
        message={
          confirmAction?.type === "delete"
            ? `Bạn có chắc chắn muốn xóa blog "${confirmAction?.blog.title}"?`
            : `Bạn có chắc chắn muốn khôi phục blog "${confirmAction?.blog.title}"?`
        }
        confirmText={confirmAction?.type === "delete" ? "Xóa" : "Khôi phục"}
        type={confirmAction?.type || "delete"}
      />

      <AdminBlogFilterDialog
        open={advancedFilterOpen}
        onClose={() => setAdvancedFilterOpen(false)}
        initial={advancedFilters}
        selectedTags={selectedTags}
        onChangeTags={(tags) => setSelectedTags(tags as any)}
        onApply={(vals) => {
          setAdvancedFilters(vals);
          setAdvancedFilterOpen(false);
          setPageNumber(1);
          fetchList();
        }}
      />
      <NotificationComponent />
    </Box>
  );
}
