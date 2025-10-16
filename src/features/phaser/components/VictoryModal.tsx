/**
 * Victory Modal Component - Minimal style (HP Robot-like)
 */

import React from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  Slide,
  IconButton,
  Button,
} from "@mui/material";
import { Close, PlayArrow, Replay, Star, SmartToy, ArrowBack } from "@mui/icons-material";
import { TransitionProps } from "@mui/material/transitions";
import { VictoryData } from "../types/phaser";

interface VictoryModalProps {
  open: boolean;
  onClose: () => void;
  victoryData: VictoryData | null;
  onPlayNext?: () => void;
  onReplay?: () => void;
  onGoHome?: () => void; // kept for API compatibility (unused in minimal UI)
  onBackToLesson?: () => void; // NEW: Show when completing last challenge
  showSimulateButton?: boolean;
  onSimulate?: () => void;
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

// Helper function to calculate stars from score
function calculateStarsFromScore(score: number): number {
  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));
  const stars = clamp(Math.ceil(score * 3), 1, 3);
  return stars;
}

export default function VictoryModal({
  open,
  onClose,
  victoryData,
  onPlayNext,
  onReplay,
  onBackToLesson,
  showSimulateButton,
  onSimulate,
}: VictoryModalProps) {
  if (!victoryData) return null;

  const score = victoryData.starScore ?? victoryData.score ?? 0;
  const calculatedStars = victoryData.stars ?? calculateStarsFromScore(score);
  const isVictory = victoryData.isVictory === true;

  return (
    <>
      <style>{`
        @keyframes soft-pop { 0%{ transform: scale(.9); opacity: .6 } 100%{ transform: scale(1); opacity: 1 } }
        @keyframes star-pop { 0%{ transform: translateY(6px) scale(.8); opacity: .2 } 100%{ transform: translateY(0) scale(1); opacity: 1 } }
      `}</style>
      <Dialog
        open={open}
        onClose={onClose}
        TransitionComponent={Transition}
        maxWidth="xs"
        fullWidth
        disableScrollLock={true}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            overflow: "hidden",
            position: "relative",
            background: "linear-gradient(180deg, #eef7ff 0%, #e9f4ff 100%)",
            border: "1px solid rgba(148,163,184,.25)",
            boxShadow: "0 20px 60px rgba(2,6,23,.25)",
            p: 3,
            animation: "soft-pop .18s ease-out",
          },
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 12,
            top: 12,
            bgcolor: "rgba(255,255,255,.7)",
            border: "1px solid rgba(148,163,184,.35)",
            "&:hover": { bgcolor: "rgba(255,255,255,.9)" },
          }}
          aria-label="close"
        >
          <Close sx={{ color: "#334155" }} />
        </IconButton>

        <DialogContent sx={{ p: 5 }}>
          {/* Stars with soft glow */}
          <Box
            sx={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              gap: 1.5,
              mb: 2.5,
              "&::before": {
                content: '""',
                position: "absolute",
                top: -8,
                width: 120,
                height: 60,
                borderRadius: "50%",
                background:
                  "radial-gradient(60px 30px at 50% 50%, rgba(251,191,36,.35), rgba(251,191,36,0) 70%)",
                filter: "blur(2px)",
              },
            }}
          >
            {[1, 2, 3].map((i) => (
              <Star
                key={i}
                sx={{
                  fontSize: 56,
                  color: i <= calculatedStars ? "#fbbf24" : "#e5e7eb",
                  filter:
                    i <= calculatedStars
                      ? "drop-shadow(0 2px 0 rgba(0,0,0,.08))"
                      : "none",
                  animation: "star-pop .25s ease-out",
                  animationDelay: `${i * 60}ms`,
                }}
              />
            ))}
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 800,
              letterSpacing: 1,
              color: isVictory ? "#16a34a" : "#ef4444",
              textShadow: isVictory ? "0 1px 0 rgba(0,0,0,.06)" : undefined,
              mb: 0.5,
            }}
          >
            {isVictory ? "SUCCESS" : "FAILED"}
          </Typography>

          {/* Actions - circular icon buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 3.5,
              mt: 2,
              flexWrap: "wrap",
            }}
          >
            {onReplay && (
              <IconButton
                onClick={onReplay}
                aria-label="replay"
                sx={{
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  border: "2px solid rgba(15,23,42,.25)",
                  backgroundColor: "#f0f9ff",
                  boxShadow:
                    "0 2px 0 rgba(2,6,23,.08), inset 0 -2px 0 rgba(2,6,23,.05)",
                  transition:
                    "transform .15s ease, box-shadow .15s ease, background-color .15s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    backgroundColor: "#e0f2fe",
                    boxShadow:
                      "0 6px 16px rgba(2,6,23,.12), inset 0 -2px 0 rgba(2,6,23,.05)",
                  },
                }}
              >
                <Replay sx={{ fontSize: 30, color: "#0f172a" }} />
              </IconButton>
            )}

            {/* Show Play Next button for non-last challenges */}
            {onPlayNext && (
              <IconButton
                onClick={onPlayNext}
                aria-label="next"
                sx={{
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  border: "2px solid rgba(15,23,42,.25)",
                  backgroundColor: "#f0f9ff",
                  boxShadow:
                    "0 2px 0 rgba(2,6,23,.08), inset 0 -2px 0 rgba(2,6,23,.05)",
                  transition:
                    "transform .15s ease, box-shadow .15s ease, background-color .15s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    backgroundColor: "#e0f2fe",
                    boxShadow:
                      "0 6px 16px rgba(2,6,23,.12), inset 0 -2px 0 rgba(2,6,23,.05)",
                  },
                }}
              >
                <PlayArrow sx={{ fontSize: 30, color: "#0f172a" }} />
              </IconButton>
            )}

            {/* Show Back to Lesson button for last challenge */}
            {onBackToLesson && (
              <IconButton
                onClick={onBackToLesson}
                aria-label="back to lesson"
                sx={{
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  border: "2px solid rgba(15,23,42,.25)",
                  backgroundColor: "#f0f9ff",
                  boxShadow:
                    "0 2px 0 rgba(2,6,23,.08), inset 0 -2px 0 rgba(2,6,23,.05)",
                  transition:
                    "transform .15s ease, box-shadow .15s ease, background-color .15s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    backgroundColor: "#e0f2fe",
                    boxShadow:
                      "0 6px 16px rgba(2,6,23,.12), inset 0 -2px 0 rgba(2,6,23,.05)",
                  },
                }}
              >
                <ArrowBack sx={{ fontSize: 30, color: "#0f172a" }} />
              </IconButton>
            )}

            {showSimulateButton && onSimulate && (
              <Button
                onClick={onSimulate}
                size="large"
                startIcon={<SmartToy />}
                sx={{
                  px: 3,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 700,
                  background:
                    "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
                  color: "white",
                  boxShadow: "0 4px 16px rgba(34, 197, 94, 0.28)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #16a34a 0%, #34d399 100%)",
                    transform: "translateY(-1px)",
                  },
                }}
                variant="contained"
              >
                Chạy mô phỏng
              </Button>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
