import AdminLayout from "layout/admin/AdminLayout";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosClient } from "axiosClient";
import { ROUTES_API_LESSON_RESOURCE as LR } from "constants/routesApiKeys";
import useLocales from "hooks/useLocales";
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
  const { translate } = useLocales();
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
    if (type === null || type === undefined) return translate("admin.undefined");

    // Convert to string for comparison
    const typeStr = String(type).toLowerCase();

    switch (typeStr) {
      case "video":
      case "1":
        return translate("admin.typeVideo");
      case "document":
      case "pdf":
      case "2":
        return translate("admin.typeDocument");
      case "image":
      case "3":
        return translate("admin.typeImage");
      case "audio":
      case "4":
        return translate("admin.typeAudio");
      case "link":
      case "5":
        return translate("admin.typeLink");
      case "presentation":
      case "6":
        return translate("admin.typePresentation");
      default:
        return translate("admin.undefined");
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
            {translate("admin.lessonResourceManagement")}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {translate("admin.resourceDetailTitle")} #{id}
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
              {translate("admin.resourceNotFound")}
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
                      {translate("admin.detailInformation")}
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          {translate("admin.resourceType")}
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
                          {translate("admin.course")}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {data.courseTitle || translate("admin.undefined")}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          {translate("admin.lesson")}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {data.lessonTitle || data.lessonId || translate("admin.undefined")}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          {translate("admin.resourceUrl")}
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
                    {translate("admin.systemInformation")}
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        {translate("admin.createdDate")}
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
                          {translate("admin.updatedDate")}
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
                    {translate("admin.actions")}
                  </Typography>
                  <Stack spacing={1}>
                    <Link
                      href={data.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ textDecoration: "none" }}
                    >
                      <Chip
                        label={translate("admin.openResource")}
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
