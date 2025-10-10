import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Rating,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Lock as LockIcon,
  CardMembership as CertificateIcon,
} from "@mui/icons-material";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_ENROLLMENT } from "constants/routesApiKeys";
import { useLocales } from "hooks";
import { useAppDispatch, useAppSelector } from "store/config";
import { getMyCertificatesThunk } from "store/certificate/certificateThunks";

interface CourseCertificatesSectionProps {
  course: {
    id: string;
    title: string;
  };
  lessons: any[];
  isUserEnrolled: boolean;
  isEnrolling: boolean;
  onEnrollCourse: () => void;
  courseRating: number;
  totalRatings: number;
}

export default function CourseCertificatesSection({
  course,
  lessons,
  isUserEnrolled,
  isEnrolling,
  onEnrollCourse,
  courseRating,
  totalRatings,
}: CourseCertificatesSectionProps) {
  const { translate } = useLocales();
  const dispatch = useAppDispatch();
  const { myCertificates } = useAppSelector((state) => state.certificate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courseCompleted, setCourseCompleted] = useState(false);

  // Load certificates when user is enrolled
  useEffect(() => {
    if (!isUserEnrolled) return;

    const loadCertificates = async () => {
      setLoading(true);
      setError(null);
      try {
        // Check if course is completed by checking enrollment status
        const enrollmentRes = await axiosClient.get(
          `${ROUTES_API_ENROLLMENT.MY_ENROLLMENTS}`,
          { params: { courseId: course.id, pageSize: 1 } }
        );

        const enrollment = enrollmentRes.data?.data?.items?.[0];
        const isCompleted = enrollment?.isCompleted || false;
        setCourseCompleted(isCompleted);

        // ✅ Fetch real certificates from API
        if (isCompleted) {
          const certificateResult = await dispatch(
            getMyCertificatesThunk({
              courseId: course.id,
              page: 1,
              size: 10,
            })
          ).unwrap();
          
          console.log('🎓 Certificate API Response:', certificateResult);
          console.log('📋 Course completed but certificates:', certificateResult?.items?.length || 0);
        }
      } catch (err: any) {
        setError(err?.message || translate("courses.CannotLoadCertificate"));
      } finally {
        setLoading(false);
      }
    };

    loadCertificates();
  }, [isUserEnrolled, course.id, dispatch]);

  // Get certificate data from Redux
  const certificates = myCertificates.data?.items || [];
  const hasCertificate = certificates.length > 0;
  const firstCertificate = certificates[0];

  // Handle view certificate
  const handleViewCertificate = () => {
    if (!hasCertificate) {
      setError("Chứng chỉ chưa được cấp. Vui lòng hoàn thành khóa học.");
      return;
    }
    // TODO: Open certificate viewer dialog or navigate to certificate page
    // For now, show certificate info
    alert(
      `Chứng chỉ: ${firstCertificate.certificateNo}\n` +
        `Mã xác thực: ${firstCertificate.verificationCode}\n` +
        `Ngày cấp: ${new Date(firstCertificate.issuedAt).toLocaleDateString("vi-VN")}`
    );
  };

  if (loading || myCertificates.isLoading) {
    return (
      <Box
        sx={{
          bgcolor: "white",
          p: 3,
          border: "1px solid #e0e0e0",
          borderRadius: 1,
          textAlign: "center",
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {translate("courses.LoadingCertificate")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "white",
        p: { xs: 2, sm: 2.5, md: 3 },
        border: "1px solid #e0e0e0",
        borderRadius: { xs: 0, sm: 1 },
        maxWidth: "100%",
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{
          fontWeight: 600,
          mb: 3,
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
        }}
      >
        {translate("courses.CertificateReceived")}
      </Typography>

      {(error || myCertificates.error) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || myCertificates.error}
        </Alert>
      )}

      {/* Certificate List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Main Course Completion Certificate */}
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            p: { xs: 2, sm: 2.5, md: 3 },
            border: courseCompleted ? "2px solid #4caf50" : "1px solid #e0e0e0",
            borderRadius: 1,
            bgcolor: courseCompleted ? "#f1f8f4" : "white",
            position: "relative",
            opacity: !isUserEnrolled ? 0.7 : 1,
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Box
            sx={{
              mr: { xs: 0, sm: 3 },
              flexShrink: 0,
              alignSelf: { xs: "center", sm: "flex-start" },
            }}
          >
            <Box
              sx={{
                width: { xs: 56, sm: 60 },
                height: { xs: 56, sm: 60 },
                borderRadius: "50%",
                bgcolor: "#f0f7ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #4caf50",
              }}
            >
              <Box
                component="img"
                src="/asset/LogoOttobit.png"
                alt="Certificate"
                sx={{
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  objectFit: "contain",
                }}
              />
            </Box>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0, width: { xs: "100%", sm: "auto" } }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: "#333",
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              Chứng chỉ hoàn thành - {course.title}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1, sm: 2 },
                mb: 1,
                flexWrap: "wrap",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Khóa học 1
              </Typography>
              <Typography variant="body2" color="text.secondary">
                •
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.ceil((lessons.length * 45) / 60)} giờ
              </Typography>
              <Typography variant="body2" color="text.secondary">
                •
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Rating
                  value={courseRating}
                  readOnly
                  size="small"
                  precision={0.1}
                />
                <Typography variant="body2" color="text.secondary">
                  {courseRating} ({totalRatings} đánh giá)
                </Typography>
              </Box>
            </Box>

            <Button
              variant="text"
              size="small"
              onClick={handleViewCertificate}
              disabled={!hasCertificate}
              sx={{
                color: hasCertificate ? "#1976d2" : "text.disabled",
                textTransform: "none",
                p: 0,
                minWidth: "auto",
                "&:hover": {
                  bgcolor: "transparent",
                  textDecoration: hasCertificate ? "underline" : "none",
                },
                cursor: hasCertificate ? "pointer" : "not-allowed",
              }}
            >
              {hasCertificate
                ? translate("courses.ViewCertificate")
                : "Chưa có chứng chỉ"}
            </Button>
          </Box>

          <Box sx={{ ml: 2 }}>
            {courseCompleted ? (
              <Button
                variant="contained"
                size="small"
                color="success"
                startIcon={<CertificateIcon />}
                sx={{
                  textTransform: "none",
                  minWidth: 120,
                }}
              >
                {translate("courses.Completed")}
              </Button>
            ) : isUserEnrolled ? (
              <Button
                variant="outlined"
                size="small"
                color="primary"
                sx={{
                  textTransform: "none",
                  minWidth: 100,
                }}
              >
                {translate("courses.Learning")}
              </Button>
            ) : (
              <Button
                variant="outlined"
                size="small"
                onClick={onEnrollCourse}
                disabled={isEnrolling}
                sx={{
                  textTransform: "none",
                  minWidth: 100,
                }}
              >
                {translate("courses.Start")}
              </Button>
            )}
          </Box>

          {!isUserEnrolled && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: "rgba(255, 255, 255, 0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1,
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <LockIcon
                  sx={{ fontSize: 24, color: "text.secondary", mb: 1 }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Tham gia để mở khóa
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Info box for not enrolled users */}
        {!isUserEnrolled && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <span
                dangerouslySetInnerHTML={{
                  __html: translate("courses.CertificateNote"),
                }}
              />
            </Typography>
          </Alert>
        )}

        {/* Info box for enrolled but not completed */}
        {isUserEnrolled && !courseCompleted && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Tiến độ:</strong> Hoàn thành tất cả {lessons.length} bài
              học để nhận chứng chỉ hoàn thành khóa học.
            </Typography>
          </Alert>
        )}

        {/* Success message when completed and has certificate */}
        {courseCompleted && hasCertificate && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              🎉 {translate("courses.Congratulations")} Bạn đã nhận được chứng
              chỉ:
              <strong> {firstCertificate?.certificateNo}</strong>
            </Typography>
          </Alert>
        )}

        {/* Warning when completed but no certificate yet */}
        {courseCompleted && !hasCertificate && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Chứng chỉ đang được xử lý. Vui lòng quay lại sau ít phút.
            </Typography>
          </Alert>
        )}

        {/* Remove hardcoded certificates - will be added back when API is ready */}
        {/* Skills Specialization Certificate */}
        {/* <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            p: 3, 
            border: "1px solid #e0e0e0", 
            borderRadius: 1,
            bgcolor: "white",
            position: "relative",
            opacity: !isUserEnrolled ? 0.7 : 1
          }}
        >
          <Box sx={{ mr: 3, flexShrink: 0 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                bgcolor: "#f0f7ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #2196f3"
              }}
            >
              <Box
                component="img"
                src="/OttoDIY/code-photo-2.png"
                alt="Specialization"
                sx={{
                  width: 36,
                  height: 36,
                  objectFit: "contain"
                }}
              />
            </Box>
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "#333" }}>
              Chuyên môn Lập trình Robot và STEM
            </Typography>
            
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Chuyên môn 1
              </Typography>
              <Typography variant="body2" color="text.secondary">
                •
              </Typography>
              <Typography variant="body2" color="text.secondary">
                6-8 giờ
              </Typography>
              <Typography variant="body2" color="text.secondary">
                •
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Rating value={4.5} readOnly size="small" precision={0.1} />
                <Typography variant="body2" color="text.secondary">
                  4.5 (890 đánh giá)
                </Typography>
              </Box>
            </Box>
            
            <Button 
              variant="text" 
              size="small" 
              sx={{ 
                color: "#1976d2", 
                textTransform: "none", 
                p: 0, 
                minWidth: "auto",
                "&:hover": { bgcolor: "transparent", textDecoration: "underline" }
              }}
            >
              Xem chuyên môn
            </Button>
          </Box>
          
          <Box sx={{ ml: 2 }}>
            <Button 
              variant="outlined"
              size="small"
              disabled={!isUserEnrolled}
              sx={{
                textTransform: "none",
                minWidth: 100
              }}
            >
              {isUserEnrolled ? "Tiếp tục" : "Khóa"}
            </Button>
          </Box>
          
          {!isUserEnrolled && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: "rgba(255, 255, 255, 0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <LockIcon sx={{ fontSize: 24, color: "text.secondary", mb: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Hoàn thành khóa học trước
                </Typography>
              </Box>
            </Box>
          )}
        </Box> */}

        {/* Professional Certificate - Commented out until API ready */}
        {/* <Box
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            p: 3, 
            border: "1px solid #e0e0e0", 
            borderRadius: 1,
            bgcolor: "white",
            position: "relative",
            opacity: 0.7
          }}
        >
          <Box sx={{ mr: 3, flexShrink: 0 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                bgcolor: "#fff3e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #ff9800"
              }}
            >
              <Box
                component="img"
                src="/OttoDIY/create-photo-2.png"
                alt="Professional Certificate"
                sx={{
                  width: 36,
                  height: 36,
                  objectFit: "contain"
                }}
              />
            </Box>
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "#333" }}>
              Chứng chỉ Chuyên gia Robot và IoT
            </Typography>
            
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Chứng chỉ chuyên nghiệp
              </Typography>
              <Typography variant="body2" color="text.secondary">
                •
              </Typography>
              <Typography variant="body2" color="text.secondary">
                15-20 giờ
              </Typography>
              <Typography variant="body2" color="text.secondary">
                •
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Rating value={4.8} readOnly size="small" precision={0.1} />
                <Typography variant="body2" color="text.secondary">
                  4.8 (1.2k đánh giá)
                </Typography>
              </Box>
            </Box>
            
            <Button 
              variant="text" 
              size="small" 
              sx={{ 
                color: "#1976d2", 
                textTransform: "none", 
                p: 0, 
                minWidth: "auto",
                "&:hover": { bgcolor: "transparent", textDecoration: "underline" }
              }}
            >
              Xem chứng chỉ
            </Button>
          </Box>
          
          <Box sx={{ ml: 2 }}>
            <Button 
              variant="outlined"
              size="small"
              disabled
              sx={{
                textTransform: "none",
                minWidth: 100
              }}
            >
              Khóa
            </Button>
          </Box>
          
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: "rgba(255, 255, 255, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 1
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <LockIcon sx={{ fontSize: 24, color: "text.secondary", mb: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Cần hoàn thành chuyên môn
              </Typography>
            </Box>
          </Box>
        </Box> */}
      </Box>
    </Box>
  );
}
