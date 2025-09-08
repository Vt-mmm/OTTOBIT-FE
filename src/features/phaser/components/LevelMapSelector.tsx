/**
 * Level Map Selector Component V2
 * Modern layout inspired by Warp terminal
 */

import React, { useEffect, useState, useMemo } from "react";
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
import {
  Lock,
  Code,
  Loop,
  Psychology,
  Download,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import { usePhaserContext } from "../context/PhaserContext";
import { MapResult } from "../types/map";
import { getLevelThumbnail } from "../config/levelThumbnails";

// Level interface
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
  stars: number;
}

interface LevelMapSelectorProps {
  onLevelSelect: (level: LevelData) => void;
  currentLevel?: LevelData;
}

const LevelMapSelector: React.FC<LevelMapSelectorProps> = ({
  onLevelSelect,
}) => {
  const { lessonMaps, isLoadingMaps, mapError, fetchLessonMaps } =
    usePhaserContext();
  const [currentTab, setCurrentTab] = useState(0);
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [completedLevels, setCompletedLevels] = useState<string[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load lesson maps on mount and get completed levels from localStorage
  useEffect(() => {
    if (!lessonMaps && !isLoadingMaps) {
      fetchLessonMaps();
    }
    // Load completed levels from localStorage
    const saved = localStorage.getItem("completedLevels");
    if (saved) {
      setCompletedLevels(JSON.parse(saved));
    }
  }, [lessonMaps, isLoadingMaps, fetchLessonMaps]);

  // Convert backend maps to level data
  const processedLevels = useMemo(() => {
    if (!lessonMaps?.mapsByType) return [];

    const levelData: LevelData[] = [];
    Object.entries(lessonMaps.mapsByType).forEach(([, maps]) => {
      const mapsArray = maps as MapResult[];
      if (!mapsArray || mapsArray.length === 0) return;

      mapsArray.forEach((mapResult) => {
        const mapKey = mapResult.key;
        const match = mapKey.match(/^([a-z]+)(\d+)$/);
        if (!match) return;

        const [, categoryStr, numberStr] = match;
        const order = parseInt(numberStr);

        let category: "basic" | "boolean" | "forloop";
        if (["basic", "boolean", "forloop"].includes(categoryStr)) {
          category = categoryStr as "basic" | "boolean" | "forloop";
        } else {
          return;
        }

        const name = `${
          categoryStr.charAt(0).toUpperCase() + categoryStr.slice(1)
        } ${order}`;
        const description = `Học cách điều khiển robot - Map ${order}`;
        const objectives = ["Di chuyển robot đến vị trí đích"];
        const recommendedBlocks = ["forward", "turn"];
        const difficulty: LevelData["difficulty"] =
          order <= 2 ? "beginner" : order <= 4 ? "intermediate" : "advanced";

        // Smart unlock logic:
        // 1. First level is always unlocked
        // 2. Next level unlocks when previous is completed
        // 3. For testing, you can unlock all by setting UNLOCK_ALL = true
        const UNLOCK_ALL = true; // Set to false for production

        let isUnlocked = false;
        if (UNLOCK_ALL) {
          isUnlocked = true;
        } else {
          // Progressive unlock logic
          if (category === "basic" && order === 1) {
            isUnlocked = true; // First level always unlocked
          } else if (category === "basic") {
            // Unlock if previous basic level is completed
            const previousLevelId = `${category}-${order - 1}`;
            isUnlocked = completedLevels.includes(previousLevelId);
          } else if (category === "boolean" && order === 1) {
            // Unlock first boolean if at least 3 basic levels completed
            const basicCompleted = completedLevels.filter((id) =>
              id.startsWith("basic-")
            ).length;
            isUnlocked = basicCompleted >= 3;
          } else if (category === "boolean") {
            // Unlock next boolean if previous is completed
            const previousLevelId = `${category}-${order - 1}`;
            isUnlocked = completedLevels.includes(previousLevelId);
          } else if (category === "forloop" && order === 1) {
            // Unlock first forloop if at least 2 boolean levels completed
            const booleanCompleted = completedLevels.filter((id) =>
              id.startsWith("boolean-")
            ).length;
            isUnlocked = booleanCompleted >= 2;
          } else if (category === "forloop") {
            // Unlock next forloop if previous is completed
            const previousLevelId = `${category}-${order - 1}`;
            isUnlocked = completedLevels.includes(previousLevelId);
          }
        }

        const isCompleted = completedLevels.includes(`${category}-${order}`);

        levelData.push({
          id: `${category}-${order}`,
          name,
          description,
          mapKey: mapResult.key,
          mapResult,
          difficulty,
          objectives,
          recommendedBlocks,
          category,
          order,
          isUnlocked,
          isCompleted,
          stars: isCompleted ? Math.floor(Math.random() * 3) + 1 : 0,
        });
      });
    });

    const categoryPriority = { basic: 1, boolean: 2, forloop: 3 };
    return levelData.sort((a, b) => {
      if (categoryPriority[a.category] !== categoryPriority[b.category]) {
        return categoryPriority[a.category] - categoryPriority[b.category];
      }
      return a.order - b.order;
    });
  }, [lessonMaps, completedLevels]);

  useEffect(() => {
    setLevels(processedLevels);
  }, [processedLevels]);

  const handleLevelSelect = (level: LevelData) => {
    onLevelSelect(level);
  };

  const { basicLevels, booleanLevels, forloopLevels } = useMemo(
    () => ({
      basicLevels: levels.filter((l) => l.category === "basic"),
      booleanLevels: levels.filter((l) => l.category === "boolean"),
      forloopLevels: levels.filter((l) => l.category === "forloop"),
    }),
    [levels]
  );

  const currentLevels = useMemo(() => {
    const tabLevels = [basicLevels, booleanLevels, forloopLevels];
    return tabLevels[currentTab] || [];
  }, [basicLevels, booleanLevels, forloopLevels, currentTab]);

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
    <Box sx={{ minHeight: "100vh", background: "#ffffff" }}>
      {/* Hero Section - Clean Style */}
      <Box sx={{ background: "#f8f9fa", borderBottom: "1px solid #e0e0e0" }}>
        <Container maxWidth="xl">
          <Grid
            container
            sx={{ minHeight: "60vh", alignItems: "center", py: 6 }}
          >
            {/* Left Column - Content */}
            <Grid item xs={12} md={6}>
              <Box sx={{ pr: { md: 6 } }}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: "2.5rem", md: "3.5rem" },
                    fontWeight: 700,
                    color: "#2e3440",
                    lineHeight: 1.2,
                    mb: 3,
                  }}
                >
                  Lập trình
                  <br />
                  <Box component="span" sx={{ color: "#22c55e" }}>
                    robot thông minh
                  </Box>
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    color: "#5e6c84",
                    fontWeight: 400,
                    mb: 4,
                    fontSize: { xs: "1.1rem", md: "1.25rem" },
                    lineHeight: 1.6,
                  }}
                >
                  Học cách điều khiển robot qua các thử thách logic thú vị — tất
                  cả ngay trong trình duyệt.
                </Typography>

                <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => {
                      const firstUnlocked = currentLevels.find(
                        (l) => l.isUnlocked
                      );
                      if (firstUnlocked) handleLevelSelect(firstUnlocked);
                    }}
                    sx={{
                      py: 1.8,
                      px: 4,
                      background:
                        "linear-gradient(45deg, #86efac 0%, #22c55e 100%)",
                      color: "white",
                      fontSize: "1rem",
                      fontWeight: 600,
                      borderRadius: "8px",
                      textTransform: "none",
                      boxShadow: "0 2px 8px rgba(34, 197, 94, 0.25)",
                      "&:hover": {
                        background:
                          "linear-gradient(45deg, #22c55e 0%, #86efac 100%)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 12px rgba(34, 197, 94, 0.35)",
                      },
                    }}
                  >
                    Bắt đầu học
                    <Download sx={{ ml: 1, fontSize: 20 }} />
                  </Button>
                </Box>
              </Box>
            </Grid>

            {/* Right Column - Terminal Preview */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  background: "#282c34",
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                  border: "1px solid #e0e0e0",
                }}
              >
                {/* Terminal Header */}
                <Box
                  sx={{
                    background: "#21252b",
                    p: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    borderBottom: "1px solid rgba(0,0,0,0.2)",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: "#ff5f57",
                      }}
                    />
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: "#ffbd2e",
                      }}
                    />
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: "#28ca42",
                      }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.5)",
                      ml: 1,
                      fontFamily: "monospace",
                    }}
                  >
                    ottobit-studio.js
                  </Typography>
                </Box>

                {/* Terminal Content */}
                <Box
                  sx={{
                    p: 3,
                    fontFamily: "'Fira Code', 'Consolas', monospace",
                    fontSize: "14px",
                    lineHeight: 1.6,
                  }}
                >
                  <Box sx={{ mb: 1 }}>
                    <span style={{ color: "#7c7c7c" }}>
                      // Chào mừng đến với Ottobit Studio!
                    </span>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <span style={{ color: "#c678dd" }}>const</span>
                    <span style={{ color: "#abb2bf" }}> robot </span>
                    <span style={{ color: "#56b6c2" }}>= </span>
                    <span style={{ color: "#c678dd" }}>new</span>
                    <span style={{ color: "#e06c75" }}> Robot</span>
                    <span style={{ color: "#abb2bf" }}>();</span>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <span style={{ color: "#c678dd" }}>const</span>
                    <span style={{ color: "#abb2bf" }}> mission </span>
                    <span style={{ color: "#56b6c2" }}>= </span>
                    <span style={{ color: "#c678dd" }}>await</span>
                    <span style={{ color: "#61afef" }}> getMission</span>
                    <span style={{ color: "#abb2bf" }}>();</span>
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <span style={{ color: "#7c7c7c" }}>
                      // Di chuyển robot đến đích
                    </span>
                  </Box>
                  <Box>
                    <span style={{ color: "#c678dd" }}>function</span>
                    <span style={{ color: "#61afef" }}> moveRobot</span>
                    <span style={{ color: "#e5c07b" }}>()</span>
                    <span style={{ color: "#abb2bf" }}> {"{"}</span>
                  </Box>
                  <Box sx={{ pl: 2 }}>
                    <span style={{ color: "#abb2bf" }}>robot.</span>
                    <span style={{ color: "#61afef" }}>moveForward</span>
                    <span style={{ color: "#e5c07b" }}>();</span>
                  </Box>
                  <Box sx={{ pl: 2 }}>
                    <span style={{ color: "#abb2bf" }}>robot.</span>
                    <span style={{ color: "#61afef" }}>turnRight</span>
                    <span style={{ color: "#e5c07b" }}>();</span>
                  </Box>
                  <Box sx={{ pl: 2 }}>
                    <span style={{ color: "#abb2bf" }}>robot.</span>
                    <span style={{ color: "#61afef" }}>moveForward</span>
                    <span style={{ color: "#e5c07b" }}>();</span>
                  </Box>
                  <Box sx={{ pl: 2, mb: 1 }}>
                    <span style={{ color: "#abb2bf" }}>robot.</span>
                    <span style={{ color: "#61afef" }}>collectGem</span>
                    <span style={{ color: "#e5c07b" }}>();</span>
                  </Box>
                  <span style={{ color: "#abb2bf" }}>{"}"}</span>

                  <Box sx={{ mt: 2 }}>
                    <span style={{ color: "#7c7c7c" }}>
                      // Chạy chương trình
                    </span>
                  </Box>
                  <Box>
                    <span style={{ color: "#61afef" }}>moveRobot</span>
                    <span style={{ color: "#e5c07b" }}>();</span>
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 18,
                        bgcolor: "#98c379",
                        animation: "blink 1s infinite",
                        "@keyframes blink": {
                          "0%, 50%": { opacity: 1 },
                          "51%, 100%": { opacity: 0 },
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Level Selection Section */}
      <Box sx={{ background: "#f8f9fa", py: 6 }}>
        <Container maxWidth="xl">
          {/* Section Title */}
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography
              variant="h3"
              sx={{ fontWeight: 700, mb: 1, color: "#2e3440" }}
            >
              Chọn bài học
            </Typography>
            <Typography variant="body1" sx={{ color: "#5e6c84" }}>
              Bắt đầu hành trình lập trình của bạn
            </Typography>
          </Box>

          {/* Virtual Tablet Container */}
          <Box
            sx={{
              maxWidth: 1200,
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
              // Top speaker grill - using child element for ambient glow instead
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
                minHeight: "600px",
                boxShadow:
                  "inset 0 0 30px rgba(0,0,0,0.15), inset 0 4px 20px rgba(0,0,0,0.08)",
                position: "relative",
                "&::before": {
                  // Screen protector / oleophobic coating
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
                  // Screen reflection glare
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
              {/* Sidebar */}
              <Box
                sx={{
                  width: {
                    xs: 0,
                    md: sidebarCollapsed ? 80 : 280,
                  },
                  display: { xs: "none", md: "flex" },
                  background: "#fafafa",
                  borderRight: "1px solid #e0e0e0",
                  p: sidebarCollapsed ? 2 : 3,
                  flexDirection: "column",
                  gap: sidebarCollapsed ? 1.5 : 2,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Toggle Button - Positioned on border between sidebar and main content */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    right: "0px",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow:
                      "0 12px 32px rgba(102, 126, 234, 0.4), 0 4px 16px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.8)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    zIndex: 100,
                    border: "3px solid white",
                    transform: "translate(50%, -50%)",
                    "&:hover": {
                      transform: "translate(50%, -50%) scale(1.15)",
                      boxShadow:
                        "0 16px 40px rgba(102, 126, 234, 0.5), 0 6px 20px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.9)",
                      background:
                        "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                    },
                    "&:active": {
                      transform: "translate(50%, -50%) scale(0.9)",
                      boxShadow:
                        "0 4px 12px rgba(102, 126, 234, 0.2), 0 1px 4px rgba(0,0,0,0.1)",
                    },
                  }}
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  {sidebarCollapsed ? (
                    <ChevronRight sx={{ color: "white", fontSize: 20 }} />
                  ) : (
                    <ChevronLeft sx={{ color: "white", fontSize: 20 }} />
                  )}
                </Box>
                {/* Sidebar Header */}
                <Box
                  sx={{
                    pb: sidebarCollapsed ? 1 : 2,
                    borderBottom: "2px solid #e8e8e8",
                    mb: sidebarCollapsed ? 1 : 2,
                    mt: sidebarCollapsed ? 4 : 0, // Push down to avoid status bar collision
                    textAlign: sidebarCollapsed ? "center" : "left",
                  }}
                >
                  {!sidebarCollapsed && (
                    <>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: "#2e3440",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        📚 Danh mục
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#9ca3af", mt: 0.5 }}
                      >
                        Chọn chủ đề để bắt đầu
                      </Typography>
                    </>
                  )}
                  {sidebarCollapsed && (
                    <Typography
                      sx={{
                        fontSize: "28px",
                        filter: "none",
                        opacity: 0.8,
                      }}
                    >
                      📚
                    </Typography>
                  )}
                </Box>

                {[
                  {
                    id: 0,
                    name: "Cơ Bản",
                    icon: <Code />,
                    count: basicLevels.length,
                    category: "basic",
                    color: "#667eea",
                  },
                  {
                    id: 1,
                    name: "Logic",
                    icon: <Psychology />,
                    count: booleanLevels.length,
                    category: "boolean",
                    color: "#FF6B6B",
                  },
                  {
                    id: 2,
                    name: "Vòng Lặp",
                    icon: <Loop />,
                    count: forloopLevels.length,
                    category: "forloop",
                    color: "#4ECDC4",
                  },
                ].map((tab) => (
                  <Box
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id)}
                    title={
                      sidebarCollapsed
                        ? `${tab.name} (${tab.count} bài học)`
                        : undefined
                    }
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: sidebarCollapsed
                        ? "center"
                        : "space-between",
                      p: sidebarCollapsed ? 2 : 2,
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      background:
                        currentTab === tab.id ? "white" : "transparent",
                      boxShadow:
                        currentTab === tab.id
                          ? "0 2px 8px rgba(0,0,0,0.08)"
                          : "none",
                      borderLeft: sidebarCollapsed
                        ? "none"
                        : currentTab === tab.id
                        ? `4px solid ${tab.color}`
                        : "4px solid transparent",
                      border:
                        sidebarCollapsed && currentTab === tab.id
                          ? `2px solid ${tab.color}`
                          : sidebarCollapsed
                          ? "2px solid transparent"
                          : "none",
                      "&:hover": {
                        background:
                          currentTab === tab.id ? "white" : "rgba(0,0,0,0.02)",
                        transform: sidebarCollapsed ? "scale(1.05)" : "none",
                      },
                    }}
                  >
                    {sidebarCollapsed ? (
                      // Collapsed view - icon only
                      <Box
                        sx={{
                          color: currentTab === tab.id ? tab.color : "#6b7280",
                          display: "flex",
                          alignItems: "center",
                          position: "relative",
                        }}
                      >
                        {tab.icon}
                        {currentTab === tab.id && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: "-4px",
                              right: "-4px",
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: tab.color,
                              animation: "pulse 2s infinite",
                              "@keyframes pulse": {
                                "0%": { boxShadow: `0 0 0 0 ${tab.color}40` },
                                "70%": {
                                  boxShadow: `0 0 0 4px ${tab.color}00`,
                                },
                                "100%": { boxShadow: `0 0 0 0 ${tab.color}00` },
                              },
                            }}
                          />
                        )}
                      </Box>
                    ) : (
                      // Expanded view - full content
                      <>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              color:
                                currentTab === tab.id ? tab.color : "#6b7280",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {tab.icon}
                          </Box>
                          <Box>
                            <Typography
                              sx={{
                                fontWeight: currentTab === tab.id ? 600 : 500,
                                color:
                                  currentTab === tab.id ? "#2e3440" : "#6b7280",
                                fontSize: "0.95rem",
                              }}
                            >
                              {tab.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#9ca3af" }}
                            >
                              {tab.count} bài học
                            </Typography>
                          </Box>
                        </Box>
                        {currentTab === tab.id && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: tab.color,
                              animation: "pulse 2s infinite",
                              "@keyframes pulse": {
                                "0%": { boxShadow: `0 0 0 0 ${tab.color}40` },
                                "70%": {
                                  boxShadow: `0 0 0 6px ${tab.color}00`,
                                },
                                "100%": { boxShadow: `0 0 0 0 ${tab.color}00` },
                              },
                            }}
                          />
                        )}
                      </>
                    )}
                  </Box>
                ))}

                {/* Divider */}
                {!sidebarCollapsed && (
                  <Box sx={{ my: 2, height: 1, background: "#e0e0e0" }} />
                )}

                {/* Stats - Only show when expanded */}
                {!sidebarCollapsed && (
                  <Box
                    sx={{
                      mt: "auto",
                      p: 2,
                      background: "white",
                      borderRadius: "12px",
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "#6b7280", display: "block", mb: 1 }}
                    >
                      Tiến độ học tập
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, color: "#22c55e" }}
                      >
                        0%
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                        0/
                        {basicLevels.length +
                          booleanLevels.length +
                          forloopLevels.length}{" "}
                        hoàn thành
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        mt: 1,
                        height: 4,
                        background: "#e5e7eb",
                        borderRadius: 2,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: "0%",
                          height: "100%",
                          background:
                            "linear-gradient(45deg, #86efac 0%, #22c55e 100%)",
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Main Content Area */}
              <Box
                sx={{
                  flex: 1,
                  p: 3,
                  pt: 5, // Account for status bar
                  overflowY: "auto",
                  maxHeight: "600px",
                  // Subtle scroll track styling
                  "&::-webkit-scrollbar": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "rgba(0,0,0,0.05)",
                    borderRadius: "3px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "rgba(0,0,0,0.2)",
                    borderRadius: "3px",
                    "&:hover": {
                      background: "rgba(0,0,0,0.3)",
                    },
                  },
                }}
              >
                {/* Mobile Category Tabs - Show only on mobile */}
                <Box
                  sx={{
                    display: { xs: "flex", md: "none" },
                    gap: 1,
                    mb: 3,
                    overflowX: "auto",
                    pb: 1,
                  }}
                >
                  {[
                    {
                      id: 0,
                      name: "Cơ Bản",
                      icon: <Code />,
                      count: basicLevels.length,
                    },
                    {
                      id: 1,
                      name: "Logic",
                      icon: <Psychology />,
                      count: booleanLevels.length,
                    },
                    {
                      id: 2,
                      name: "Vòng Lặp",
                      icon: <Loop />,
                      count: forloopLevels.length,
                    },
                  ].map((tab) => (
                    <Chip
                      key={tab.id}
                      icon={tab.icon}
                      label={`${tab.name} (${tab.count})`}
                      onClick={() => setCurrentTab(tab.id)}
                      sx={{
                        bgcolor: currentTab === tab.id ? "#22c55e" : "white",
                        color: currentTab === tab.id ? "white" : "#6b7280",
                        border: "1px solid",
                        borderColor:
                          currentTab === tab.id ? "#22c55e" : "#e5e7eb",
                        fontWeight: currentTab === tab.id ? 600 : 400,
                        "&:hover": {
                          bgcolor:
                            currentTab === tab.id ? "#22c55e" : "#f9fafb",
                        },
                      }}
                    />
                  ))}
                </Box>

                {/* Level Cards Grid */}
                {currentLevels.length > 0 ? (
                  <Grid container spacing={2}>
                    {currentLevels.map((level) => (
                      <Grid item xs={12} sm={6} lg={4} key={level.id}>
                        <Box
                          sx={{
                            position: "relative",
                            borderRadius: "12px",
                            overflow: "hidden",
                            cursor: level.isUnlocked
                              ? "pointer"
                              : "not-allowed",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            background:
                              level.category === "basic"
                                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                : level.category === "boolean"
                                ? "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)"
                                : "linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                            "&:hover": level.isUnlocked
                              ? {
                                  transform: "translateY(-6px) scale(1.02)",
                                  boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
                                }
                              : {},
                          }}
                          onClick={() =>
                            level.isUnlocked && handleLevelSelect(level)
                          }
                        >
                          {/* Thumbnail */}
                          <Box
                            sx={{
                              position: "relative",
                              height: 160,
                              background: `linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%), url('${getLevelThumbnail(
                                level.id,
                                level.category
                              )}') center/cover`,
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              p: 1.5,
                            }}
                          >
                            {/* Traffic light dots */}
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: "50%",
                                  bgcolor: "#ff5f57",
                                  border: "1px solid rgba(0,0,0,0.2)",
                                }}
                              />
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: "50%",
                                  bgcolor: "#ffbd2e",
                                  border: "1px solid rgba(0,0,0,0.2)",
                                }}
                              />
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: "50%",
                                  bgcolor: "#28ca42",
                                  border: "1px solid rgba(0,0,0,0.2)",
                                }}
                              />
                            </Box>

                            <Chip
                              label={
                                level.difficulty === "beginner"
                                  ? "Dễ"
                                  : level.difficulty === "intermediate"
                                  ? "Trung bình"
                                  : "Khó"
                              }
                              size="small"
                              sx={{
                                bgcolor: "rgba(255,255,255,0.9)",
                                color:
                                  level.category === "basic"
                                    ? "#667eea"
                                    : level.category === "boolean"
                                    ? "#FF6B6B"
                                    : "#4ECDC4",
                                fontWeight: 600,
                                fontSize: "0.75rem",
                              }}
                            />

                            {!level.isUnlocked && (
                              <Box
                                sx={{
                                  position: "absolute",
                                  inset: 0,
                                  background: "rgba(0,0,0,0.7)",
                                  backdropFilter: "blur(3px)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Lock
                                  sx={{
                                    fontSize: 40,
                                    color: "rgba(255,255,255,0.5)",
                                  }}
                                />
                              </Box>
                            )}
                          </Box>

                          {/* Content */}
                          <Box
                            sx={{
                              p: 2,
                              background: "white",
                            }}
                          >
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 600,
                                color: "#2e3440",
                                mb: 0.5,
                                fontSize: "1.1rem",
                              }}
                            >
                              {level.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#6b7280",
                                mb: 1.5,
                                minHeight: 36,
                                fontSize: "0.85rem",
                              }}
                            >
                              {level.description}
                            </Typography>

                            {/* Progress or status */}
                            {level.isCompleted && (
                              <Box sx={{ display: "flex", gap: 0.5, mb: 1.5 }}>
                                {[1, 2, 3].map((star) => (
                                  <Box
                                    key={star}
                                    sx={{
                                      color:
                                        star <= (level.stars || 0)
                                          ? "#fbbf24"
                                          : "#e5e7eb",
                                    }}
                                  >
                                    ★
                                  </Box>
                                ))}
                              </Box>
                            )}

                            <Button
                              fullWidth
                              variant="contained"
                              disabled={!level.isUnlocked}
                              sx={{
                                py: 1.2,
                                background: level.isUnlocked
                                  ? "linear-gradient(45deg, #86efac 0%, #22c55e 100%)"
                                  : "#e5e7eb",
                                color: level.isUnlocked ? "white" : "#9ca3af",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                textTransform: "none",
                                borderRadius: "8px",
                                boxShadow: level.isUnlocked
                                  ? "0 2px 8px rgba(34, 197, 94, 0.25)"
                                  : "none",
                                "&:hover": {
                                  background: level.isUnlocked
                                    ? "linear-gradient(45deg, #22c55e 0%, #86efac 100%)"
                                    : "#e5e7eb",
                                  transform: level.isUnlocked
                                    ? "translateY(-1px)"
                                    : "none",
                                  boxShadow: level.isUnlocked
                                    ? "0 4px 12px rgba(34, 197, 94, 0.35)"
                                    : "none",
                                },
                              }}
                            >
                              {!level.isUnlocked
                                ? "Khóa"
                                : level.isCompleted
                                ? "Chơi lại"
                                : "Bắt đầu"}
                            </Button>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
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
                        😭 Không có bài học nào
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#5e6c84" }}>
                        Vui lòng thử lại sau hoặc chọn danh mục khác
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LevelMapSelector;
export type { LevelData };
