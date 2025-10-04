import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Grid,
  Paper,
  Skeleton,
  Typography,
} from "@mui/material";
import { EmojiEvents as TrophyIcon } from "@mui/icons-material";
import { AppDispatch } from "store/config";
import { getMyCertificatesThunk } from "store/certificate/certificateThunks";
import CertificateCard from "sections/user/certificate/CertificateCard";

interface MyCertificatesTabProps {
  loading?: boolean;
}

export default function MyCertificatesTab({
  loading: externalLoading,
}: MyCertificatesTabProps) {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const { myCertificates } = useSelector((state: any) => state.certificate);

  // Load data
  useEffect(() => {
    dispatch(getMyCertificatesThunk({ page: 1, size: 100 }));
  }, [dispatch]);

  const certificatesData = myCertificates.data?.items || [];
  const isLoading = myCertificates.isLoading || externalLoading;

  if (isLoading) {
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="text" width={300} />
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
          Chứng chỉ của tôi
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Danh sách chứng chỉ bạn đã đạt được từ các khóa học
        </Typography>
      </Box>

      {/* Content */}
      {certificatesData.length === 0 ? (
        <Paper
          sx={{
            p: 8,
            textAlign: "center",
            bgcolor: "grey.50",
            borderRadius: 3,
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          <TrophyIcon sx={{ fontSize: 80, color: "text.disabled", mb: 3 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Chưa có chứng chỉ nào
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hoàn thành các khóa học để nhận chứng chỉ
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {certificatesData.map((cert: any) => (
            <Grid item xs={12} sm={6} md={4} key={cert.id}>
              <CertificateCard certificate={cert} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
