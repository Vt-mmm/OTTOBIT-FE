/**
 * ChallengeCard - Individual challenge card component
 * Displays challenge info with progress, stars, and action button
 */

import React from "react";
import { Box, Typography, Button, Chip } from "@mui/material";
import { ChallengeResult, ChallengeMode } from "../../common/@types/challenge";

interface ChallengeProgress {
  isCompleted: boolean;
  stars: number;
  bestScore?: number;
}

interface ChallengeCardProps {
  challenge: ChallengeResult;
  isAccessible: boolean;
  progress: ChallengeProgress;
  onSelect: (challengeId: string) => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  isAccessible,
  progress,
  onSelect,
}) => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "auto",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        borderRadius: "16px",
        overflow: "hidden",
        cursor: isAccessible ? "pointer" : "not-allowed",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
      onClick={() => isAccessible && onSelect(challenge.id)}
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
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          p: 1.5,
        }}
      >
        {/* Top Row: Status Chip */}
        <Box>
          {progress.isCompleted ? (
            <Chip
              label="Hoàn thành"
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.95)",
                color: "#16a34a",
                fontWeight: 600,
                fontSize: "0.7rem",
              }}
            />
          ) : !isAccessible ? (
            <Chip
              label="Bị khóa"
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.95)",
                color: "#6b7280",
                fontWeight: 600,
                fontSize: "0.7rem",
              }}
            />
          ) : (
            <Chip
              label="Sẵn sàng"
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.95)",
                color: "#667eea",
                fontWeight: 600,
                fontSize: "0.7rem",
              }}
            />
          )}
        </Box>

        {/* Bottom Row: Stars + Challenge Mode */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            width: "100%",
          }}
        >
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
                    width: 14,
                    height: 14,
                    color:
                      star <= progress.stars
                        ? "#fbbf24"
                        : "rgba(255,255,255,0.4)",
                    fontSize: "14px",
                  }}
                >
                  ⭐
                </Box>
              ))}
            </Box>
          )}

          {/* Challenge Mode Indicator */}
          <Chip
            label={
              (challenge.challengeMode as number) === ChallengeMode.PhysicalFirst
                ? "Vật lý"
                : "Simulator"
            }
            size="small"
            variant="filled"
            sx={{
              bgcolor:
                (challenge.challengeMode as number) === ChallengeMode.PhysicalFirst
                  ? "#3b82f6"
                  : "#8b5cf6",
              color: "white",
              fontSize: "0.7rem",
              fontWeight: 600,
              height: "20px",
            }}
          />
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
          {challenge.title || `Thử thách ${challenge.order}`}
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
          {challenge.description || "Hoàn thành thử thách để tiến bộ"}
        </Typography>

        {/* Challenge Stats - Only Difficulty */}
        <Box sx={{ mt: 1 }}>
          <Chip
            label={`Độ khó: ${challenge.difficulty}/5`}
            size="small"
            variant="outlined"
            color="primary"
            sx={{ fontSize: "0.75rem" }}
          />
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
  );
};

export default ChallengeCard;
