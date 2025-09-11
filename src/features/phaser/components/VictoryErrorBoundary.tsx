/**
 * Error Boundary for Victory Modal
 * Prevents crashes when victory data has unexpected structure
 */

import React, { Component, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Alert,
} from "@mui/material";
import { ErrorOutline } from "@mui/icons-material";

interface Props {
  children: ReactNode;
  onClose: () => void;
  onReplay?: () => void;
  isOpen: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class VictoryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("🚨 Victory Modal Error:", error);
    console.error("Error Info:", errorInfo);
  }

  render() {
    if (this.state.hasError && this.props.isOpen) {
      // Fallback UI when victory modal crashes
      return (
        <Dialog
          open={this.props.isOpen}
          onClose={this.props.onClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogContent sx={{ p: 4, textAlign: "center" }}>
            <Box sx={{ mb: 3 }}>
              <ErrorOutline
                sx={{
                  fontSize: 64,
                  color: "warning.main",
                  mb: 2,
                }}
              />
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                🏆 Chúc mừng!
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "text.secondary", mb: 3 }}
              >
                Bạn đã hoàn thành thành công!
                <br />
                Có lỗi nhỏ khi hiển thị thông tin chi tiết.
              </Typography>

              <Alert severity="info" sx={{ mb: 3, textAlign: "left" }}>
                Dữ liệu victory từ game có cấu trúc khác mong đợi. Team sẽ sớm
                khắc phục vấn đề này.
              </Alert>
            </Box>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              {this.props.onReplay && (
                <Button
                  variant="contained"
                  onClick={this.props.onReplay}
                  sx={{
                    py: 1.5,
                    px: 3,
                    background:
                      "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Chơi lại
                </Button>
              )}

              <Button
                variant="outlined"
                onClick={this.props.onClose}
                sx={{
                  py: 1.5,
                  px: 3,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 600,
                  borderColor: "#3b82f6",
                  color: "#3b82f6",
                  "&:hover": {
                    backgroundColor: "#3b82f6",
                    color: "white",
                  },
                }}
              >
                Đóng
              </Button>
            </Box>

            {/* Debug info for development */}
            {process.env.NODE_ENV === "development" && (
              <Box sx={{ mt: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                  DEBUG: {this.state.error?.message}
                </Typography>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      );
    }

    return this.props.children;
  }
}
