import { useEffect, useState } from "react";
import AdminLayout from "layout/admin/AdminLayout";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";
import { axiosClient } from "axiosClient";
import { ROUTES_API_CHALLENGE } from "constants/routesApiKeys";

interface ChallengeItem {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  order?: number;
  difficulty?: number;
}

export default function MapManagementPage() {
  const [rows, setRows] = useState<ChallengeItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get(ROUTES_API_CHALLENGE.GET_ALL, {
          params: { pageNumber: 1, pageSize: 50 },
        });
        const items: ChallengeItem[] = res?.data?.data?.items || [];
        if (!cancelled) setRows(items);
      } catch (e) {
        try {
          if ((window as any).Snackbar?.enqueueSnackbar) {
            (window as any).Snackbar.enqueueSnackbar(
              "Không tải được danh sách map",
              {
                variant: "error",
                anchorOrigin: { vertical: "top", horizontal: "right" },
              }
            );
          }
        } catch {
          // no-op
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AdminLayout>
      <Container maxWidth="xl">
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 600, color: "#1B5E20", mb: 1 }}
            >
              Quản lý Map
            </Typography>
            <Typography variant="body1" sx={{ color: "#558B2F" }}>
              Danh sách map (challenge) đã tạo
            </Typography>
          </Box>
          <Button variant="contained" href="/admin/map-designer">
            Tạo Map mới
          </Button>
        </Box>

        <Paper sx={{ p: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell>Lesson</TableCell>
                <TableCell>Thứ tự</TableCell>
                <TableCell>Độ khó</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.title}</TableCell>
                  <TableCell>{r.description}</TableCell>
                  <TableCell>
                    <Chip size="small" label={r.lessonId} />
                  </TableCell>
                  <TableCell>{r.order ?? "-"}</TableCell>
                  <TableCell>{r.difficulty ?? "-"}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      href={`/studio/${r.id}`}
                    >
                      Xem
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Container>
    </AdminLayout>
  );
}
