/**
 * Defeat Modal Component
 * Hiển thị thông báo thua với animation và thông tin lỗi
 */

import React from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Alert,
  Divider,
  Fade,
  Slide,
} from "@mui/material";
import {
  Close,
  SentimentVeryDissatisfied,
  HomeOutlined,
  ErrorOutline,
  RestartAlt,
} from "@mui/icons-material";
import { TransitionProps } from "@mui/material/transitions";
import { ErrorData } from "../types/phaser";

interface DefeatModalProps {
  open: boolean;
  onClose: () => void;
  defeatData: ErrorData | null;
  onReplay?: () => void;
  onGoHome?: () => void;
}

// Transition component for the modal
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Shake animation for defeat
const defeatAnimation = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
    20%, 40%, 60%, 80% { transform: translateX(4px); }
  }
  
  @keyframes fadeInError {
    0% {
      transform: scale(0.8) rotate(-5deg);
      opacity: 0;
    }
    50% {
      transform: scale(1.1) rotate(2deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }
  
  @keyframes pulse-red {
    0%, 100% {
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
    }
    50% {
      box-shadow: 0 0 30px rgba(239, 68, 68, 0.6);
    }
  }
`;

export default function DefeatModal({
  open,
  onClose,
  defeatData,
  onReplay,
  onGoHome,
}: DefeatModalProps) {
  if (!defeatData) return null;

  // Safe data extraction with fallbacks
  const errorMessage = defeatData.message || "Đã xảy ra lỗi!";
  const errorType = defeatData.type || "PROGRAM_ERROR";
  const errorDetails = defeatData.details || null;
  const errorStep = defeatData.step || null;

  // Get error icon and color based on type
  const getErrorConfig = (type: string) => {
    switch (type) {
      case "PROGRAM_ERROR":
        return {
          icon: ErrorOutline,
          color: "#ef4444",
          title: "Lỗi chương trình",
        };
      case "MAP_ERROR":
        return { icon: ErrorOutline, color: "#f97316", title: "Lỗi bản đồ" };
      case "VALIDATION_ERROR":
        return { icon: ErrorOutline, color: "#eab308", title: "Lỗi xác thực" };
      default:
        return { icon: ErrorOutline, color: "#ef4444", title: "Lỗi hệ thống" };
    }
  };

  const errorConfig = getErrorConfig(errorType);
  const ErrorIcon = errorConfig.icon;

  return (
    <>
      <style>{defeatAnimation}</style>
      <Dialog
        open={open}
        onClose={onClose}
        TransitionComponent={Transition}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "24px",
            overflow: "hidden",
            position: "relative",
            background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
            animation: "fadeInError 0.6s ease-out, shake 0.6s ease-out",
            border: "2px solid #fecaca",
          },
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            zIndex: 10,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 1)",
            },
          }}
        >
          <Close />
        </IconButton>

        <DialogContent sx={{ p: 4, position: "relative", zIndex: 1 }}>
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${errorConfig.color} 0%, ${errorConfig.color}dd 100%)`,
                mb: 3,
                animation: "pulse-red 2s ease-in-out infinite",
              }}
            >
              <SentimentVeryDissatisfied
                sx={{ fontSize: 48, color: "white" }}
              />
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                mb: 2,
              }}
            >
              💥 Thất bại!
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: "#7f1d1d",
                fontWeight: 500,
              }}
            >
              Nhiệm vụ chưa hoàn thành
            </Typography>
          </Box>

          {/* Error Information */}
          <Box sx={{ mb: 4 }}>
            <Alert
              severity="error"
              icon={<ErrorIcon />}
              sx={{
                mb: 2,
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: "12px",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                {errorConfig.title}
              </Typography>
              <Typography variant="body2">{errorMessage}</Typography>
            </Alert>

            {/* Step Information */}
            {errorStep !== null && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  borderRadius: "12px",
                  backgroundColor: "rgba(251, 146, 60, 0.1)",
                  border: "1px solid rgba(251, 146, 60, 0.2)",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    backgroundColor: "#fb923c",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                >
                  {errorStep}
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "#ea580c" }}
                  >
                    Lỗi tại bước {errorStep}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#9a3412" }}>
                    Chương trình dừng lại tại bước này
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Details */}
            {errorDetails && (
              <Fade in={open} timeout={1000}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: "monospace", color: "#374151" }}
                  >
                    {typeof errorDetails === "string"
                      ? errorDetails
                      : JSON.stringify(errorDetails, null, 2)}
                  </Typography>
                </Box>
              </Fade>
            )}
          </Box>

          {/* Suggestions */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: "#7f1d1d",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              💡 Gợi ý khắc phục
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body2" sx={{ color: "#991b1b" }}>
                • Kiểm tra lại logic chương trình của bạn
              </Typography>
              <Typography variant="body2" sx={{ color: "#991b1b" }}>
                • Đảm bảo robot di chuyển đúng hướng
              </Typography>
              <Typography variant="body2" sx={{ color: "#991b1b" }}>
                • Xác nhận có đủ pin tại các vị trí cần thu thập
              </Typography>
              {errorStep && (
                <Typography variant="body2" sx={{ color: "#991b1b" }}>
                  • Tập trung vào bước {errorStep} có vấn đề
                </Typography>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 3, borderColor: "rgba(239, 68, 68, 0.2)" }} />

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {onReplay && (
              <Button
                variant="contained"
                size="large"
                startIcon={<RestartAlt />}
                onClick={onReplay}
                sx={{
                  py: 1.5,
                  px: 4,
                  background:
                    "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1rem",
                  boxShadow: "0 4px 16px rgba(220, 38, 38, 0.3)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(220, 38, 38, 0.4)",
                  },
                }}
              >
                Thử lại
              </Button>
            )}

            {onGoHome && (
              <Button
                variant="text"
                size="large"
                startIcon={<HomeOutlined />}
                onClick={onGoHome}
                sx={{
                  py: 1.5,
                  px: 3,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: "#6b7280",
                  "&:hover": {
                    backgroundColor: "#f3f4f6",
                  },
                }}
              >
                Trang chủ
              </Button>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
