import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Rating,
  IconButton,
} from "@mui/material";
import {
  PlayArrow as PlayIcon,
  CheckCircle as CompletedIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { ChallengeProcess } from "common/@types/challengeProcess";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface ChallengeProgressCardProps {
  challengeProcess: ChallengeProcess;
  onStartChallenge?: (challengeId: string) => void;
}

export default function ChallengeProgressCard({
  challengeProcess,
  onStartChallenge,
}: ChallengeProgressCardProps) {
  const isCompleted = !!challengeProcess.completedAt;
  const challenge = challengeProcess.challenge;

  const getDifficultyColor = (difficulty?: number) => {
    if (!difficulty) return "default";
    if (difficulty <= 2) return "success";
    if (difficulty <= 4) return "warning";
    return "error";
  };

  const handleStartChallenge = () => {
    if (challenge?.id && onStartChallenge) {
      onStartChallenge(challenge.id);
    }
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 4,
        },
        ...(isCompleted && {
          bgcolor: "success.50",
          borderLeft: "4px solid",
          borderLeftColor: "success.main",
        }),
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
          <Box sx={{ flexGrow: 1, mr: 1 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              {challenge?.title || "Challenge"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                mb: 1,
              }}
            >
              {challenge?.description || "No description"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {isCompleted ? (
              <CompletedIcon color="success" sx={{ fontSize: 32, mb: 0.5 }} />
            ) : (
              <IconButton
                color="primary"
                onClick={handleStartChallenge}
                sx={{ p: 0.5, mb: 0.5 }}
              >
                <PlayIcon sx={{ fontSize: 32 }} />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Challenge Details */}
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          {challenge?.difficulty && (
            <Chip
              label={`Level ${challenge.difficulty}`}
              size="small"
              color={getDifficultyColor(challenge.difficulty)}
              variant="outlined"
            />
          )}
          {challenge?.order && (
            <Chip
              label={`#${challenge.order}`}
              size="small"
              variant="outlined"
            />
          )}
          {isCompleted && (
            <Chip
              label="Completed"
              size="small"
              color="success"
              icon={<CompletedIcon />}
            />
          )}
        </Box>

        {/* Progress */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Best Score
            </Typography>
            {challengeProcess.bestStar > 0 && (
              <Rating
                value={challengeProcess.bestStar}
                max={5}
                size="small"
                readOnly
              />
            )}
          </Box>
          <LinearProgress
            variant="determinate"
            value={isCompleted ? 100 : challengeProcess.bestStar * 20}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: "grey.200",
              "& .MuiLinearProgress-bar": {
                borderRadius: 3,
                bgcolor: isCompleted ? "success.main" : "primary.main",
              },
            }}
          />
        </Box>

        {/* Completion Info */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <ScheduleIcon sx={{ fontSize: 16 }} color="action" />
            <Typography variant="caption" color="text.secondary">
              {isCompleted
                ? `Completed ${dayjs(challengeProcess.completedAt).fromNow()}`
                : "Not started yet"}
            </Typography>
          </Box>
          {challengeProcess.bestStar > 0 && (
            <Typography variant="caption" color="primary.main" sx={{ fontWeight: "medium" }}>
              {challengeProcess.bestStar}/5 ⭐
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}