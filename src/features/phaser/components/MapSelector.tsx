/**
 * Map Selector Component
 * Allows users to select and load maps from backend via keymap
 */

import React, { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RefreshIcon from "@mui/icons-material/Refresh";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { usePhaserContext } from "../context/PhaserContext";
import { MapType, MapResult } from "../types/map";

export function MapSelector() {
  const {
    // State
    currentMap,
    lessonMaps,
    isLoadingMaps,
    mapError,
    isReady,
    isConnected,

    // Actions
    loadMap,
    loadNextMap,
    loadPreviousMap,
    fetchLessonMaps,
    refreshLessonMaps,
    clearMapError,

    // Helpers
    getMapNavigationInfo,
  } = usePhaserContext();

  const [selectedMapKey, setSelectedMapKey] = useState<string>("");
  const [expandedType, setExpandedType] = useState<string | false>("0"); // Default expand Basic (MapType.BASIC = 0)

  // Fetch lesson maps on mount
  useEffect(() => {
    if (!lessonMaps && !isLoadingMaps) {
      fetchLessonMaps();
    }
  }, [lessonMaps, isLoadingMaps, fetchLessonMaps]);

  // Handle map selection
  const handleMapSelection = async (mapKey: string) => {
    setSelectedMapKey(mapKey);
    clearMapError();

    try {
      await loadMap(mapKey);
    } catch (error) {
      console.error("Error loading map:", error);
    }
  };

  // Handle accordion expansion
  const handleAccordionChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedType(isExpanded ? panel : false);
    };

  // Get map type name
  const getMapTypeName = (mapType: MapType) => {
    switch (mapType) {
      case MapType.BASIC:
        return "Cơ bản";
      case MapType.INTERMEDIATE:
        return "Trung cấp";
      case MapType.ADVANCED:
        return "Nâng cao";
      case MapType.CHALLENGE:
        return "Thách thức";
      default:
        return "Không xác định";
    }
  };

  // Get map type color
  const getMapTypeColor = (mapType: MapType) => {
    switch (mapType) {
      case MapType.BASIC:
        return "success";
      case MapType.INTERMEDIATE:
        return "warning";
      case MapType.ADVANCED:
        return "error";
      case MapType.CHALLENGE:
        return "secondary";
      default:
        return "default";
    }
  };

  // Navigation info
  const navInfo = getMapNavigationInfo();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Chọn Map từ Backend
      </Typography>

      {/* Connection Status */}
      <Box sx={{ mb: 2 }}>
        <Chip
          label={isConnected && isReady ? "Đã kết nối" : "Chưa kết nối"}
          color={isConnected && isReady ? "success" : "error"}
          size="small"
          sx={{ mr: 1 }}
        />
        <Chip
          label={`Map hiện tại: ${currentMap.mapKey || "Chưa có"}`}
          color={currentMap.mapKey ? "primary" : "default"}
          size="small"
        />
      </Box>

      {/* Error Display */}
      {mapError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearMapError}>
          {mapError}
        </Alert>
      )}

      {/* Loading */}
      {isLoadingMaps && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <CircularProgress size={24} />
          <Typography sx={{ ml: 1 }}>Đang tải danh sách map...</Typography>
        </Box>
      )}

      {/* Map Navigation */}
      {currentMap.mapKey && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Điều hướng Map
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<NavigateBeforeIcon />}
              onClick={loadPreviousMap}
              disabled={!navInfo.hasPrevious || isLoadingMaps}
            >
              Trước
            </Button>
            <Typography variant="body2" sx={{ mx: 1 }}>
              {navInfo.currentIndex} / {navInfo.totalMaps}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              endIcon={<NavigateNextIcon />}
              onClick={loadNextMap}
              disabled={!navInfo.hasNext || isLoadingMaps}
            >
              Tiếp
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={refreshLessonMaps}
              disabled={isLoadingMaps}
            >
              Làm mới
            </Button>
          </Box>
        </Box>
      )}

      {/* Lesson Maps by Type */}
      {lessonMaps && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Maps theo cấp độ
          </Typography>

          {Object.entries(lessonMaps).map(([typeKey, maps]) => {
            const mapsArray = maps as MapResult[];
            if (!mapsArray || mapsArray.length === 0) return null;

            const mapType = parseInt(typeKey) as MapType;
            const typeName = getMapTypeName(mapType);
            const typeColor = getMapTypeColor(mapType);

            return (
              <Accordion
                key={typeKey}
                expanded={expandedType === typeKey}
                onChange={handleAccordionChange(typeKey)}
                sx={{ mb: 1 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip label={typeName} color={typeColor} size="small" />
                    <Typography>({mapsArray.length} maps)</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {mapsArray.map((map) => (
                      <Grid item xs={12} sm={6} md={4} key={map.key}>
                        <Card
                          variant={
                            currentMap.mapKey === map.key
                              ? "outlined"
                              : "elevation"
                          }
                          sx={{
                            cursor: "pointer",
                            border:
                              currentMap.mapKey === map.key ? 2 : undefined,
                            borderColor:
                              currentMap.mapKey === map.key
                                ? "primary.main"
                                : undefined,
                          }}
                        >
                          <CardContent sx={{ pb: 1 }}>
                            <Typography variant="subtitle2" noWrap>
                              Map {map.index + 1}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                            >
                              Key: {map.key}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {map.mapCategoryName}
                            </Typography>
                          </CardContent>
                          <CardActions sx={{ pt: 0 }}>
                            <Button
                              size="small"
                              startIcon={<PlayArrowIcon />}
                              onClick={() => handleMapSelection(map.key)}
                              disabled={
                                !isConnected || !isReady || isLoadingMaps
                              }
                              variant={
                                currentMap.mapKey === map.key
                                  ? "contained"
                                  : "text"
                              }
                            >
                              {currentMap.mapKey === map.key
                                ? "Đang chọn"
                                : "Chọn"}
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}

      {/* Manual Map Key Input */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Hoặc nhập Map Key trực tiếp
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Map Key</InputLabel>
            <Select
              value={selectedMapKey}
              onChange={(e) => setSelectedMapKey(e.target.value)}
              label="Map Key"
            >
              {lessonMaps &&
                Object.values(lessonMaps)
                  .flat()
                  .filter((map): map is MapResult => Boolean(map))
                  .map((map) => (
                    <MenuItem key={map.key} value={map.key}>
                      {map.key} (Map {map.index + 1})
                    </MenuItem>
                  ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            size="small"
            onClick={() => handleMapSelection(selectedMapKey)}
            disabled={
              !selectedMapKey || !isConnected || !isReady || isLoadingMaps
            }
          >
            Load Map
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
