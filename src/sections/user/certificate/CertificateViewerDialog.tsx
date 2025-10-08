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

          {/* Certificate Preview */}
          <Paper
            elevation={4}
            sx={{
              position: "relative",
              minHeight: 500,
              backgroundImage:
                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              p: 6,
              borderRadius: 2,
            }}
          >
            {/* Certificate Content */}
            <Box sx={{ textAlign: "center", maxWidth: 800 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  textShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                {translate("certificates.CompletionCertificate")}
              </Typography>

              <Typography
                variant="h6"
                sx={{ mb: 2, opacity: 0.9, fontWeight: 300 }}
              >
                {translate("certificates.CertifyThat")}
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  textShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                {certificate.studentFullname}
              </Typography>

              <Typography
                variant="h6"
                sx={{ mb: 2, opacity: 0.9, fontWeight: 300 }}
              >
                {translate("certificates.HasCompleted")}
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 4,
                  textShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                {certificate.courseTitle}
              </Typography>

              <Box
                sx={{
                  display: "inline-block",
                  px: 4,
                  py: 2,
                  bgcolor: "rgba(255,255,255,0.2)",
                  borderRadius: 2,
                  backdropFilter: "blur(10px)",
                }}
              >
                <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                  {translate("certificates.IssuedOn")}:{" "}
                  {new Date(certificate.issuedAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontFamily: "monospace", letterSpacing: 2 }}
                >
                  {certificate.certificateNo}
                </Typography>
              </Box>
            </Box>

            {/* Decorative Elements */}
            <Box
              sx={{
                position: "absolute",
                top: 20,
                left: 20,
                width: 80,
                height: 80,
                border: "3px solid rgba(255,255,255,0.3)",
                borderRadius: 2,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: 20,
                right: 20,
                width: 80,
                height: 80,
                border: "3px solid rgba(255,255,255,0.3)",
                borderRadius: 2,
              }}
            />
          </Paper>

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
