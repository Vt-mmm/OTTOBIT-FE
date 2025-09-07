/**
 * Level Map Selector Component
 * Combines Level selection functionality with backend Map management
 */

import React, { useEffect, useState, useMemo } from "react";
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
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Lock,
  CheckCircle,
  PlayArrow,
  Star,
  Timer,
  Flag,
  Code,
  Loop,
  Psychology,
} from "@mui/icons-material";
import { usePhaserContext } from "../context/PhaserContext";
import { MapResult } from "../types/map";

// Define Level interface based on MapResult and additional game logic
interface LevelData {
  id: string;
  name: string;
  description: string;
  mapKey: string;
  mapResult: MapResult;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  objectives: string[];
  recommendedBlocks: string[];
  category: "basic" | "boolean" | "forloop";
  order: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  bestScore?: number;
  bestTime?: number;
  stars: number; // 0-3 stars
}

interface LevelCardProps {
  level: LevelData;
  onLevelSelect: (level: LevelData) => void;
  isLoading?: boolean;
}

const LevelCard: React.FC<LevelCardProps> = ({
  level,
  onLevelSelect,
  isLoading,
}) => {
  const getDifficultyColor = (difficulty: LevelData["difficulty"]) => {
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

  const getDifficultyLabel = (difficulty: LevelData["difficulty"]) => {
    switch (difficulty) {
      case "beginner":
        return "Cơ bản";
      case "intermediate":
        return "Trung cấp";
      case "advanced":
        return "Nâng cao";
      case "expert":
        return "Chuyên gia";
      default:
        return "Không xác định";
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
        cursor: level.isUnlocked && !isLoading ? "pointer" : "not-allowed",
        transition: "all 0.2s ease-in-out",
        "&:hover":
          level.isUnlocked && !isLoading
            ? {
                transform: "translateY(-4px)",
                boxShadow: 3,
              }
            : {},
      }}
      onClick={() => level.isUnlocked && !isLoading && onLevelSelect(level)}
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
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label={getDifficultyLabel(level.difficulty)}
              color={getDifficultyColor(level.difficulty)}
              size="small"
            />
            <Chip
              label={`Map ${level.order}`}
              variant="outlined"
              size="small"
            />
          </Box>
        </Box>

        {/* Description */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {level.description}
        </Typography>

        {/* Map Info */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 1, display: "block" }}
        >
          Key: {level.mapKey} • Category: {level.mapResult.mapCategoryName}
        </Typography>

        {/* Stars Rating */}
        {level.isCompleted && (
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Rating value={level.stars} max={3} size="small" readOnly />
            <Typography variant="caption" sx={{ ml: 1 }}>
              {level.stars}/3 sao
            </Typography>
          </Box>
        )}

        {/* Best Stats */}
        {level.isCompleted && (level.bestTime || level.bestScore) && (
          <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
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
          Mục tiêu:
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
              +{level.objectives.length - 2} thêm...
            </Typography>
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant={level.isCompleted ? "outlined" : "contained"}
          startIcon={
            !level.isUnlocked ? (
              <Lock />
            ) : isLoading ? (
              <CircularProgress size={16} />
            ) : (
              <PlayArrow />
            )
          }
          disabled={!level.isUnlocked || isLoading}
          onClick={(e) => {
            e.stopPropagation();
            if (level.isUnlocked && !isLoading) {
              onLevelSelect(level);
            }
          }}
        >
          {!level.isUnlocked
            ? "Khóa"
            : isLoading
            ? "Đang tải..."
            : level.isCompleted
            ? "Chơi lại"
            : "Bắt đầu"}
        </Button>
      </CardActions>
    </Card>
  );
};

interface LevelMapSelectorProps {
  onLevelSelect: (level: LevelData) => void;
  currentLevel?: LevelData;
}

const LevelMapSelector: React.FC<LevelMapSelectorProps> = ({
  onLevelSelect,
  currentLevel,
}) => {
  const { lessonMaps, isLoadingMaps, mapError, fetchLessonMaps } =
    usePhaserContext();

  const [currentTab, setCurrentTab] = useState(0);
  const [levels, setLevels] = useState<LevelData[]>([]);

  // Load lesson maps on mount
  useEffect(() => {
    if (!lessonMaps && !isLoadingMaps) {
      fetchLessonMaps();
    }
  }, [lessonMaps, isLoadingMaps]); // Loại bỏ fetchLessonMaps khỏi dependency để tránh infinite loop

  // Convert backend maps to level data
  const processedLevels = useMemo(() => {
    if (!lessonMaps) return [];

    if (!lessonMaps.mapsByType) {
      return [];
    }

    const levelData: LevelData[] = [];

    // Process maps by type
    Object.entries(lessonMaps.mapsByType).forEach(([, maps]) => {
      const mapsArray = maps as MapResult[];

      if (!mapsArray || mapsArray.length === 0) return;

      mapsArray.forEach((mapResult) => {
        // Extract category and number from mapKey (e.g., "basic1" -> category: "basic", number: 1)
        const mapKey = mapResult.key;

        const match = mapKey.match(/^([a-z]+)(\d+)$/);
        if (!match) {
          return;
        }

        const [, categoryStr, numberStr] = match;
        const order = parseInt(numberStr);

        // Map categoryStr to our internal category system
        let category: "basic" | "boolean" | "forloop";
        if (categoryStr === "basic") {
          category = "basic";
        } else if (categoryStr === "boolean") {
          category = "boolean";
        } else if (categoryStr === "forloop") {
          category = "forloop";
        } else if (categoryStr === "variable") {
          // Map variable to boolean for now
          category = "boolean";
        } else if (categoryStr === "conditional") {
          // Map conditional to boolean for now
          category = "boolean";
        } else if (categoryStr === "function") {
          // Map function to forloop for now
          category = "forloop";
        } else if (categoryStr === "whileloop" || categoryStr === "repeat") {
          // Map other loops to forloop
          category = "forloop";
        } else {
          return; // Skip unknown categories
        }

        // Create level configuration based on category
        let name = `${
          categoryStr.charAt(0).toUpperCase() + categoryStr.slice(1)
        } ${order}`;
        let description = "";
        let objectives: string[] = [];
        let recommendedBlocks: string[] = [];
        let difficulty: LevelData["difficulty"] = "beginner";

        switch (category) {
          case "basic":
            description = `Học cách điều khiển robot cơ bản - Map ${order}`;
            objectives = [
              "Di chuyển robot đến vị trí đích",
              "Sử dụng các khối lệnh cơ bản",
              "Thu thập pin theo yêu cầu",
            ];
            recommendedBlocks = [
              "ottobit_move_forward",
              "ottobit_rotate",
              "ottobit_collect",
            ];
            difficulty =
              order <= 3
                ? "beginner"
                : order <= 6
                ? "intermediate"
                : "advanced";
            break;
          case "boolean":
            name = `Logic Boolean ${order}`;
            description = `Học cách sử dụng logic điều kiện - Map ${order}`;
            objectives = [
              "Sử dụng điều kiện if/else",
              "Kiểm tra trạng thái môi trường",
              "Đưa ra quyết định thông minh",
            ];
            recommendedBlocks = [
              "ottobit_if",
              "ottobit_comparison",
              "ottobit_sensor",
            ];
            difficulty = order <= 3 ? "intermediate" : "advanced";
            break;
          case "forloop":
            name = `Vòng lặp ${order}`;
            description = `Học cách sử dụng vòng lặp hiệu quả - Map ${order}`;
            objectives = [
              "Sử dụng vòng lặp for",
              "Tối ưu hóa code với lặp",
              "Thực hiện nhiều hành động",
            ];
            recommendedBlocks = [
              "ottobit_repeat",
              "ottobit_for",
              "ottobit_variable",
            ];
            difficulty =
              order <= 3 ? "intermediate" : order <= 6 ? "advanced" : "expert";
            break;
        }

        // Calculate unlock status (simplified logic)
        const isFirstLevel = category === "basic" && order === 1;
        const isUnlocked = isFirstLevel; // TODO: Implement proper unlock logic

        levelData.push({
          id: `${category}-${order}`,
          name,
          description,
          mapKey: mapResult.key,
          mapResult,
          difficulty,
          objectives,
          recommendedBlocks,
          category: category as "basic" | "boolean" | "forloop",
          order,
          isUnlocked,
          isCompleted: false, // TODO: Load from progress
          stars: 0,
        });
      });
    });

    // Sort by category priority and order
    const categoryPriority = { basic: 1, boolean: 2, forloop: 3 };
    const sortedLevels = levelData.sort((a, b) => {
      if (categoryPriority[a.category] !== categoryPriority[b.category]) {
        return categoryPriority[a.category] - categoryPriority[b.category];
      }
      return a.order - b.order;
    });

    return sortedLevels;
  }, [lessonMaps]);

  useEffect(() => {
    setLevels(processedLevels);
  }, [processedLevels]);

  // Handle level selection
  const handleLevelSelect = (level: LevelData) => {
    // Switch to studio view first, then load map after Phaser is ready
    onLevelSelect(level);
  };

  // Filter levels by category
  const basicLevels = levels.filter((l) => l.category === "basic");
  const booleanLevels = levels.filter((l) => l.category === "boolean");
  const forloopLevels = levels.filter((l) => l.category === "forloop");

  const tabLevels = [basicLevels, booleanLevels, forloopLevels];
  const currentLevels = tabLevels[currentTab] || [];

  // Calculate stats for current tab
  const completedCount = currentLevels.filter((l) => l.isCompleted).length;
  const totalStars = currentLevels.reduce((sum, l) => sum + l.stars, 0);
  const maxStars = currentLevels.length * 3;

  if (isLoadingMaps) {
    return (
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Đang tải danh sách maps...</Typography>
      </Box>
    );
  }

  if (mapError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Lỗi khi tải maps: {mapError}
        </Alert>
        <Button variant="contained" onClick={() => fetchLessonMaps()}>
          Thử lại
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom>
        Chọn Cấp Độ
      </Typography>

      {/* Category Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
        >
          <Tab
            icon={<Code />}
            label={`Cơ bản (${basicLevels.length})`}
            iconPosition="start"
          />
          <Tab
            icon={<Psychology />}
            label={`Logic (${booleanLevels.length})`}
            iconPosition="start"
          />
          <Tab
            icon={<Loop />}
            label={`Vòng lặp (${forloopLevels.length})`}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Stats for current category */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Flag color="primary" />
            <Typography variant="body1">
              {completedCount}/{currentLevels.length} Hoàn thành
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Star color="warning" />
            <Typography variant="body1">
              {totalStars}/{maxStars} Sao
            </Typography>
          </Box>
        </Box>

        {/* Progress Bar */}
        {currentLevels.length > 0 && (
          <LinearProgress
            variant="determinate"
            value={(completedCount / currentLevels.length) * 100}
            sx={{ height: 8, borderRadius: 4 }}
          />
        )}
      </Box>

      {/* Level Grid */}
      {currentLevels.length > 0 ? (
        <Grid container spacing={3}>
          {currentLevels.map((level) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={level.id}>
              <LevelCard
                level={level}
                onLevelSelect={handleLevelSelect}
                isLoading={false}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info">
          Không tìm thấy level nào trong danh mục này.
        </Alert>
      )}

      {/* Current Level Indicator */}
      {currentLevel && (
        <Box sx={{ mt: 3, p: 2, bgcolor: "primary.50", borderRadius: 2 }}>
          <Typography variant="body2" color="primary">
            Đang chơi: <strong>{currentLevel.name}</strong> (
            {currentLevel.mapKey})
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default LevelMapSelector;
export type { LevelData };
