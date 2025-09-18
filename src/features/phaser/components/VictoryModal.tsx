/**
 * Victory Modal Component
 * Hiển thị thông báo thắng trận với animation đẹp mắt
 */

import React from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
  Chip,
  Divider,
  Slide,
  IconButton,
  LinearProgress,
  Fade,
} from "@mui/material";
import {
  Close,
  EmojiEvents,
  Battery90,
  CheckCircle,
  PlayArrow,
  HomeOutlined,
  Star,
  StarBorder,
} from "@mui/icons-material";
import { TransitionProps } from "@mui/material/transitions";
import { VictoryData } from "../types/phaser";

interface VictoryModalProps {
  open: boolean;
  onClose: () => void;
  victoryData: VictoryData | null;
  onPlayNext?: () => void;
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

// Confetti animation keyframes
const confettiAnimation = `
  @keyframes confetti-fall {
    0% {
      transform: translateY(-100vh) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }
  
  @keyframes bounce-in {
    0% {
      transform: scale(0.3);
      opacity: 0;
    }
    50% {
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  @keyframes glow-pulse {
    0%, 100% {
      box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
    }
    50% {
      box-shadow: 0 0 40px rgba(34, 197, 94, 0.8);
    }
  }
`;

// Helper function to calculate stars from score
function calculateStarsFromScore(score: number): number {
  // Clamp function
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
  
  // Formula: stars = clamp(ceil(cardScore * 3), 1, 3)
  const stars = clamp(Math.ceil(score * 3), 1, 3);
  
  console.log("🌟 [Stars Calculation] Input score:", score);
  console.log("🌟 [Stars Calculation] Formula: stars = clamp(ceil(score * 3), 1, 3)");
  console.log("🌟 [Stars Calculation] Step by step:");
  console.log(`   score * 3 = ${score} * 3 = ${score * 3}`);
  console.log(`   ceil(${score * 3}) = ${Math.ceil(score * 3)}`);
  console.log(`   clamp(${Math.ceil(score * 3)}, 1, 3) = ${stars}`);
  console.log("🌟 [Stars Calculation] Final result:", stars, "stars");
  
  return stars;
}

export default function VictoryModal({
  open,
  onClose,
  victoryData,
  onPlayNext,
  onReplay,
  onGoHome,
}: VictoryModalProps) {
  if (!victoryData) return null;

  // Calculate stars from score if not provided
  console.log("🔍 [Victory Modal] Raw victory data received:", victoryData);
  console.log("🔍 [Victory Modal] Data analysis:", {
    hasStarScore: victoryData.starScore !== undefined,
    starScoreValue: victoryData.starScore,
    hasScore: victoryData.score !== undefined,
    scoreValue: victoryData.score,
    hasStars: victoryData.stars !== undefined,
    starsValue: victoryData.stars
  });
  
  const score = victoryData.starScore ?? victoryData.score ?? 0;
  console.log("🎯 [Victory Modal] Final score used for calculation:", score);
  
  const calculatedStars = victoryData.stars ?? calculateStarsFromScore(score);

  // Only log when modal opens to show the final calculated stars
  if (open) {
    console.log("🏆 [Victory Modal] Final stars to display:", calculatedStars);
  }

  // Simple win/lose check - no stars
  const isVictory = victoryData.isVictory === true;

  // Safe data extraction with fallbacks
  const safeCollected = victoryData.collected || {
    total: 0,
    byType: { red: 0, yellow: 0, green: 0 },
  };
  const safeRequired = victoryData.required || {
    total: 0,
    byType: { red: 0, yellow: 0, green: 0 },
  };

  // Generate battery collection stats
  const batteryStats = [
    {
      color: "Đỏ",
      collected: safeCollected.byType?.red || 0,
      required: safeRequired.byType?.red || 0,
      bgColor: "#fee2e2",
      textColor: "#dc2626",
    },
    {
      color: "Vàng",
      collected: safeCollected.byType?.yellow || 0,
      required: safeRequired.byType?.yellow || 0,
      bgColor: "#fef3c7",
      textColor: "#d97706",
    },
    {
      color: "Xanh lá",
      collected: safeCollected.byType?.green || 0,
      required: safeRequired.byType?.green || 0,
      bgColor: "#dcfce7",
      textColor: "#16a34a",
    },
  ];

  return (
    <>
      <style>{confettiAnimation}</style>
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
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            animation: "bounce-in 0.6s ease-out",
          },
        }}
      >
        {/* Confetti Effect */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            overflow: "hidden",
            zIndex: 0,
            "&::before": {
              content: '"🎉"',
              position: "absolute",
              top: "-50px",
              left: "10%",
              fontSize: "30px",
              animation: "confetti-fall 3s ease-out infinite",
              animationDelay: "0s",
            },
            "&::after": {
              content: '"🎊"',
              position: "absolute",
              top: "-50px",
              right: "10%",
              fontSize: "30px",
              animation: "confetti-fall 3s ease-out infinite",
              animationDelay: "0.5s",
            },
          }}
        />

        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            zIndex: 10,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.9)",
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
                background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                mb: 3,
                animation: "glow-pulse 2s ease-in-out infinite",
              }}
            >
              <EmojiEvents sx={{ fontSize: 48, color: "white" }} />
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                mb: 2,
              }}
            >
              🏆 Chúc mừng!
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: "#475569",
                fontWeight: 500,
              }}
            >
              Bạn đã hoàn thành {victoryData.mapKey?.toUpperCase() || "BÀI HỌC"}
              !
            </Typography>
          </Box>

          {/* Victory Status Badge */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
            <Chip
              icon={<CheckCircle />}
              label={isVictory ? "Thành công" : "Chưa hoàn thành"}
              sx={{
                fontSize: "1.1rem",
                fontWeight: 600,
                py: 2,
                px: 3,
                height: "auto",
                backgroundColor: isVictory ? "#dcfce7" : "#fee2e2",
                color: isVictory ? "#16a34a" : "#dc2626",
                border: `2px solid ${isVictory ? "#16a34a" : "#dc2626"}20`,
                "& .MuiChip-icon": {
                  color: isVictory ? "#16a34a" : "#dc2626",
                  fontSize: "1.5rem",
                },
              }}
            />
          </Box>

          {/* Stars Rating Section - Simplified */}
          {isVictory && (
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, color: "#475569", fontWeight: 600 }}
              >
                Đánh giá hiệu quả
              </Typography>
              
              {/* Always show calculated stars */}
              <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5, mb: 2 }}>
                {[1, 2, 3].map((starIndex) => {
                  return (
                    <Box key={starIndex} sx={{ position: "relative" }}>
                      {starIndex <= calculatedStars ? (
                        <Star sx={{ fontSize: 48, color: "#fbbf24" }} />
                      ) : (
                        <StarBorder sx={{ fontSize: 48, color: "#d1d5db" }} />
                      )}
                    </Box>
                  );
                })}
              </Box>
              
              {/* Show score percentage */}
              <Typography variant="body1" sx={{ color: "#64748b", mb: 1 }}>
                Điểm hiệu quả: <strong>{Math.round(score * 100)}%</strong>
              </Typography>
              
              {/* Show number of stars */}
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                {calculatedStars} sao / 3 sao
              </Typography>
            </Box>
          )}

          {/* Progress */}
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2" color="text.secondary">
                Tiến độ hoàn thành
              </Typography>
              <Typography variant="body2" fontWeight={600} color="primary">
                {Math.round(victoryData.progress || 100)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={victoryData.progress || 100}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "#e2e8f0",
                "& .MuiLinearProgress-bar": {
                  background:
                    "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)",
                  borderRadius: 4,
                },
              }}
            />
          </Box>

          {/* Battery Collection Stats */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
            >
              <Battery90 color="primary" />
              Thống kê thu thập pin
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {batteryStats
                .filter((stat) => stat.required > 0)
                .map((stat, index) => (
                  <Fade key={stat.color} in={open} timeout={800 + index * 200}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 2,
                        borderRadius: "12px",
                        backgroundColor: stat.bgColor,
                        border: `1px solid ${stat.textColor}20`,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: stat.textColor,
                          }}
                        />
                        <Typography
                          variant="body1"
                          sx={{ color: stat.textColor, fontWeight: 600 }}
                        >
                          Pin {stat.color}
                        </Typography>
                      </Box>
                      <Chip
                        icon={
                          stat.collected >= stat.required ? (
                            <CheckCircle />
                          ) : undefined
                        }
                        label={`${stat.collected}/${stat.required}`}
                        size="small"
                        sx={{
                          backgroundColor:
                            stat.collected >= stat.required
                              ? stat.textColor
                              : "transparent",
                          color:
                            stat.collected >= stat.required
                              ? "white"
                              : stat.textColor,
                          border: `1px solid ${stat.textColor}`,
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </Fade>
                ))}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {onPlayNext && (
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrow />}
                onClick={onPlayNext}
                sx={{
                  py: 1.5,
                  px: 3,
                  background:
                    "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1rem",
                  boxShadow: "0 4px 16px rgba(34, 197, 94, 0.3)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(34, 197, 94, 0.4)",
                  },
                }}
              >
                Chơi tiếp
              </Button>
            )}

            {onReplay && (
              <Button
                variant="outlined"
                size="large"
                onClick={onReplay}
                startIcon={<PlayArrow />}
                sx={{
                  py: 1.5,
                  px: 3,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1rem",
                  borderColor: "#3b82f6",
                  color: "#3b82f6",
                  "&:hover": {
                    backgroundColor: "#3b82f6",
                    color: "white",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(59, 130, 246, 0.3)",
                  },
                }}
              >
                Chơi lại
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
                  color: "#64748b",
                  "&:hover": {
                    backgroundColor: "#f1f5f9",
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
