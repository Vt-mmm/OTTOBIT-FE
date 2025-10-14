import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Stack,
  Grid,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import {
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { BlogItem } from "../../../types/blog";

interface BlogDetailDialogProps {
  open: boolean;
  onClose: () => void;
  blog: BlogItem | null;
  onEdit?: (blog: BlogItem) => void;
  onDelete?: (blog: BlogItem) => void;
  onRestore?: (blog: BlogItem) => void;
}

export default function BlogDetailDialog({
  open,
  onClose,
  blog,
}: BlogDetailDialogProps) {
  if (!blog) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (isDeleted: boolean) => {
    return isDeleted ? "error" : "success";
  };

  const getStatusText = (isDeleted: boolean) => {
    return isDeleted ? "Đã xóa" : "Hoạt động";
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: "80vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="h5" component="div" fontWeight="bold">
          Chi tiết Blog
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Header Info */}
          <Card elevation={1}>
            <CardContent>
              <Grid container spacing={3}>
                {/* Thumbnail */}
                <Grid item xs={12} md={4}>
                  {blog.thumbnailUrl ? (
                    <Box
                      component="img"
                      src={blog.thumbnailUrl}
                      alt={blog.title}
                      sx={{
                        width: "100%",
                        height: 200,
                        objectFit: "cover",
                        borderRadius: 2,
                        border: 1,
                        borderColor: "divider",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: 200,
                        borderRadius: 2,
                        border: 1,
                        borderColor: "divider",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "grey.100",
                      }}
                    >
                      <Typography color="text.secondary">
                        Không có hình ảnh
                      </Typography>
                    </Box>
                  )}
                </Grid>

                {/* Basic Info */}
                <Grid item xs={12} md={8}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {blog.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontStyle: "italic" }}
                      >
                        Slug: {blog.slug}
                      </Typography>
                    </Box>

                    {/* Stats */}
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <VisibilityIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {blog.viewCount.toLocaleString()} lượt xem
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {blog.readingTime} phút đọc
                        </Typography>
                      </Box>
                      <Chip
                        label={getStatusText(blog.isDeleted)}
                        color={getStatusColor(blog.isDeleted)}
                        size="small"
                      />
                    </Stack>

                    {/* Tags */}
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Tags:
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {blog.tags?.map((tag) => (
                          <Chip
                            key={tag.id}
                            label={tag.name}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Author & Dates Info */}
          <Card elevation={1}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PersonIcon color="action" />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Tác giả
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {blog.authorName}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CalendarIcon color="action" />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Ngày tạo
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(blog.createdAt)}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Cập nhật lần cuối
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(blog.updatedAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    ID Blog
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                    {blog.id}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Content */}
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Nội dung
              </Typography>
              <Box
                sx={{
                  maxHeight: 400,
                  overflowY: "auto",
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 2,
                  bgcolor: "grey.50",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                  }}
                >
                  {blog.content}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: 1, borderColor: "divider" }}>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" onClick={onClose}>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
