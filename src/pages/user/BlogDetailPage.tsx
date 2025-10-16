import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Chip,
  Stack,
  Breadcrumbs,
  Link as MuiLink,
  Skeleton,
  Divider,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useParams } from "react-router-dom";
import Header from "layout/components/header/Header";
import Footer from "layout/components/footer/Footer";
import { ROUTES_API_BLOG } from "constants/routesApiKeys";
import axios from "axios";
import { axiosClient } from "axiosClient";
import {
  TextField,
  Button,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Typography as MuiTypography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SendIcon from "@mui/icons-material/Send";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { ROUTES_API_BLOG_COMMENT } from "constants/routesApiKeys";
import { useAppSelector } from "store/config";

type BlogTag = { id: string; name: string };
type BlogDetail = {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnailUrl: string;
  authorName: string;
  viewCount: number;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
  tags: BlogTag[];
};

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BlogDetail | null>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [comments, setComments] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const [commentPage, setCommentPage] = useState(1);
  const [commentSize] = useState(10);
  const [commentTotalPages, setCommentTotalPages] = useState(1);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState<string>("");
  const { isAuthenticated, userAuth } = useAppSelector((state) => state.auth);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuForId, setMenuForId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [viewCountTriggered, setViewCountTriggered] = useState(false);
  const [viewTimerDone, setViewTimerDone] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const url = ROUTES_API_BLOG.GET_BY_SLUG(slug || "");
        const res = await axios.get(url);
        setData(res?.data?.data || null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  // Scroll progress indicator
  useEffect(() => {
    const onScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const progress =
        docHeight > 0
          ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100))
          : 0;
      setScrollProgress(progress);
      setShowScrollTop(scrollTop > 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Start a 30s timer per slug
  useEffect(() => {
    setViewTimerDone(false);
    setViewCountTriggered(false);
    const timer = setTimeout(() => setViewTimerDone(true), 30000);
    return () => clearTimeout(timer);
  }, [slug]);

  // Trigger view count once per session when timer done and scrolled >= 50%
  useEffect(() => {
    const tryTrigger = async () => {
      if (!data?.id) return;
      const key = `blog_viewcount_${data.id}`;
      if (sessionStorage.getItem(key)) return;
      try {
        await axiosClient.put(ROUTES_API_BLOG.VIEW_COUNT(data.id));
        sessionStorage.setItem(key, "1");
        setViewCountTriggered(true);
      } catch {}
    };
    if (
      !viewCountTriggered &&
      viewTimerDone &&
      scrollProgress >= 50 &&
      data?.id
    ) {
      tryTrigger();
    }
  }, [viewTimerDone, scrollProgress, data?.id, viewCountTriggered]);

  const loadComments = async () => {
    if (!data?.id) return;
    try {
      setIsLoadingComments(true);
      const url = ROUTES_API_BLOG_COMMENT.GET_BY_BLOG(
        data.id,
        commentPage,
        commentSize
      );
      const res = await axiosClient.get(url);
      const newItems = res?.data?.data?.items || res?.data?.data || [];
      setComments((prev) =>
        commentPage === 1 ? newItems : [...prev, ...newItems]
      );
      setCommentTotalPages(res?.data?.data?.totalPages || 1);
    } catch {
    } finally {
      setIsLoadingComments(false);
    }
  };

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id, commentPage, commentSize]);

  const handleAddComment = async () => {
    if (!isAuthenticated || !data?.id) return;
    const content = commentText.trim();
    if (!content) {
      setCommentError("Nội dung không được để trống");
      return;
    }
    if (content.length > 1000) {
      setCommentError("Nội dung tối đa 1000 ký tự");
      return;
    }
    try {
      await axiosClient.post(ROUTES_API_BLOG_COMMENT.CREATE, {
        blogId: data.id,
        content,
      });
      setCommentText("");
      setCommentError("");
      setCommentPage(1);
      loadComments();
    } catch {}
  };

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
      <Container
        maxWidth="md"
        sx={{ py: 4, flexGrow: 1, mt: { xs: 6, md: 8 } }}
      >
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink color="inherit" href="/">
            Trang chủ
          </MuiLink>
          <MuiLink color="inherit" href="/user/blogs">
            Blog
          </MuiLink>
          <Typography color="text.primary">{data?.title || slug}</Typography>
        </Breadcrumbs>

        {loading ? (
          <>
            <Skeleton variant="text" height={48} width="70%" />
            <Skeleton
              variant="rectangular"
              height={320}
              sx={{ borderRadius: 2, my: 2 }}
            />
            <Skeleton variant="text" height={24} width="50%" />
            <Skeleton variant="text" height={18} width="90%" />
            <Skeleton variant="text" height={18} width="85%" />
          </>
        ) : !data ? (
          <Typography>Không tìm thấy bài viết.</Typography>
        ) : (
          <>
            <Typography variant="h3" fontWeight={800} gutterBottom>
              {data.title}
            </Typography>
            {/* Meta */}
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ color: "text.secondary", mb: 2 }}
            >
              <Typography variant="body2">{data.authorName}</Typography>
              <Divider orientation="vertical" flexItem />
              <Typography variant="body2">
                {new Date(data.createdAt).toLocaleString()}
              </Typography>
              <Divider orientation="vertical" flexItem />
              <Typography variant="body2">
                {data.readingTime} phút đọc
              </Typography>
              <Divider orientation="vertical" flexItem />
              <Stack direction="row" spacing={0.5} alignItems="center">
                <VisibilityIcon fontSize="small" />
                <Typography variant="body2">
                  {(data.viewCount ?? 0).toLocaleString()} lượt xem
                </Typography>
              </Stack>
            </Stack>
            {data.thumbnailUrl && (
              <Box
                component="img"
                src={data.thumbnailUrl}
                alt={data.title}
                sx={{ width: "100%", borderRadius: 2, mb: 3 }}
              />
            )}
            {/* Tags */}
            {data.tags?.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
                {data.tags.map((t) => (
                  <Chip key={t.id} label={t.name} size="small" />
                ))}
              </Stack>
            )}
            {/* Content */}
            <Typography
              variant="body1"
              sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}
            >
              {data.content}
            </Typography>
          </>
        )}

        {/* Comments Section */}
        {data && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Bình luận
            </Typography>

            {isAuthenticated ? (
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: "#8BC34A" }}>
                  {(userAuth?.email || "U").charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ position: "relative", flexGrow: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    placeholder="Viết bình luận..."
                    value={commentText}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.length <= 1000) {
                        setCommentText(val);
                        if (commentError) setCommentError("");
                      }
                    }}
                    inputProps={{ maxLength: 1000 }}
                    sx={{
                      "& .MuiInputBase-inputMultiline": {
                        paddingRight: 36,
                        paddingBottom: 2,
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    color={commentError ? "error" : "text.secondary"}
                    sx={{ position: "absolute", left: 12, bottom: 10 }}
                  >
                    {commentError || `${commentText.trim().length}/1000`}
                  </Typography>
                  <IconButton
                    color="primary"
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    aria-label="Gửi bình luận"
                    size="small"
                    sx={{
                      position: "absolute",
                      right: 6,
                      bottom: 2,
                      bgcolor: (theme) =>
                        theme.palette.mode === "light" ? "#e8f5e9" : "#1b5e20",
                      "&:hover": { bgcolor: "#c8e6c9" },
                    }}
                  >
                    <SendIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Stack>
            ) : (
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Vui lòng đăng nhập để bình luận.
              </Typography>
            )}

            <Stack spacing={2}>
              {comments.map((c: any) => (
                <Box
                  key={c.id}
                  sx={{ p: 2, border: "1px solid #eee", borderRadius: 2 }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Avatar sx={{ bgcolor: "#9CCC65" }}>
                      {(c.userName || c.authorName || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography fontWeight={600}>
                        {c.userName || c.authorName || "Người dùng"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {c.createdAt
                          ? new Date(c.createdAt).toLocaleString()
                          : ""}
                      </Typography>
                    </Box>
                  </Stack>
                  {editingId === c.id ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      value={editingText}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.length <= 1000) {
                          setEditingText(val);
                        }
                      }}
                      inputProps={{ maxLength: 1000 }}
                      helperText={`${editingText.trim().length}/1000`}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {c.content}
                    </Typography>
                  )}
                  {isAuthenticated && userAuth?.userId === c.userId && (
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 1, justifyContent: "flex-end" }}
                    >
                      {editingId === c.id ? (
                        <>
                          <Button
                            size="small"
                            onClick={async () => {
                              if (!editingText.trim()) return;
                              try {
                                await axiosClient.put(
                                  ROUTES_API_BLOG_COMMENT.UPDATE(c.id),
                                  { content: editingText.trim() }
                                );
                                setEditingId(null);
                                setEditingText("");
                                loadComments();
                              } catch {}
                            }}
                          >
                            Lưu
                          </Button>
                          <Button
                            size="small"
                            color="inherit"
                            onClick={() => {
                              setEditingId(null);
                              setEditingText("");
                            }}
                          >
                            Hủy
                          </Button>
                        </>
                      ) : (
                        <>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              setMenuAnchorEl(e.currentTarget);
                              setMenuForId(c.id);
                            }}
                            aria-label="comment-actions"
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                          <Menu
                            anchorEl={menuAnchorEl}
                            open={Boolean(menuAnchorEl) && menuForId === c.id}
                            onClose={() => {
                              setMenuAnchorEl(null);
                              setMenuForId(null);
                            }}
                          >
                            <MenuItem
                              onClick={() => {
                                setEditingId(c.id);
                                setEditingText(c.content || "");
                                setMenuAnchorEl(null);
                                setMenuForId(null);
                              }}
                            >
                              Sửa
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                setConfirmDeleteId(c.id);
                                setConfirmOpen(true);
                                setMenuAnchorEl(null);
                                setMenuForId(null);
                              }}
                            >
                              Xóa
                            </MenuItem>
                          </Menu>
                        </>
                      )}
                    </Stack>
                  )}
                </Box>
              ))}
            </Stack>

            {commentPage < commentTotalPages && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button
                  variant="text"
                  onClick={() => setCommentPage((p) => p + 1)}
                  disabled={isLoadingComments}
                >
                  {isLoadingComments ? "Đang tải..." : "Xem thêm bình luận"}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Container>
      {/* Scroll-to-top with progress */}
      {showScrollTop && (
        <Box
          sx={{
            position: "fixed",
            right: 24,
            bottom: 24,
            zIndex: 1200,
          }}
        >
          <Box
            sx={{
              position: "relative",
              display: "inline-flex",
              filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.15))",
            }}
          >
            {/* Track (thicker stroke) */}
            <CircularProgress
              variant="determinate"
              value={100}
              size={62}
              thickness={10}
              sx={{
                color: "#cbd5e1",
                "& .MuiCircularProgress-circle": { strokeWidth: 10 },
              }}
            />
            {/* Progress */}
            <CircularProgress
              variant="determinate"
              value={Math.min(100, Math.max(0, scrollProgress))}
              size={62}
              thickness={10}
              sx={{
                color: "#10b981",
                position: "absolute",
                left: 0,
                top: 0,
                "& .MuiCircularProgress-circle": {
                  transition: "stroke-dashoffset 120ms linear",
                  strokeLinecap: "round",
                  strokeWidth: 10,
                },
              }}
            />
            <IconButton
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              sx={{
                position: "absolute",
                top: 7.5, // (62 - 48) / 2 to center inside 62px ring
                left: 7.5, // (62 - 48) / 2 to center inside 62px ring
                width: 48,
                height: 48,
                bgcolor: "white",
                color: "#065f46",
                border: "1px solid #e5e7eb",
                "&:hover": { bgcolor: "#f0fdf4" },
              }}
              aria-label="Lên đầu trang"
            >
              <ArrowUpwardIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}
      {/* Delete Comment Confirm Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Xác nhận xóa bình luận</DialogTitle>
        <DialogContent>
          <MuiTypography>
            Bạn có chắc chắn muốn xóa bình luận này?
          </MuiTypography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Hủy</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (!confirmDeleteId) return;
              try {
                await axiosClient.delete(
                  ROUTES_API_BLOG_COMMENT.DELETE(confirmDeleteId)
                );
                setConfirmOpen(false);
                setConfirmDeleteId(null);
                loadComments();
              } catch {
                setConfirmOpen(false);
                setConfirmDeleteId(null);
              }
            }}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
      <Footer />
    </Box>
  );
}
