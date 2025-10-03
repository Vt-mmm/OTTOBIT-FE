import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Typography,
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
import CertificateViewerDialog from "./CertificateViewerDialog";

interface CertificateCardProps {
  certificate: CertificateResult;
}

export default function CertificateCard({ certificate }: CertificateCardProps) {
  const [openViewer, setOpenViewer] = useState(false);

  const isValid = certificate.status === CertificateStatus.ISSUED;

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

        {/* Thumbnail */}
        <Box
          sx={{
            height: 200,
            bgcolor: "primary.lighter",
            backgroundImage:
              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              textAlign: "center",
              color: "white",
              zIndex: 1,
              px: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                mb: 1,
              }}
            >
              CHỨNG CHỈ
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "monospace",
                fontSize: "1.1rem",
                letterSpacing: 1,
                opacity: 0.9,
              }}
            >
              {certificate.certificateNo}
            </Typography>
          </Box>

          {/* Decorative Pattern */}
          <Box
            sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 150,
              height: 150,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.1)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -30,
              left: -30,
              width: 100,
              height: 100,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.1)",
            }}
          />
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
