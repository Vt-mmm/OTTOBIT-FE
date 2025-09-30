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
} from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import LessonResourceListSection from "sections/admin/lessonResource/LessonResourceListSection";
import LessonResourceFormSection from "sections/admin/lessonResource/LessonResourceFormSection";
import { axiosClient } from "axiosClient";
import { ROUTES_API_LESSON_RESOURCE as LR } from "constants/routesApiKeys";
import AdminLayout from "layout/admin/AdminLayout";

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
  return (
    <AdminLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box
          sx={{
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 700, color: "#1a1a1a" }}
            >
              Quản lý Tài nguyên Bài học
            </Typography>
            <Typography variant="body1" sx={{ color: "#666", mt: 1 }}>
              {headerSubtitle}
            </Typography>
          </Box>
          {mode !== "list" && (
            <Button
              variant="outlined"
              onClick={() => {
                setMode("list");
                setHeaderSubtitle("Danh sách tài nguyên theo bài học/khoá học");
              }}
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
                      onViewDetail={async (id: string) => {
                        setSelectedId(id);
                        setMode("detail");
                        try {
                          const res = await axiosClient.get(
                            LR.ADMIN_GET_BY_ID(id)
                          );
                          const title = res?.data?.data?.title || "";
                          setHeaderSubtitle(
                            `Chi tiết tài nguyên${title ? `: ${title}` : ""}`
                          );
                        } catch {
                          setHeaderSubtitle(`Chi tiết tài nguyên`);
                        }
                      }}
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
                    <Box
                      sx={{
                        p: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        bgcolor: "grey.50",
                      }}
                    >
                      <InlineLessonResourceDetail id={selectedId} />
                    </Box>
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

function InlineLessonResourceDetail({ id }: { id: string }) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const run = async () => {
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
  if (loading) return <Box sx={{ p: 4, textAlign: "center" }}>Đang tải...</Box>;
  if (!data) return <Typography>Không tìm thấy tài nguyên</Typography>;

  const getTypeLabel = (type: number) => {
    switch (type) {
      case 1:
        return "Video";
      case 2:
        return "Document";
      case 3:
        return "Image";
      case 4:
        return "Audio";
      case 5:
        return "External Link";
      case 6:
        return "Interactive";
      case 7:
        return "Slides";
      default:
        return "Unknown";
    }
  };

  return (
    <Box sx={{ display: "grid", gap: 2, maxWidth: 880 }}>
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {data.title}
        </Typography>
        <Chip
          size="small"
          label={getTypeLabel(Number(data.type))}
          color="primary"
          variant="outlined"
        />
      </Box>

      {data.description && (
        <Typography color="text.secondary">{data.description}</Typography>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary">
            Bài học
          </Typography>
          <Typography>{data.lessonTitle || data.lessonId || "-"}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Khóa học
          </Typography>
          <Typography>{data.courseTitle || "-"}</Typography>
        </Box>
        <Box sx={{ gridColumn: { xs: "auto", sm: "1 / span 2" } }}>
          <Typography variant="caption" color="text.secondary">
            URL
          </Typography>
          <Typography sx={{ wordBreak: "break-all" }}>
            {data.fileUrl}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Ngày tạo
          </Typography>
          <Typography>
            {data.createdAt
              ? new Date(data.createdAt).toLocaleString("vi-VN")
              : "-"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
