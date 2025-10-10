/**
 * AI Chat Dialog Component
 * Popup dialog for AI-powered course recommendations and hints
 */

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  Avatar,
  Card,
  CardContent,
  CardActions,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PersonIcon from "@mui/icons-material/Person";
import { useAI } from "hooks/useAI";
import { useAppDispatch } from "store/config";
import { addCartItemThunk } from "store/cart/cartThunks";
import { PATH_USER } from "routes/paths";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  recommendations?: any[];
}

interface AIChatDialogProps {
  open: boolean;
  onClose: () => void;
}

export const AIChatDialog = ({ open, onClose }: AIChatDialogProps) => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    getRecommendations,
    recommendations,
    recommendationsLoading,
    recommendationsError,
    reset,
  } = useAI();

  // Auto scroll to bottom when new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle recommendations response with duplicate filtering
  useEffect(() => {
    if (recommendations && !recommendationsLoading) {
      setMessages((prev) => {
        // Get all previously recommended course IDs from message history
        const previouslyRecommendedIds = new Set<string>();
        prev.forEach((msg) => {
          if (msg.recommendations) {
            msg.recommendations.forEach((rec: any) => {
              previouslyRecommendedIds.add(rec.courseId);
            });
          }
        });

        // Filter out duplicate recommendations
        const newRecommendations = recommendations.recommendations.filter(
          (rec: any) => !previouslyRecommendedIds.has(rec.courseId)
        );

        // Add message with filtered recommendations
        return [
          ...prev,
          {
            role: "assistant",
            content: recommendations.explanation,
            timestamp: new Date(),
            // Show new recommendations if any, otherwise no cards
            recommendations:
              newRecommendations.length > 0 ? newRecommendations : undefined,
          },
        ];
      });
    }
  }, [recommendations, recommendationsLoading]);



  const handleSendRecommendationQuery = async () => {
    if (!query.trim()) return;

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: query,
        timestamp: new Date(),
      },
    ]);

    // Call AI
    await getRecommendations(query);
    setQuery("");
  };


  const handleClose = () => {
    reset();
    setQuery("");
    setMessages([]);
    onClose();
  };

  const handleViewCourseDetails = (courseId: string) => {
    // Navigate to course detail page
    navigate(PATH_USER.courseDetail.replace(":id", courseId));
    onClose(); // Close AI dialog
  };

  const handleAddToCart = async (course: any) => {
    try {
      // Add course to cart
      await dispatch(
        addCartItemThunk({
          courseId: course.courseId,
          unitPrice: course.price || 0,
        })
      ).unwrap();
      // Show success feedback
      console.log(`✅ Added "${course.courseName}" to cart`);
      // TODO: Show snackbar notification
    } catch (error) {
      console.error(`❌ Failed to add "${course.courseName}" to cart:`, error);
      // TODO: Show error snackbar
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendRecommendationQuery();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: "80vh",
          maxHeight: "800px",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid #e0e0e0",
          py: 2,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              component="img"
              src="/asset/Logo Popup.png"
              alt="Ottobit AI"
              sx={{
                width: 48,
                height: 48,
                objectFit: "contain",
              }}
            />
            <Box>
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ color: "primary.main", mb: 0.3 }}
              >
                AI Trợ Lý Ottobit
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>


      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          p: 0,
          overflow: "hidden",
        }}
      >
        {/* Messages Container */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            p: 3,
            bgcolor: "#f5f5f5",
          }}
        >
          {/* Welcome Message */}
          {messages.length === 0 && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100%"
              gap={2}
            >
              <AutoAwesomeIcon sx={{ fontSize: 64, color: "primary.main" }} />
              <Typography variant="h6" color="text.secondary" align="center">
                Xin chào! Hỏi tôi để nhận gợi ý khóa học phù hợp
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
              >
                Ví dụ: "Tôi muốn học lập trình robot cho người mới bắt đầu"
              </Typography>
            </Box>
          )}

          {/* Chat Messages */}
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "user" ? "flex-end" : "flex-start"
              }
              mb={2}
            >
              <Box
                display="flex"
                gap={1}
                maxWidth="80%"
                flexDirection={message.role === "user" ? "row-reverse" : "row"}
              >
                {/* Avatar */}
                {message.role === "user" ? (
                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
                      width: 36,
                      height: 36,
                    }}
                  >
                    <PersonIcon fontSize="small" />
                  </Avatar>
                ) : (
                  <Box
                    component="img"
                    src="/asset/Logo Popup.png"
                    alt="Ottobit AI"
                    sx={{
                      width: 40,
                      height: 40,
                      objectFit: "contain",
                    }}
                  />
                )}

                {/* Message Bubble */}
                <Box>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      bgcolor:
                        message.role === "user" ? "primary.main" : "white",
                      color: message.role === "user" ? "white" : "text.primary",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                      {message.content}
                    </Typography>
                  </Paper>

                  {/* Course Recommendations */}
                  {message.recommendations &&
                    message.recommendations.length > 0 && (
                      <Box
                        mt={2}
                        display="flex"
                        flexDirection="column"
                        gap={1.5}
                      >
                        {message.recommendations.map(
                          (rec: any, idx: number) => (
                            <Card
                              key={idx}
                              variant="outlined"
                              sx={{ borderRadius: 2 }}
                            >
                              <CardContent sx={{ pb: 1 }}>
                                <Box
                                  display="flex"
                                  justifyContent="space-between"
                                  alignItems="start"
                                  mb={1}
                                >
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight={600}
                                    flex={1}
                                  >
                                    {rec.courseName || `Khóa học ${idx + 1}`}
                                  </Typography>
                                  <Chip
                                    label={`Phù hợp ${rec.matchScore}%`}
                                    color="success"
                                    size="small"
                                    sx={{ ml: 1 }}
                                  />
                                </Box>

                                {/* Course Details */}
                                <Box
                                  display="flex"
                                  gap={1}
                                  mb={1.5}
                                  flexWrap="wrap"
                                >
                                  {rec.level && (
                                    <Chip
                                      label={rec.level}
                                      size="small"
                                      variant="outlined"
                                      color="primary"
                                    />
                                  )}
                                  {rec.price !== undefined && (
                                    <Chip
                                      label={
                                        rec.price === 0
                                          ? "Miễn phí"
                                          : `${rec.price.toLocaleString(
                                              "vi-VN"
                                            )} ₫`
                                      }
                                      size="small"
                                      variant="outlined"
                                      color="warning"
                                    />
                                  )}
                                  {rec.rating > 0 && (
                                    <Chip
                                      label={`⭐ ${rec.rating.toFixed(1)}`}
                                      size="small"
                                      variant="outlined"
                                    />
                                  )}
                                </Box>

                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  mb={1}
                                >
                                  💡 {rec.reason}
                                </Typography>

                                {rec.learningPath && (
                                  <Box
                                    sx={{
                                      bgcolor: "primary.light",
                                      p: 1,
                                      borderRadius: 1,
                                      mt: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      color="primary.dark"
                                    >
                                      📚 Lộ trình: {rec.learningPath}
                                    </Typography>
                                  </Box>
                                )}
                              </CardContent>
                              <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  fullWidth
                                  onClick={() =>
                                    handleViewCourseDetails(rec.courseId)
                                  }
                                >
                                  Xem chi tiết
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  fullWidth
                                  onClick={() => handleAddToCart(rec)}
                                >
                                  Thêm vào giỏ
                                </Button>
                              </CardActions>
                            </Card>
                          )
                        )}
                      </Box>
                    )}

                  {/* Timestamp */}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    {message.timestamp.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}

          {/* Loading Indicator */}
          {recommendationsLoading && (
            <Box display="flex" gap={1} mb={2}>
              <Box
                component="img"
                src="/asset/Logo Popup.png"
                alt="Ottobit AI"
                sx={{
                  width: 40,
                  height: 40,
                  objectFit: "contain",
                }}
              />
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={16} />
                  <Typography variant="body2" color="text.secondary">
                    Đang suy nghĩ...
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}

          {/* Error Display */}
          {recommendationsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {recommendationsError}
            </Alert>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Box
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder="Hỏi AI về khóa học bạn muốn học..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={recommendationsLoading}
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleSendRecommendationQuery}
              disabled={!query.trim() || recommendationsLoading}
              sx={{ minWidth: 56 }}
            >
              <SendIcon />
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
