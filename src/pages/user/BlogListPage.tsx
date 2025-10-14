import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Pagination,
  MenuItem,
  Select,
  FormControl,
  Stack,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Skeleton,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArticleIcon from "@mui/icons-material/Article";
import { ROUTES_API_BLOG } from "constants/routesApiKeys";
import axios from "axios";
import Header from "layout/components/header/Header";
import Footer from "layout/components/footer/Footer";
import { LanguageSwitcher } from "components/common";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import UserBlogFilterDialog, {
  UserBlogFilters,
} from "../../sections/user/blog/UserBlogFilterDialog";
import { useNavigate } from "react-router-dom";

type BlogTag = { id: string; name: string };
type BlogItem = {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnailUrl: string;
  authorName: string;
  viewCount: number;
  readingTime: number;
  createdAt: string;
  tags: BlogTag[];
};

type BlogListResponse = {
  message: string;
  data: {
    size: number;
    page: number;
    total: number;
    totalPages: number;
    items: BlogItem[];
  };
};

const PAGE_SIZES = [6, 9, 12];

const BlogListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<BlogItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTags, setSelectedTags] = useState<BlogTag[]>([]);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<UserBlogFilters>({
    sortBy: "CreatedAt",
    sortDirection: "Desc",
  });

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        SearchTerm: search,
        PageNumber: String(page),
        PageSize: String(pageSize),
      });
      // Append selected TagIds
      selectedTags.forEach((t) => params.append("TagIds", t.id));
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
        params.append("SortBy", advancedFilters.sortBy!);
      if (advancedFilters.sortDirection)
        params.append("SortDirection", advancedFilters.sortDirection!);
      const url = `${ROUTES_API_BLOG.GET_ALL}?${params.toString()}`;
      const { data } = await axios.get<BlogListResponse>(url);
      setItems(data?.data?.items ?? []);
      setTotalPages(data?.data?.totalPages ?? 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, selectedTags]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBlogs();
  };

  const cards = useMemo(() => {
    if (loading) {
      return Array.from({ length: pageSize }).map((_, idx) => (
        <Grid item xs={12} sm={6} md={4} key={`s-${idx}`}>
          <Card sx={{ borderRadius: 2 }}>
            <Skeleton variant="rectangular" height={160} />
            <CardContent>
              <Skeleton width="80%" />
              <Skeleton width="60%" />
              <Stack direction="row" spacing={1} mt={1}>
                <Skeleton width={60} height={28} />
                <Skeleton width={60} height={28} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ));
    }
    return items.map((b) => (
      <Grid item xs={12} sm={6} md={4} key={b.id}>
        <Card
          sx={{
            height: "100%",
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
          }}
          onClick={() => navigate(`/user/blogs/${b.slug}`)}
          role="button"
          style={{ cursor: "pointer" }}
        >
          <CardMedia
            component="img"
            height="160"
            image={b.thumbnailUrl}
            alt={b.title}
          />
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom noWrap>
              {b.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {b.content}
            </Typography>
            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
              {b.tags?.slice(0, 3).map((t) => (
                <Chip key={t.id} size="small" label={t.name} />
              ))}
              {b.tags && b.tags.length > 3 && (
                <Chip size="small" label={`+${b.tags.length - 3}`} />
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    ));
  }, [items, loading, pageSize]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <Header />

      {/* Language Switcher - Top right */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: 80, md: 90 },
          right: { xs: 16, md: 32 },
          zIndex: 999,
        }}
      >
        <LanguageSwitcher />
      </Box>

      <Container
        maxWidth="lg"
        sx={{ py: 4, flexGrow: 1, mt: { xs: 6, md: 8 } }}
      >
        {/* Hero Header */}
        <Box
          sx={{
            mb: 3,
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)",
            border: "1px solid #e0f2f1",
          }}
        >
          <Breadcrumbs sx={{ mb: 1 }}>
            <MuiLink color="inherit" href="/">
              Trang chủ
            </MuiLink>
            <Typography color="text.primary">Blog</Typography>
          </Breadcrumbs>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <ArticleIcon color="success" sx={{ mr: 1.5 }} />
            <Typography variant="h4" fontWeight={800}>
              Blog
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Khám phá các bài viết, tin tức và cập nhật mới nhất từ OttoBit.
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 2 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
          >
            <TextField
              placeholder="Tìm kiếm bài viết..."
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton type="submit" color="success">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <IconButton
              color="primary"
              onClick={() => setAdvancedFilterOpen(true)}
              aria-label="Mở bộ lọc"
            >
              <FilterListIcon />
            </IconButton>
          </Stack>
        </Box>

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
            {selectedTags.map((t) => (
              <Chip
                key={t.id}
                label={t.name}
                onDelete={() =>
                  setSelectedTags((prev) => prev.filter((x) => x.id !== t.id))
                }
              />
            ))}
            <Chip
              color="default"
              icon={<CloseIcon />}
              label="Xóa bộ lọc"
              onClick={() => setSelectedTags([])}
              onDelete={() => setSelectedTags([])}
            />
          </Stack>
        )}

        <Grid container spacing={2}>
          {cards}
        </Grid>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mt={4}
        >
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {PAGE_SIZES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}/trang
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Pagination
            color="primary"
            page={page}
            count={totalPages}
            onChange={(_, v) => setPage(v)}
          />
        </Stack>

        <UserBlogFilterDialog
          open={advancedFilterOpen}
          onClose={() => setAdvancedFilterOpen(false)}
          initial={advancedFilters}
          selectedTags={selectedTags}
          onChangeTags={(tags) => setSelectedTags(tags as any)}
          onApply={(vals) => {
            setAdvancedFilters(vals);
            setAdvancedFilterOpen(false);
            setPage(1);
            fetchBlogs();
          }}
        />
      </Container>
      <Footer />
    </Box>
  );
};

export default BlogListPage;
