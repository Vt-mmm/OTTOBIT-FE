import { Suspense, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Button,
  Chip,
  Grid,
  Divider,
  Link,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useAppDispatch } from "../../redux/config";
import { setMessageSuccess } from "../../redux/course/courseSlice";
// unused import removed
import LessonResourceListSection from "sections/admin/lessonResource/LessonResourceListSection";
import LessonResourceFormSection from "sections/admin/lessonResource/LessonResourceFormSection";
import { axiosClient } from "axiosClient";
import { ROUTES_API_LESSON_RESOURCE as LR } from "constants/routesApiKeys";
import AdminLayout from "layout/admin/AdminLayout";
import useLocales from "hooks/useLocales";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import DescriptionIcon from "@mui/icons-material/Description";
import ImageIcon from "@mui/icons-material/Image";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import LinkIcon from "@mui/icons-material/Link";
import ExtensionIcon from "@mui/icons-material/Extension";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function LessonResourceManagementPage() {
  const { translate } = useLocales();
  const dispatch = useAppDispatch();
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"list" | "detail" | "create" | "edit">(
    "list"
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [headerSubtitle, setHeaderSubtitle] = useState(
    translate("admin.resourceListSubtitle")
  );
  useEffect(() => setReady(true), []);

  // Update header subtitle based on mode
  useEffect(() => {
    if (selectedId) {
      setHeaderSubtitle(
        `${translate("admin.resourceDetailTitle")} #${selectedId}`
      );
    } else {
      setHeaderSubtitle(translate("admin.resourceListSubtitle"));
    }
  }, [selectedId, translate]);
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
                {translate("admin.lessonResourceManagement")}
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
              {translate("admin.backButton")}
            </Button>
          )}
        </Box>
        <Card>
          <CardContent>
            <Suspense fallback={<div>{translate("admin.loading")}</div>}>
              {ready && (
                <>
                  {mode === "list" && (
                    <LessonResourceListSection
                      // @ts-ignore
                      onCreateNew={() => {
                        setMode("create");
                        setHeaderSubtitle(translate("admin.addResource"));
                      }}
                      // @ts-ignore
                      onEditItem={(id: string) => {
                        setSelectedId(id);
                        setMode("edit");
                        setHeaderSubtitle(
                          `${translate("admin.editResourceTitle")} #${id}`
                        );
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
                      onNotify={(message: string) => {
                        dispatch(setMessageSuccess(message));
                      }}
                    />
                  )}
                  {mode === "create" && (
                    <LessonResourceFormSection
                      onCancel={() => {
                        setMode("list");
                        setHeaderSubtitle(
                          translate("admin.resourceListSubtitle")
                        );
                      }}
                      onSuccess={() => {
                        setMode("list");
                        setSelectedId(null);
                        setHeaderSubtitle(
                          translate("admin.resourceListSubtitle")
                        );
                        dispatch(
                          setMessageSuccess(
                            translate("admin.resourceCreatedSuccess")
                          )
                        );
                      }}
                    />
                  )}
                  {mode === "edit" && selectedId && (
                    <LessonResourceFormSection
                      id={selectedId}
                      onCancel={() => {
                        setMode("list");
                        setHeaderSubtitle(
                          translate("admin.resourceListSubtitle")
                        );
                      }}
                      onSuccess={() => {
                        setMode("list");
                        setSelectedId(null);
                        setHeaderSubtitle(
                          translate("admin.resourceListSubtitle")
                        );
                        dispatch(
                          setMessageSuccess(
                            translate("admin.resourceUpdatedSuccess")
                          )
                        );
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
    </AdminLayout>
  );
}

// Inline detail component fully removed
function InlineLessonResourceDetailCard({ id }: { id: string }) {
  const { translate } = useLocales();
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
    if (type === null || type === undefined)
      return translate("admin.undefined");
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
            {translate("admin.resourceNotFound")}
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
                          {data.lessonTitle ||
                            data.lessonId ||
                            translate("admin.undefined")}
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

          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
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
      </CardContent>
    </Card>
  );
}
