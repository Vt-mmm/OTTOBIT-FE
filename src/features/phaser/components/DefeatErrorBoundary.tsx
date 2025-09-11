/**
 * Defeat Error Boundary Component
 * Catches errors in DefeatModal and displays fallback UI
 */

import React from "react";
import {
  Dialog,
  DialogContent,
  Alert,
  AlertTitle,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { RestartAlt, HomeOutlined } from "@mui/icons-material";

interface DefeatErrorBoundaryProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onReplay?: () => void;
}

interface DefeatErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class DefeatErrorBoundary extends React.Component<
  DefeatErrorBoundaryProps,
  DefeatErrorBoundaryState
> {
  constructor(props: DefeatErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): DefeatErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error(
      "💥 DefeatModal Error Boundary caught an error:",
      error,
      errorInfo
    );
  }

  componentDidUpdate(prevProps: DefeatErrorBoundaryProps) {
    // Reset error state when modal closes
    if (prevProps.isOpen && !this.props.isOpen && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI for DefeatModal errors
      return (
        <Dialog
          open={this.props.isOpen}
          onClose={this.props.onClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "16px",
              background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
              border: "2px solid #fecaca",
            },
          }}
        >
          <DialogContent sx={{ p: 4 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle>Lỗi hiển thị kết quả thất bại</AlertTitle>
              Có lỗi xảy ra khi hiển thị thông báo thất bại. Vui lòng thử lại.
            </Alert>

            {/* Debug info for development */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  backgroundColor: "rgba(0,0,0,0.05)",
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontFamily: "monospace", display: "block", mb: 1 }}
                >
                  Debug Info:
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontFamily: "monospace", wordBreak: "break-all" }}
                >
                  {this.state.error.message}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              {this.props.onReplay && (
                <Button
                  variant="contained"
                  startIcon={<RestartAlt />}
                  onClick={this.props.onReplay}
                  sx={{
                    background:
                      "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)",
                    },
                  }}
                >
                  Chơi lại
                </Button>
              )}

              <Button
                variant="outlined"
                onClick={this.props.onClose}
                sx={{
                  borderColor: "#dc2626",
                  color: "#dc2626",
                  "&:hover": {
                    backgroundColor: "#dc2626",
                    color: "white",
                  },
                }}
              >
                Đóng
              </Button>

              <Button
                variant="text"
                startIcon={<HomeOutlined />}
                onClick={this.props.onClose}
                sx={{ color: "#6b7280" }}
              >
                Trang chủ
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      );
    }

    // Normal render when no error
    return <>{this.props.children}</>;
  }
}

