import { Suspense, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Button,
  Chip,
  Snackbar,
  Alert,
  Grid,
  Divider,
  Link,
  Stack,
  CircularProgress,
} from "@mui/material";
// unused import removed
import LessonResourceListSection from "sections/admin/lessonResource/LessonResourceListSection";
import LessonResourceFormSection from "sections/admin/lessonResource/LessonResourceFormSection";
import { axiosClient } from "axiosClient";
import { ROUTES_API_LESSON_RESOURCE as LR } from "constants/routesApiKeys";
import AdminLayout from "layout/admin/AdminLayout";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import DescriptionIcon from "@mui/icons-material/Description";
import ImageIcon from "@mui/icons-material/Image";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import LinkIcon from "@mui/icons-material/Link";
import ExtensionIcon from "@mui/icons-material/Extension";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function LessonResourceManagementPage() {
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"list" | "detail" | "create" | "edit">(
    "list"
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [headerSubtitle, setHeaderSubtitle] = useState(
    "Danh sách tài nguyên theo bài học/khoá học"
  );
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  useEffect(() => setReady(true), []);

  // Update header subtitle based on mode
  useEffect(() => {
    if (selectedId) {
      setHeaderSubtitle(`Chi tiết tài nguyên #${selectedId}`);
    } else {
      setHeaderSubtitle("Danh sách tài nguyên theo bài học/khoá học");
    }
  }, [selectedId]);
  return (
    <AdminLayout>
      <Container
        maxWidth="xl"
        sx={{ py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 3 } }}
      >
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              gap: { xs: 1, sm: 0 },
            }}
          >
            <Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: "#1a1a1a",
                  fontSize: { xs: "1.5rem", sm: "2.125rem" },
                }}
              >
                Quản lý Tài nguyên Học tập
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#666",
                  mt: 1,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                {headerSubtitle}
              </Typography>
            </Box>
          </Box>
          {selectedId && (
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => {
                setSelectedId(null);
                setMode("list");
              }}
              sx={{
                mt: { xs: 1.5, sm: 1 },
                alignSelf: "flex-start",
                minHeight: { xs: 44, sm: 36 },
              }}
              variant="text"
              color="inherit"
            >
              Quay lại
            </Button>
          )}
        </Box>
        <Card>
          <CardContent>
            <Suspense fallback={<div>Loading...</div>}>
              {ready && (
                <>
                  {mode === "list" && (
                    <LessonResourceListSection
                      // @ts-ignore
                      onCreateNew={() => {
                        setMode("create");
                        setHeaderSubtitle("Thêm tài nguyên");
                      }}
                      // @ts-ignore
                      onEditItem={(id: string) => {
                        setSelectedId(id);
                        setMode("edit");
                        setHeaderSubtitle(`Chỉnh sửa tài nguyên #${id}`);
                      }}
                      // @ts-ignore
                      onViewDetail={(id: string) => {
                        setSelectedId(id);
                        setMode("detail");
                      }}
                      // @ts-ignore
                      selectedId={selectedId}
                      // show parent toast for delete/restore
                      // @ts-ignore
                      onNotify={(message: string) =>
                        setSnackbar({
                          open: true,
                          message,
                          severity: "success",
                        })
                      }
                    />
                  )}
                  {mode === "create" && (
                    <LessonResourceFormSection
                      onCancel={() => {
                        setMode("list");
                        setHeaderSubtitle(
                          "Danh sách tài nguyên theo bài học/khoá học"
                        );
                      }}
                      onSuccess={() => {
                        setMode("list");
                        setHeaderSubtitle(
                          "Danh sách tài nguyên theo bài học/khoá học"
                        );
                        setSnackbar({
                          open: true,
                          message: "Tạo tài nguyên thành công",
                          severity: "success",
                        });
                      }}
                    />
                  )}
                  {mode === "edit" && selectedId && (
                    <LessonResourceFormSection
                      id={selectedId}
                      onCancel={() => {
                        setMode("list");
                        setHeaderSubtitle(
                          "Danh sách tài nguyên theo bài học/khoá học"
                        );
                      }}
                      onSuccess={() => {
                        setMode("list");
                        setHeaderSubtitle(
                          "Danh sách tài nguyên theo bài học/khoá học"
                        );
                        setSnackbar({
                          open: true,
                          message: "Cập nhật tài nguyên thành công",
                          severity: "success",
                        });
                      }}
                    />
                  )}
                  {mode === "detail" && selectedId && (
                    <InlineLessonResourceDetailCard id={selectedId} />
                  )}
                </>
              )}
            </Suspense>
          </CardContent>
        </Card>
      </Container>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
}

// Inline detail component fully removed
function InlineLessonResourceDetailCard({ id }: { id: string }) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get(LR.ADMIN_GET_BY_ID(id));
        setData(res?.data?.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const getTypeIcon = (type: any) => {
    if (type === null || type === undefined) return <ExtensionIcon />;
    const typeStr = String(type).toLowerCase();
    switch (typeStr) {
      case "video":
      case "1":
        return <VideoLibraryIcon />;
      case "document":
      case "pdf":
      case "2":
        return <DescriptionIcon />;
      case "image":
      case "3":
        return <ImageIcon />;
      case "audio":
      case "4":
        return <AudioFileIcon />;
      case "link":
      case "5":
        return <LinkIcon />;
      case "presentation":
      case "6":
        return <SlideshowIcon />;
      default:
        return <ExtensionIcon />;
    }
  };

  const getTypeName = (type: any) => {
    if (type === null || type === undefined) return "Chưa xác định";
    const typeStr = String(type).toLowerCase();
    switch (typeStr) {
      case "video":
      case "1":
        return "Video";
      case "document":
      case "pdf":
      case "2":
        return "Tài liệu";
      case "image":
      case "3":
        return "Hình ảnh";
      case "audio":
      case "4":
        return "Âm thanh";
      case "link":
      case "5":
        return "Liên kết";
      case "presentation":
      case "6":
        return "Trình bày";
      default:
        return "Chưa xác định";
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Card sx={{ boxShadow: 2, mt: 2 }}>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Không tìm thấy tài nguyên
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ boxShadow: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ boxShadow: 2, height: "fit-content" }}>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <Box>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      mb={1}
                    >
                      {getTypeIcon(data.type)}
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {data.title}
                      </Typography>
                    </Stack>
                    {data.description && (
                      <Typography color="text.secondary">
                        {data.description}
                      </Typography>
                    )}
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Thông tin chi tiết
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          Loại tài nguyên
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {getTypeName(data.type)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          Khóa học
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {data.courseTitle || "Chưa xác định"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          Bài học
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {data.lessonTitle || data.lessonId || "Chưa xác định"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          URL tài nguyên
                        </Typography>
                        <Link
                          href={data.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            wordBreak: "break-all",
                            display: "inline-block",
                            maxWidth: "100%",
                          }}
                        >
                          {data.fileUrl}
                        </Link>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Card sx={{ boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Thông tin hệ thống
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        Ngày tạo
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {new Date(data.createdAt).toLocaleString("vi-VN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </Box>
                    {data.updatedAt && (
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          Ngày cập nhật
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {new Date(data.updatedAt).toLocaleString("vi-VN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              <Card sx={{ boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Hành động
                  </Typography>
                  <Stack spacing={1}>
                    <Link
                      href={data.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ textDecoration: "none" }}
                    >
                      <Chip
                        label="Mở tài nguyên"
                        color="primary"
                        variant="outlined"
                        clickable
                        icon={<LinkIcon />}
                        sx={{ width: "100%", justifyContent: "flex-start" }}
                      />
                    </Link>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
