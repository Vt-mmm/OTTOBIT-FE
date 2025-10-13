import { Box, Typography, Card, CardContent } from "@mui/material";
import {
  WorkspacePremium as CertificateIcon,
  Verified as VerifiedIcon,
  Share as ShareIcon,
} from "@mui/icons-material";
import { useLocales } from "../../../../hooks";
import { CourseResult } from "common/@types/course";

interface CourseCertificatePreviewSectionProps {
  course: CourseResult;
  isUserEnrolled: boolean;
}

export default function CourseCertificatePreviewSection({
  course,
  isUserEnrolled,
}: CourseCertificatePreviewSectionProps) {
  const { translate } = useLocales();

  return (
    <Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          mb: 4,
          color: "#1f1f1f",
          fontSize: { xs: "1.5rem", md: "1.75rem" },
        }}
      >
        {translate("courses.CertificatePreview")}
      </Typography>

      {/* Certificate Preview Card */}
      <Card
        sx={{
          border: "2px solid #e0e0e0",
          borderRadius: 3,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
            transform: "translateY(-2px)",
          },
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Certificate Icon */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <CertificateIcon
              sx={{
                fontSize: 80,
                color: "#FFB800",
              }}
            />
          </Box>

          {/* Certificate Title */}
          <Typography
            variant="h5"
            sx={{
              textAlign: "center",
              fontWeight: 600,
              mb: 2,
              color: "#1f1f1f",
            }}
          >
            {translate("courses.CertificateOfCompletion")}
          </Typography>

          {/* Course Title */}
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              mb: 3,
              color: "#5f6368",
              fontStyle: "italic",
            }}
          >
            "{course.title}"
          </Typography>

          {/* Features */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 4,
            }}
          >
            {/* Verified Certificate */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <VerifiedIcon sx={{ color: "#4CAF50", fontSize: 28 }} />
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, color: "#1f1f1f" }}
                >
                  {translate("courses.VerifiedCertificate")}
                </Typography>
                <Typography variant="body2" sx={{ color: "#5f6368" }}>
                  {translate("courses.VerifiedCertificateDesc")}
                </Typography>
              </Box>
            </Box>

            {/* Shareable on LinkedIn */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <ShareIcon sx={{ color: "#0077B5", fontSize: 28 }} />
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, color: "#1f1f1f" }}
                >
                  {translate("courses.ShareableOnLinkedIn")}
                </Typography>
                <Typography variant="body2" sx={{ color: "#5f6368" }}>
                  {translate("courses.ShareableOnLinkedInDesc")}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Enrollment Status */}
          {!isUserEnrolled && (
            <Box
              sx={{
                mt: 4,
                p: 3,
                bgcolor: "#FFF9E6",
                borderRadius: 2,
                border: "1px solid #FFE082",
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "#F57C00", fontWeight: 500 }}
              >
                💡 {translate("courses.CertificateRequirement")}
              </Typography>
            </Box>
          )}

          {isUserEnrolled && (
            <Box
              sx={{
                mt: 4,
                p: 3,
                bgcolor: "#E8F5E9",
                borderRadius: 2,
                border: "1px solid #A5D6A7",
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "#2E7D32", fontWeight: 500 }}
              >
                ✅ {translate("courses.CertificateProgress")}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Box sx={{ mt: 4 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, mb: 2, color: "#1f1f1f" }}
        >
          {translate("courses.AboutCertificate")}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: "#5f6368", lineHeight: 1.7 }}>
            • {translate("courses.CertificateInfo1")}
          </Typography>
          <Typography variant="body2" sx={{ color: "#5f6368", lineHeight: 1.7 }}>
            • {translate("courses.CertificateInfo2")}
          </Typography>
          <Typography variant="body2" sx={{ color: "#5f6368", lineHeight: 1.7 }}>
            • {translate("courses.CertificateInfo3")}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
