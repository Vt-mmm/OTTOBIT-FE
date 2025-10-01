import AdminLayout from "layout/admin/AdminLayout";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosClient } from "axiosClient";
import { ROUTES_API_LESSON_RESOURCE as LR } from "constants/routesApiKeys";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  IconButton,
  Chip,
  Divider,
  Grid,
  Link,
  Stack,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import DescriptionIcon from "@mui/icons-material/Description";
import ImageIcon from "@mui/icons-material/Image";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import LinkIcon from "@mui/icons-material/Link";
import ExtensionIcon from "@mui/icons-material/Extension";
import SlideshowIcon from "@mui/icons-material/Slideshow";

export default function LessonResourceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await axiosClient.get(LR.ADMIN_GET_BY_ID(id));
        setData(res?.data?.data);
      } finally {
        setLoading(false);
      }
    };
    run();
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

    // Convert to string for comparison
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

  // getTypeColor not used here; removed to satisfy linter

  return (
    <AdminLayout>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} size="small" sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Quản lý Tài nguyên Bài học
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Chi tiết tài nguyên #{id}
          </Typography>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : !data ? (
        <Card sx={{ boxShadow: 2 }}>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Không tìm thấy tài nguyên
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {/* Thông tin chính */}
          <Grid item xs={12} md={8}>
            <Card sx={{ boxShadow: 2, height: "fit-content" }}>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={3}>
                  {/* Header */}
                  <Box>
                    <Box mb={2}>
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
                    </Box>
                    {data.description && (
                      <Typography color="text.secondary" sx={{ mt: 1 }}>
                        {data.description}
                      </Typography>
                    )}
                  </Box>

                  <Divider />

                  {/* Thông tin chi tiết */}
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

          {/* Thông tin phụ */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              {/* Thông tin hệ thống */}
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

              {/* Actions */}
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
      )}
    </AdminLayout>
  );
}

// duplicate removed
