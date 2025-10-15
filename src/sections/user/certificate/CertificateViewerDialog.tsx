import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material";
import type { CertificateResult } from "common/@types/certificate";
import { toast } from "react-toastify";
import { useLocales } from "../../../hooks";
import { useCertificateTemplate } from "hooks/useCertificateTemplate";

interface CertificateViewerDialogProps {
  open: boolean;
  onClose: () => void;
  certificate: CertificateResult;
}

export default function CertificateViewerDialog({
  open,
  onClose,
  certificate,
}: CertificateViewerDialogProps) {
  const { translate } = useLocales();
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch template from backend
  const { template, isLoading: isTemplateLoading, error: templateError } = useCertificateTemplate(certificate.templateId);

  // Replace placeholders in template HTML
  const renderCertificateHTML = () => {
    if (!template?.bodyHtml) return "";

    let html = template.bodyHtml;

    // Replace placeholders with actual certificate data
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
      SignatureImageUrl: template.signatureImageUrl || "",
    };

    // Replace all placeholders (case-insensitive)
    Object.entries(replacements).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "gi");
      html = html.replace(regex, value);
    });

    // Remove img tag if no signature URL (avoid broken image)
    if (!template.signatureImageUrl) {
      html = html.replace(
        /<img[^>]*src="{{SignatureImageUrl}}"[^>]*\/?>/gi,
        ""
      );
      // Also remove empty img tags after replacement
      html = html.replace(/<img[^>]*src=""[^>]*\/?>/gi, "");
    }

    return html;
  };

  // Copy verification code
  const handleCopyVerificationCode = () => {
    navigator.clipboard.writeText(certificate.verificationCode);
    toast.success(translate("certificates.VerificationCodeCopied"));
  };

  // Download PDF (placeholder - team can implement with html2canvas + jsPDF)
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      // TODO: Implement PDF download using html2canvas + jsPDF
      // const element = certificateRef.current;
      // const canvas = await html2canvas(element);
      // const imgData = canvas.toDataURL('image/png');
      // const pdf = new jsPDF('landscape', 'mm', 'a4');
      // pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
      // pdf.save(`Certificate-${certificate.certificateNo}.pdf`);

      toast.info(translate("certificates.PDFFeatureDevelopment"));
    } catch (error) {
      toast.error(translate("certificates.DownloadError"));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: "80vh" },
      }}
    >
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">
            {translate("certificates.YourCertificate")}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Info Alert */}
          <Alert severity="info">
            <Typography variant="body2">
              <span
                dangerouslySetInnerHTML={{
                  __html: translate("certificates.InfoNote"),
                }}
              />
            </Typography>
          </Alert>

          {/* Loading State */}
          {isTemplateLoading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 500,
              }}
            >
              <Stack spacing={2} alignItems="center">
                <CircularProgress size={60} />
                <Typography variant="body1" color="text.secondary">
                  {translate("certificates.LoadingTemplate")}
                </Typography>
              </Stack>
            </Box>
          )}

          {/* Error State */}
          {templateError && (
            <Alert severity="error">
              <Typography variant="body2">
                {translate("certificates.TemplateLoadError")}: {templateError}
              </Typography>
            </Alert>
          )}

          {/* Certificate Preview with Template */}
          {!isTemplateLoading && !templateError && template && (
            <Paper
              elevation={4}
              sx={{
                position: "relative",
                minHeight: 500,
                bgcolor: "white",
                backgroundImage: template.backgroundImageUrl
                  ? `url(${template.backgroundImageUrl})`
                  : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                border: "2px solid",
                borderColor: "divider",
                overflow: "hidden",
                borderRadius: 2,
              }}
            >
              {/* Certificate Body HTML - HTML từ BE đã có signature bên trong */}
              <Box
                dangerouslySetInnerHTML={{ __html: renderCertificateHTML() }}
                sx={{
                  "& h1": { fontSize: "2.5rem", margin: "20px 0" },
                  "& h2": { fontSize: "2rem", margin: "15px 0" },
                  "& h3": { fontSize: "1.5rem", margin: "10px 0" },
                  "& p": { margin: "10px 0" },
                  "& img": {
                    maxWidth: "100%",
                    height: "auto",
                    display: "block",
                    margin: "0 auto",
                  },
                  // Hide broken images
                  "& img[src='']": {
                    display: "none",
                  },
                  "& code": {
                    bgcolor: "grey.200",
                    px: 1,
                    py: 0.5,
                    borderRadius: 0.5,
                    fontFamily: "monospace",
                  },
                }}
              />
            </Paper>
          )}

          {/* Verification Code */}
          <Paper
            variant="outlined"
            sx={{ p: 3, bgcolor: "grey.50", borderRadius: 2 }}
          >
            <Stack spacing={2}>
              <Typography variant="subtitle2" fontWeight={600}>
                {translate("certificates.VerificationCode")}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    flex: 1,
                    p: 2,
                    bgcolor: "white",
                    borderRadius: 1,
                    border: "2px dashed",
                    borderColor: "divider",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "monospace",
                      letterSpacing: 3,
                      fontWeight: 600,
                    }}
                  >
                    {certificate.verificationCode}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<CopyIcon />}
                  onClick={handleCopyVerificationCode}
                >
                  {translate("certificates.CopyVerificationCode")}
                </Button>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {translate("certificates.UseCodeToVerify")}
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} size="large">
          {translate("certificates.Close")}
        </Button>
        <Button
          variant="contained"
          startIcon={
            isDownloading ? <CircularProgress size={16} /> : <DownloadIcon />
          }
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          size="large"
        >
          {isDownloading
            ? translate("certificates.Downloading")
            : translate("certificates.DownloadPDF")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
