import { useState, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  VerifiedUser as VerifiedIcon,
} from "@mui/icons-material";
import type { CertificateResult } from "common/@types/certificate";
import {
  CertificateStatus,
  CERTIFICATE_STATUS_LABELS,
  CERTIFICATE_STATUS_COLORS,
} from "common/enums/certificate.enum";
import { useCertificateTemplate } from "hooks/useCertificateTemplate";
import CertificateViewerDialog from "./CertificateViewerDialog";

interface CertificateCardProps {
  certificate: CertificateResult;
}

export default function CertificateCard({ certificate }: CertificateCardProps) {
  const [openViewer, setOpenViewer] = useState(false);
  const { template, isLoading: isTemplateLoading } = useCertificateTemplate(certificate.templateId);

  const isValid = certificate.status === CertificateStatus.ISSUED;

  // Generate certificate preview HTML
  const previewHTML = useMemo(() => {
    if (!template?.bodyHtml) return "";

    let html = template.bodyHtml;

    // Replace placeholders with actual data
    const replacements = {
      StudentName: certificate.studentFullname,
      CourseTitle: certificate.courseTitle,
      IssueDate: new Date(certificate.issuedAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      CertificateId: certificate.certificateNo,
      IssuerName: template.issuerName || "",
      IssuerTitle: template.issuerTitle || "",
    };

    Object.entries(replacements).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "gi");
      html = html.replace(regex, value);
    });

    return html;
  }, [template, certificate]);

  return (
    <>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          transition: "all 0.3s",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: 6,
          },
          opacity: isValid ? 1 : 0.7,
        }}
      >
        {/* Status Badge */}
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 1,
          }}
        >
          <Chip
            label={CERTIFICATE_STATUS_LABELS[certificate.status]}
            size="small"
            color={CERTIFICATE_STATUS_COLORS[certificate.status] as any}
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {/* Certificate Preview Thumbnail */}
        <Box
          sx={{
            height: 200,
            position: "relative",
            overflow: "hidden",
            bgcolor: template?.backgroundImageUrl ? "white" : "#5B6FBE",
            backgroundImage: template?.backgroundImageUrl
              ? `url(${template.backgroundImageUrl})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isTemplateLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircularProgress size={40} />
            </Box>
          ) : (
            <Box
              sx={{
                textAlign: "center",
                color: template?.backgroundImageUrl ? "inherit" : "white",
                zIndex: 1,
                px: 2,
                width: "100%",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  textShadow: template?.backgroundImageUrl ? "none" : "0 2px 4px rgba(0,0,0,0.2)",
                  mb: 1,
                  fontSize: "1.1rem",
                }}
              >
                CHỨNG CHỈ
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.95rem",
                  letterSpacing: 1,
                  opacity: 0.9,
                  mb: 1,
                }}
              >
                {certificate.certificateNo}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.75rem",
                  opacity: 0.8,
                  display: "block",
                  mt: 0.5,
                }}
              >
                {certificate.courseTitle}
              </Typography>
            </Box>
          )}

          {/* Decorative corners - only show when no background image */}
          {!template?.backgroundImageUrl && (
            <>
              <Box
                sx={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  width: 40,
                  height: 40,
                  border: "3px solid rgba(255,255,255,0.3)",
                  borderRadius: 1,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 12,
                  right: 12,
                  width: 40,
                  height: 40,
                  border: "3px solid rgba(255,255,255,0.3)",
                  borderRadius: 1,
                }}
              />
            </>
          )}
        </Box>

        {/* Content */}
        <CardContent sx={{ flexGrow: 1 }}>
          <Stack spacing={1.5}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: "1.1rem",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {certificate.courseTitle}
            </Typography>

            <Stack spacing={0.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  Ngày cấp:
                </Typography>
                <Typography variant="caption" fontWeight={500}>
                  {new Date(certificate.issuedAt).toLocaleDateString("vi-VN")}
                </Typography>
              </Stack>

              {certificate.expiresAt && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Hết hạn:
                  </Typography>
                  <Typography variant="caption" fontWeight={500}>
                    {new Date(certificate.expiresAt).toLocaleDateString(
                      "vi-VN"
                    )}
                  </Typography>
                </Stack>
              )}
            </Stack>

            {isValid && (
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                sx={{
                  mt: 1,
                  p: 1,
                  bgcolor: "success.lighter",
                  borderRadius: 1,
                }}
              >
                <VerifiedIcon sx={{ fontSize: 16, color: "success.main" }} />
                <Typography
                  variant="caption"
                  color="success.dark"
                  fontWeight={600}
                >
                  Chứng chỉ hợp lệ
                </Typography>
              </Stack>
            )}
          </Stack>
        </CardContent>

        {/* Actions */}
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<ViewIcon />}
            onClick={() => setOpenViewer(true)}
            disabled={!isValid}
          >
            Xem chứng chỉ
          </Button>
        </CardActions>
      </Card>

      {/* Viewer Dialog */}
      <CertificateViewerDialog
        open={openViewer}
        onClose={() => setOpenViewer(false)}
        certificate={certificate}
      />
    </>
  );
}
