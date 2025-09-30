import AdminLayout from "layout/admin/AdminLayout";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosClient } from "axiosClient";
import { ROUTES_API_LESSON_RESOURCE as LR } from "constants/routesApiKeys";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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

  return (
    <AdminLayout>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} size="small" sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Quản lý Tài nguyên Học Tập
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Chi tiết tài nguyên{data?.title ? `: ${data.title}` : ""}
          </Typography>
        </Box>
      </Box>
      <Card sx={{ boxShadow: 2 }}>
        <CardContent>
          {loading ? (
            <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : !data ? (
            <Typography>Không tìm thấy tài nguyên</Typography>
          ) : (
            <Box sx={{ display: "grid", gap: 1.25, maxWidth: 720 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {data.title}
              </Typography>
              <Typography color="text.secondary">{data.description}</Typography>
              <Typography>
                <strong>Loại:</strong> {data.type}
              </Typography>
              <Typography>
                <strong>Bài học:</strong> {data.lessonTitle || data.lessonId}
              </Typography>
              <Typography>
                <strong>Khóa học:</strong> {data.courseTitle || "-"}
              </Typography>
              <Typography>
                <strong>URL:</strong> {data.fileUrl}
              </Typography>
              <Typography>
                <strong>Ngày tạo:</strong>{" "}
                {new Date(data.createdAt).toLocaleString("vi-VN")}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}

import { useParams, useNavigate } from "react-router-dom";
import { axiosClient } from "axiosClient";
import { ROUTES_API_LESSON_RESOURCE as LR } from "constants/routesApiKeys";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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

  return (
    <AdminLayout>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} size="small" sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Quản lý Tài nguyên Học Tập
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Chi tiết tài nguyên{data?.title ? `: ${data.title}` : ""}
          </Typography>
        </Box>
      </Box>
      <Card sx={{ boxShadow: 2 }}>
        <CardContent>
          {loading ? (
            <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : !data ? (
            <Typography>Không tìm thấy tài nguyên</Typography>
          ) : (
            <Box sx={{ display: "grid", gap: 1.25, maxWidth: 720 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {data.title}
              </Typography>
              <Typography color="text.secondary">{data.description}</Typography>
              <Typography>
                <strong>Loại:</strong> {data.type}
              </Typography>
              <Typography>
                <strong>Bài học:</strong> {data.lessonTitle || data.lessonId}
              </Typography>
              <Typography>
                <strong>Khóa học:</strong> {data.courseTitle || "-"}
              </Typography>
              <Typography>
                <strong>URL:</strong> {data.fileUrl}
              </Typography>
              <Typography>
                <strong>Ngày tạo:</strong>{" "}
                {new Date(data.createdAt).toLocaleString("vi-VN")}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
