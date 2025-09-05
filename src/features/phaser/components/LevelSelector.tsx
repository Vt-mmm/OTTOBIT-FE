import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Rating,
} from "@mui/material";
import {
  Lock,
  CheckCircle,
  PlayArrow,
  Star,
  Timer,
  Flag,
} from "@mui/icons-material";
import { Level } from "../services/levelConfigService";

interface LevelCardProps {
  level: Level;
  onLevelSelect: (level: Level) => void;
}

const LevelCard: React.FC<LevelCardProps> = ({ level, onLevelSelect }) => {
  const getDifficultyColor = (difficulty: Level["difficulty"]) => {
    switch (difficulty) {
      case "beginner":
        return "success";
      case "intermediate":
        return "warning";
      case "advanced":
        return "error";
      case "expert":
        return "secondary";
      default:
        return "default";
    }
  };

  const getDifficultyLabel = (difficulty: Level["difficulty"]) => {
    switch (difficulty) {
      case "beginner":
        return "Beginner";
      case "intermediate":
        return "Intermediate";
      case "advanced":
        return "Advanced";
      case "expert":
        return "Expert";
      default:
        return "Unknown";
    }
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        opacity: level.isUnlocked ? 1 : 0.6,
        cursor: level.isUnlocked ? "pointer" : "not-allowed",
        transition: "all 0.2s ease-in-out",
        "&:hover": level.isUnlocked
          ? {
              transform: "translateY(-4px)",
              boxShadow: 3,
            }
          : {},
      }}
      onClick={() => level.isUnlocked && onLevelSelect(level)}
    >
      {/* Status Indicator */}
      <Box sx={{ position: "absolute", top: 8, right: 8 }}>
        {!level.isUnlocked ? (
          <Lock color="disabled" />
        ) : level.isCompleted ? (
          <CheckCircle color="success" />
        ) : null}
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Title and Difficulty */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            {level.name}
          </Typography>
          <Chip
            label={getDifficultyLabel(level.difficulty)}
            color={getDifficultyColor(level.difficulty)}
            size="small"
          />
        </Box>

        {/* Description */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {level.description}
        </Typography>

        {/* Stars Rating */}
        {level.isCompleted && (
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Rating value={level.stars} max={3} size="small" readOnly />
            <Typography variant="caption" sx={{ ml: 1 }}>
              {level.stars}/3 stars
            </Typography>
          </Box>
        )}

        {/* Best Stats */}
        {level.isCompleted && (level.bestTime || level.bestScore) && (
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            {level.bestTime && (
              <Chip
                icon={<Timer />}
                label={`${level.bestTime}s`}
                variant="outlined"
                size="small"
              />
            )}
            {level.bestScore && (
              <Chip
                icon={<Star />}
                label={level.bestScore}
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        )}

        {/* Objectives */}
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Objectives:
        </Typography>
        <Box component="ul" sx={{ pl: 2, m: 0 }}>
          {level.objectives.slice(0, 2).map((objective, index) => (
            <Typography
              key={index}
              component="li"
              variant="caption"
              color="text.secondary"
              sx={{ mb: 0.5 }}
            >
              {objective}
            </Typography>
          ))}
          {level.objectives.length > 2 && (
            <Typography variant="caption" color="text.secondary">
              +{level.objectives.length - 2} more...
            </Typography>
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant={level.isCompleted ? "outlined" : "contained"}
          startIcon={level.isUnlocked ? <PlayArrow /> : <Lock />}
          disabled={!level.isUnlocked}
          onClick={(e) => {
            e.stopPropagation();
            if (level.isUnlocked) {
              onLevelSelect(level);
            }
          }}
        >
          {!level.isUnlocked
            ? "Locked"
            : level.isCompleted
            ? "Play Again"
            : "Start Level"}
        </Button>
      </CardActions>
    </Card>
  );
};

interface LevelSelectorProps {
  levels: Level[];
  onLevelSelect: (level: Level) => void;
  currentLevel?: Level;
}

const LevelSelector: React.FC<LevelSelectorProps> = ({
  levels,
  onLevelSelect,
  currentLevel,
}) => {
  const completedCount = levels.filter((l) => l.isCompleted).length;
  const totalStars = levels.reduce((sum, l) => sum + l.stars, 0);
  const maxStars = levels.length * 3;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Stats */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Select Level
        </Typography>

        <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Flag color="primary" />
            <Typography variant="body1">
              {completedCount}/{levels.length} Completed
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Star color="warning" />
            <Typography variant="body1">
              {totalStars}/{maxStars} Stars
            </Typography>
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ width: "100%", mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={(completedCount / levels.length) * 100}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      </Box>

      {/* Level Grid */}
      <Grid container spacing={3}>
        {levels.map((level) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={level.id}>
            <LevelCard level={level} onLevelSelect={onLevelSelect} />
          </Grid>
        ))}
      </Grid>

      {/* Current Level Indicator */}
      {currentLevel && (
        <Box sx={{ mt: 3, p: 2, bgcolor: "primary.50", borderRadius: 2 }}>
          <Typography variant="body2" color="primary">
            Currently playing: <strong>{currentLevel.name}</strong>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default LevelSelector;
