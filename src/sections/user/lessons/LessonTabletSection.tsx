/**
 * Lesson Tablet Section - Contains tablet UI with challenges grid
 * Displays challenges for a specific lesson in tablet-style interface
 */

import React from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Container,
} from "@mui/material";
import { ChallengeResult } from "../../../common/@types/challenge";
import { SubmissionResult } from "../../../common/@types/submission";
import {
  isChallengeAccessible,
  getChallengeProgress,
} from "../../../utils/challengeUtils";

interface LessonTabletSectionProps {
  challenges: ChallengeResult[];
  submissions?: SubmissionResult[];
  challengesLoading: boolean;
  challengesError: string | null;
  onChallengeSelect: (challengeId: string) => void;
  onRetry: () => void;
}

const LessonTabletSection: React.FC<LessonTabletSectionProps> = ({
  challenges,
  submissions = [],
  challengesLoading,
  challengesError,
  onChallengeSelect,
  onRetry,
}) => {
  return (
    <Box sx={{ background: "#f8f9fa", py: 6 }}>
      <Container maxWidth="xl">
        {/* Section Title */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, mb: 1, color: "#2e3440" }}
          >
            Chọn thử thách học tập
          </Typography>
          <Typography variant="body1" sx={{ color: "#5e6c84" }}>
            Các thử thách được tổ chức theo độ khó tăng dần
          </Typography>
        </Box>

        {/* Virtual Tablet Container */}
        <Box
          sx={{
            maxWidth: 1400,
            margin: "0 auto",
            background: "linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)",
            borderRadius: "28px",
            p: 2.5,
            boxShadow:
              "0 30px 80px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.3), 0 0 100px rgba(34,197,94,0.1)",
            position: "relative",
            border: "1px solid rgba(255,255,255,0.05)",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow:
                "0 35px 90px rgba(0,0,0,0.45), inset 0 2px 4px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.3), 0 0 120px rgba(34,197,94,0.15)",
              transform: "translateY(-2px)",
            },
            // Top speaker grill
            "&::before": {
              content: '""',
              position: "absolute",
              top: "14px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "80px",
              height: "5px",
              background:
                "linear-gradient(90deg, transparent, #444, #555, #444, transparent)",
              borderRadius: "3px",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
            },
            // Front camera
            "&::after": {
              content: '""',
              position: "absolute",
              top: "13px",
              right: "24px",
              width: "8px",
              height: "8px",
              background: "radial-gradient(circle, #222 30%, #000 100%)",
              borderRadius: "50%",
              boxShadow:
                "0 0 3px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.1), 0 0 0 1px rgba(255,255,255,0.05)",
              border: "0.5px solid #333",
            },
          }}
        >
          {/* Ambient Glow Effect */}
          <Box
            sx={{
              position: "absolute",
              top: "-15px",
              left: "-15px",
              right: "-15px",
              bottom: "-15px",
              background:
                "linear-gradient(45deg, rgba(34,197,94,0.15) 0%, transparent 30%, rgba(34,197,94,0.08) 70%, transparent 100%)",
              borderRadius: "43px",
              zIndex: -1,
              opacity: 0,
              animation: "ambientGlow 6s ease-in-out infinite",
              "@keyframes ambientGlow": {
                "0%, 100%": {
                  opacity: 0.4,
                  transform: "scale(1)",
                },
                "50%": {
                  opacity: 0.7,
                  transform: "scale(1.02)",
                },
              },
              filter: "blur(20px)",
            }}
          />

          {/* Home Button */}
          <Box
            sx={{
              position: "absolute",
              bottom: "12px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #333 0%, #111 100%)",
              border: "2px solid #444",
              boxShadow:
                "inset 0 2px 4px rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "translateX(-50%) scale(0.95)",
                background: "linear-gradient(135deg, #444 0%, #222 100%)",
              },
              "&:active": {
                transform: "translateX(-50%) scale(0.90)",
                boxShadow: "inset 0 2px 8px rgba(0,0,0,0.4)",
              },
              "&::after": {
                content: '""',
                width: "24px",
                height: "24px",
                borderRadius: "4px",
                border: "2px solid #666",
                background: "transparent",
              },
            }}
          />

          {/* Volume Buttons */}
          <Box
            sx={{
              position: "absolute",
              right: "-4px",
              top: "80px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {/* Volume Up */}
            <Box
              sx={{
                width: "8px",
                height: "50px",
                background:
                  "linear-gradient(90deg, #333 0%, #555 50%, #333 100%)",
                borderRadius: "4px 0 0 4px",
                boxShadow:
                  "inset 0 1px 2px rgba(0,0,0,0.5), 1px 0 3px rgba(0,0,0,0.3)",
              }}
            />
            {/* Volume Down */}
            <Box
              sx={{
                width: "8px",
                height: "50px",
                background:
                  "linear-gradient(90deg, #333 0%, #555 50%, #333 100%)",
                borderRadius: "4px 0 0 4px",
                boxShadow:
                  "inset 0 1px 2px rgba(0,0,0,0.5), 1px 0 3px rgba(0,0,0,0.3)",
              }}
            />
          </Box>

          {/* Power Button */}
          <Box
            sx={{
              position: "absolute",
              left: "-4px",
              top: "60px",
              width: "8px",
              height: "80px",
              background:
                "linear-gradient(90deg, #333 0%, #555 50%, #333 100%)",
              borderRadius: "0 4px 4px 0",
              boxShadow:
                "inset 0 1px 2px rgba(0,0,0,0.5), -1px 0 3px rgba(0,0,0,0.3)",
            }}
          />

          {/* Charging Port */}
          <Box
            sx={{
              position: "absolute",
              bottom: "-2px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "24px",
              height: "4px",
              background: "#111",
              borderRadius: "2px 2px 0 0",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.8)",
              "&::before": {
                content: '""',
                position: "absolute",
                top: "1px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "16px",
                height: "1px",
                background: "#333",
                borderRadius: "1px",
              },
            }}
          />

          {/* Tablet Screen */}
          <Box
            sx={{
              background: "white",
              borderRadius: "18px",
              overflow: "hidden",
              display: "flex",
              minHeight: { xs: "500px", sm: "600px", md: "650px", lg: "700px" },
              height: "auto",
              maxHeight: { xs: "70vh", sm: "75vh", md: "80vh", lg: "85vh" },
              boxShadow:
                "inset 0 0 30px rgba(0,0,0,0.15), inset 0 4px 20px rgba(0,0,0,0.08)",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 30%, rgba(255,255,255,0.05) 60%, transparent 100%)",
                pointerEvents: "none",
                zIndex: 10,
                borderRadius: "18px",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                top: "10%",
                left: "60%",
                width: "40%",
                height: "30%",
                background:
                  "linear-gradient(45deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
                borderRadius: "50%",
                filter: "blur(20px)",
                pointerEvents: "none",
                zIndex: 9,
                animation: "screenGlare 8s ease-in-out infinite",
                "@keyframes screenGlare": {
                  "0%, 100%": {
                    opacity: 0.3,
                    transform: "scale(1) rotate(0deg)",
                  },
                  "50%": {
                    opacity: 0.6,
                    transform: "scale(1.2) rotate(2deg)",
                  },
                },
              },
            }}
          >
            {/* Status Bar Simulation */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "28px",
                background: "rgba(0,0,0,0.02)",
                backdropFilter: "blur(10px)",
                borderRadius: "18px 18px 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                zIndex: 8,
                borderBottom: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              {/* Time */}
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#2e3440",
                  fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                }}
              >
                {new Date().toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>

              {/* Status Icons */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {/* WiFi */}
                <Box
                  sx={{
                    width: "15px",
                    height: "10px",
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "4px",
                      height: "3px",
                      background: "#2e3440",
                      borderRadius: "1px",
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: "0",
                      height: "0",
                      borderLeft: "7px solid transparent",
                      borderRight: "7px solid transparent",
                      borderBottom: "10px solid #2e3440",
                      borderRadius: "2px",
                      opacity: 0.7,
                    },
                  }}
                />

                {/* Battery */}
                <Box
                  sx={{
                    width: "22px",
                    height: "11px",
                    border: "1.5px solid #2e3440",
                    borderRadius: "2px",
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      right: "-4px",
                      top: "2px",
                      width: "2px",
                      height: "5px",
                      background: "#2e3440",
                      borderRadius: "0 1px 1px 0",
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      left: "1px",
                      top: "1px",
                      width: "80%",
                      height: "calc(100% - 2px)",
                      background:
                        "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)",
                      borderRadius: "1px",
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Main Content Area */}
            <Box
              sx={{
                flex: 1,
                p: 3,
                pt: 5,
                overflowY: "auto",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "rgba(0,0,0,0.05)",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(0,0,0,0.2)",
                  borderRadius: "4px",
                  "&:hover": {
                    background: "rgba(0,0,0,0.3)",
                  },
                },
              }}
            >
              {/* Challenge Cards Grid */}
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {challengesLoading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: 400,
                    }}
                  >
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>
                      Đang tải danh sách thử thách...
                    </Typography>
                  </Box>
                ) : challengesError ? (
                  <Box sx={{ textAlign: "center", p: 4 }}>
                    <Alert severity="error" sx={{ mb: 2 }}>
                      Lỗi khi tải thử thách: {challengesError}
                    </Alert>
                    <Button variant="contained" onClick={onRetry}>
                      Thử lại
                    </Button>
                  </Box>
                ) : challenges.length > 0 ? (
                  <>
                    <Grid
                      container
                      spacing={{ xs: 2, sm: 2.5, md: 3 }}
                      alignItems="stretch"
                      sx={{
                        flex: 1,
                        height: "100%",
                        "& .MuiGrid-item": {
                          display: "flex",
                          height: "auto",
                        },
                      }}
                    >
                      {challenges.map((challenge) => {
                        const isAccessible = isChallengeAccessible(
                          challenge,
                          challenges,
                          submissions
                        );
                        const progress = getChallengeProgress(
                          challenge.id,
                          submissions
                        );

                        return (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            lg={3}
                            key={challenge.id}
                            sx={{ display: "flex" }}
                          >
                            <Box
                              sx={{
                                width: "100%",
                                height: "auto",
                                display: "flex",
                                flexDirection: "column",
                                position: "relative",
                                borderRadius: "16px",
                                overflow: "hidden",
                                cursor: isAccessible
                                  ? "pointer"
                                  : "not-allowed",
                                transition:
                                  "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                background: isAccessible
                                  ? progress.isCompleted
                                    ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" // Green for completed
                                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" // Blue for accessible
                                  : "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)", // Gray for locked
                                boxShadow: isAccessible
                                  ? "0 8px 24px rgba(0,0,0,0.15)"
                                  : "0 4px 12px rgba(0,0,0,0.1)",
                                opacity: isAccessible ? 1 : 0.6,
                                "&:hover": isAccessible
                                  ? {
                                      transform: "translateY(-6px) scale(1.02)",
                                      boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
                                    }
                                  : {},
                              }}
                              onClick={() =>
                                isAccessible && onChallengeSelect(challenge.id)
                              }
                            >
                              {/* Challenge Thumbnail */}
                              <Box
                                sx={{
                                  position: "relative",
                                  height: { xs: 100, sm: 120, md: 140 },
                                  flex: "0 0 auto",
                                  background: `linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)`,
                                  backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="140" viewBox="0 0 200 140"%3E%3Cdefs%3E%3ClinearGradient id="bg" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23667eea"/%3E%3Cstop offset="100%25" style="stop-color:%23764ba2"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="200" height="140" fill="url(%23bg)"/%3E%3Ctext x="100" y="75" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold"%3EThử thách%3C/text%3E%3C/svg%3E')`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                  display: "flex",
                                  alignItems: "flex-start",
                                  justifyContent: "space-between",
                                  p: 1.5,
                                }}
                              >
                                {/* Status and Stars */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  {/* Progress Status */}
                                  {progress.isCompleted ? (
                                    <Chip
                                      label="✓ Hoàn thành"
                                      size="small"
                                      sx={{
                                        bgcolor: "rgba(255,255,255,0.9)",
                                        color: "#16a34a",
                                        fontWeight: 600,
                                        fontSize: "0.7rem",
                                      }}
                                    />
                                  ) : !isAccessible ? (
                                    <Chip
                                      label="🔒 Bị khóa"
                                      size="small"
                                      sx={{
                                        bgcolor: "rgba(255,255,255,0.9)",
                                        color: "#6b7280",
                                        fontWeight: 600,
                                        fontSize: "0.7rem",
                                      }}
                                    />
                                  ) : (
                                    <Chip
                                      label="📖 Sẵn sàng"
                                      size="small"
                                      sx={{
                                        bgcolor: "rgba(255,255,255,0.9)",
                                        color: "#667eea",
                                        fontWeight: 600,
                                        fontSize: "0.7rem",
                                      }}
                                    />
                                  )}

                                  {/* Star Rating */}
                                  {progress.stars > 0 && (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.25,
                                      }}
                                    >
                                      {[1, 2, 3].map((star) => (
                                        <Box
                                          key={star}
                                          sx={{
                                            width: 12,
                                            height: 12,
                                            color:
                                              star <= progress.stars
                                                ? "#fbbf24"
                                                : "rgba(255,255,255,0.4)",
                                            fontSize: "12px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                          }}
                                        >
                                          ⭐
                                        </Box>
                                      ))}
                                    </Box>
                                  )}
                                </Box>
                              </Box>

                              {/* Challenge Content */}
                              <Box
                                sx={{
                                  p: 1.5,
                                  background: "white",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 1,
                                  flex: 1,
                                  minHeight: 160,
                                }}
                              >
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontWeight: 600,
                                    color: "#2e3440",
                                    mb: 0.5,
                                    fontSize: "1rem",
                                  }}
                                >
                                  {challenge.title ||
                                    `Thử thách ${challenge.order}`}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "#6b7280",
                                    fontSize: "0.85rem",
                                    lineHeight: 1.4,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                >
                                  {challenge.description ||
                                    "Hoàn thành thử thách để tiến bộ"}
                                </Typography>

                                {/* Challenge Stats */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 0.5,
                                    mt: 1,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <Chip
                                    label={`Thứ tự ${challenge.order}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: "0.75rem" }}
                                  />
                                  <Chip
                                    label={`Độ khó: ${challenge.difficulty}/5`}
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                    sx={{ fontSize: "0.75rem" }}
                                  />
                                  {progress.isCompleted && (
                                    <Chip
                                      label={`${progress.stars}/3 ⭐`}
                                      size="small"
                                      variant="filled"
                                      sx={{
                                        bgcolor: "#fbbf24",
                                        color: "white",
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                      }}
                                    />
                                  )}
                                </Box>

                                <Box sx={{ mt: "auto" }}>
                                  <Button
                                    fullWidth
                                    variant="contained"
                                    disabled={!isAccessible}
                                    sx={{
                                      py: 1,
                                      background: !isAccessible
                                        ? "#9ca3af" // Gray for locked
                                        : progress.isCompleted
                                        ? "linear-gradient(45deg, #f97316 0%, #ea580c 100%)" // Orange for replay
                                        : "linear-gradient(45deg, #86efac 0%, #22c55e 100%)", // Green for start
                                      color: "white",
                                      fontSize: "0.9rem",
                                      fontWeight: 600,
                                      textTransform: "none",
                                      borderRadius: "8px",
                                      boxShadow: !isAccessible
                                        ? "0 2px 8px rgba(156, 163, 175, 0.25)"
                                        : progress.isCompleted
                                        ? "0 2px 8px rgba(249, 115, 22, 0.25)"
                                        : "0 2px 8px rgba(34, 197, 94, 0.25)",
                                      "&:hover": !isAccessible
                                        ? {}
                                        : {
                                            background: progress.isCompleted
                                              ? "linear-gradient(45deg, #ea580c 0%, #f97316 100%)"
                                              : "linear-gradient(45deg, #22c55e 0%, #86efac 100%)",
                                            transform: "translateY(-1px)",
                                            boxShadow: progress.isCompleted
                                              ? "0 4px 12px rgba(249, 115, 22, 0.35)"
                                              : "0 4px 12px rgba(34, 197, 94, 0.35)",
                                          },
                                      "&:disabled": {
                                        color: "rgba(255, 255, 255, 0.7)",
                                        cursor: "not-allowed",
                                      },
                                    }}
                                  >
                                    {!isAccessible
                                      ? " Chưa mở khóa"
                                      : progress.isCompleted
                                      ? " Chơi lại"
                                      : " Bắt đầu"}
                                  </Button>
                                </Box>
                              </Box>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      minHeight: 400,
                    }}
                  >
                    <Box
                      sx={{
                        p: 4,
                        textAlign: "center",
                        background: "#f8f9fa",
                        borderRadius: "16px",
                        border: "2px dashed #e0e0e0",
                        maxWidth: 400,
                      }}
                    >
                      <Typography variant="h5" sx={{ color: "#2e3440", mb: 2 }}>
                        🤔 Chưa có thử thách nào
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#5e6c84" }}>
                        Bài học này chưa có thử thách. Vui lòng thử lại sau.
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LessonTabletSection;
