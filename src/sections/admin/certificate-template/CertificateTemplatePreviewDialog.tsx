import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { CertificateTemplateResult } from "common/@types/certificateTemplate";
import useLocales from "hooks/useLocales";

interface CertificateTemplatePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  template: CertificateTemplateResult;
}

export default function CertificateTemplatePreviewDialog({
  open,
  onClose,
  template,
}: CertificateTemplatePreviewDialogProps) {
  const { translate } = useLocales();

  // Sample data for preview
  const sampleData = {
    StudentName: "Nguyễn Văn A",
    CourseTitle: template.courseTitle,
    IssueDate: new Date().toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    CertificateId: "CERT-2025-001",
    IssuerName: template.issuerName || "",
    IssuerTitle: template.issuerTitle || "",
    SignatureImageUrl: template.signatureImageUrl || "",
  };

  // Replace placeholders in HTML
  const renderPreviewHTML = () => {
    let html = template.bodyHtml;

    // Replace placeholders (case-insensitive)
    Object.entries(sampleData).forEach(([key, value]) => {
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h6">
            {translate("admin.certificateTemplate.previewTitle")}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              px: 2,
              py: 0.5,
              bgcolor: "grey.100",
              borderRadius: 1,
              fontWeight: 500,
            }}
          >
            {template.name}
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {/* Template Info */}
          <Paper
            variant="outlined"
            sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}
          >
            <Stack spacing={1}>
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" fontWeight={600}>
                  {translate("admin.certificateTemplate.course")}:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {template.courseTitle}
                </Typography>
              </Stack>
              {template.issuerName && (
                <Stack direction="row" spacing={1}>
                  <Typography variant="body2" fontWeight={600}>
                    {translate("admin.certificateTemplate.issuerName")}:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {template.issuerName}
                    {template.issuerTitle && ` - ${template.issuerTitle}`}
                  </Typography>
                </Stack>
              )}
              <Typography variant="caption" color="warning.main" sx={{ mt: 1 }}>
                ⚠️ {translate("admin.certificateTemplate.previewWarning")}
              </Typography>
            </Stack>
          </Paper>

          {/* Certificate Preview */}
          <Paper
            elevation={3}
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
            }}
          >
            {/* Certificate Content - HTML từ BE đã có signature bên trong */}
            <Box
              dangerouslySetInnerHTML={{ __html: renderPreviewHTML() }}
              sx={{
                p: 4,
                minHeight: 500,
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

          {/* Placeholder Guide */}
          <Paper
            variant="outlined"
            sx={{ p: 2, bgcolor: "info.lighter", borderRadius: 2 }}
          >
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              📌 {translate("admin.certificateTemplate.placeholdersReplaced")}
            </Typography>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                • <code>{"{{StudentName}}"}</code> → {sampleData.StudentName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <code>{"{{CourseTitle}}"}</code> → {sampleData.CourseTitle}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <code>{"{{IssueDate}}"}</code> → {sampleData.IssueDate}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <code>{"{{CertificateId}}"}</code> → {sampleData.CertificateId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <code>{"{{SignatureImageUrl}}"}</code> → {sampleData.SignatureImageUrl ? "(Hình chữ ký)" : "(Không có)"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <code>{"{{IssuerName}}"}</code> → {sampleData.IssuerName || "(Không có)"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <code>{"{{IssuerTitle}}"}</code> → {sampleData.IssuerTitle || "(Không có)"}
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained">
          {translate("common.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
