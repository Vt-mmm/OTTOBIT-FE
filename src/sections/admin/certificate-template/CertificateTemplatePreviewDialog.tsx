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
  // Sample data for preview
  const sampleData = {
    studentName: "Nguyễn Văn A",
    courseName: template.courseTitle,
    issueDate: new Date().toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    certificateNo: "CERT-2025-001",
  };

  // Replace placeholders in HTML
  const renderPreviewHTML = () => {
    let html = template.bodyHtml;

    // Replace placeholders
    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      html = html.replace(regex, value);
    });

    return html;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h6">Xem trước mẫu chứng chỉ</Typography>
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
                  Khóa học:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {template.courseTitle}
                </Typography>
              </Stack>
              {template.issuerName && (
                <Stack direction="row" spacing={1}>
                  <Typography variant="body2" fontWeight={600}>
                    Người ký:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {template.issuerName}
                    {template.issuerTitle && ` - ${template.issuerTitle}`}
                  </Typography>
                </Stack>
              )}
              <Typography variant="caption" color="warning.main" sx={{ mt: 1 }}>
                ⚠️ Đây là bản xem trước với dữ liệu mẫu
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
            {/* Certificate Content */}
            <Box
              sx={{
                p: 4,
                minHeight: 500,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              {/* Body HTML */}
              <Box
                dangerouslySetInnerHTML={{ __html: renderPreviewHTML() }}
                sx={{
                  flex: 1,
                  "& h1": { fontSize: "2.5rem", margin: "20px 0" },
                  "& h2": { fontSize: "2rem", margin: "15px 0" },
                  "& h3": { fontSize: "1.5rem", margin: "10px 0" },
                  "& p": { margin: "10px 0" },
                  "& code": {
                    bgcolor: "grey.200",
                    px: 1,
                    py: 0.5,
                    borderRadius: 0.5,
                    fontFamily: "monospace",
                  },
                }}
              />

              {/* Signature Section */}
              {(template.signatureImageUrl || template.issuerName) && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    mt: 4,
                    pt: 3,
                    borderTop: "2px solid",
                    borderColor: "divider",
                  }}
                >
                  {template.signatureImageUrl && (
                    <Box
                      component="img"
                      src={template.signatureImageUrl}
                      alt="Signature"
                      sx={{
                        maxWidth: 200,
                        maxHeight: 100,
                        mb: 2,
                        objectFit: "contain",
                      }}
                    />
                  )}
                  {template.issuerName && (
                    <Stack spacing={0.5} alignItems="center">
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                      >
                        {template.issuerName}
                      </Typography>
                      {template.issuerTitle && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontStyle: "italic" }}
                        >
                          {template.issuerTitle}
                        </Typography>
                      )}
                    </Stack>
                  )}
                </Box>
              )}
            </Box>
          </Paper>

          {/* Placeholder Guide */}
          <Paper
            variant="outlined"
            sx={{ p: 2, bgcolor: "info.lighter", borderRadius: 2 }}
          >
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              📌 Placeholders đã được thay thế:
            </Typography>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                • <code>{"{{studentName}}"}</code> → {sampleData.studentName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <code>{"{{courseName}}"}</code> → {sampleData.courseName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <code>{"{{issueDate}}"}</code> → {sampleData.issueDate}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <code>{"{{certificateNo}}"}</code> →{" "}
                {sampleData.certificateNo}
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
