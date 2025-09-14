import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Tabs,
  Tab,
  Tooltip,
  InputAdornment,
  Divider,
} from "@mui/material";
import { useState } from "react";
import { MapAsset } from "common/models";
import { getAssetsByCategory } from "./mapAssets.config";
import { THEME_COLORS } from "./theme.config";
import DeleteIcon from "@mui/icons-material/Delete";
import CropFreeIcon from "@mui/icons-material/CropFree";
import SearchIcon from "@mui/icons-material/Search";

interface WorkspaceSectionProps {
  selectedAsset: string;
  onAssetSelect: (assetId: string) => void;
  mapName: string;
  onMapNameChange: (name: string) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box hidden={value !== index} sx={{ pt: 1 }}>
      {value === index && children}
    </Box>
  );
}

export default function WorkspaceSection({
  selectedAsset,
  onAssetSelect,
  mapName,
  onMapNameChange,
}: WorkspaceSectionProps) {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Filter assets based on search
  const filterAssets = (assets: MapAsset[]) => {
    if (!searchTerm) return assets;
    return assets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderAssetButton = (asset: MapAsset) => {
    const isSelected = selectedAsset === asset.id;
    const isEraser = asset.id === "eraser";
    const isEmpty = asset.id === "empty";

    const handleDragStart = (e: React.DragEvent) => {
      e.dataTransfer.setData("text/plain", asset.id);
      e.dataTransfer.effectAllowed = "copy";
    };

    return (
      <Tooltip
        key={asset.id}
        title={asset.description || asset.name}
        placement="right"
      >
        <Box
          draggable={!isEraser && !isEmpty} // Don't allow dragging eraser/empty
          onDragStart={handleDragStart}
          onClick={() => onAssetSelect(asset.id)}
          sx={{
            width: "100%",
            aspectRatio: "1/1",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.25,
            p: 0.5,
            borderRadius: 0.5,
            cursor: "pointer",
            border: `1.5px solid ${
              isSelected ? THEME_COLORS.primary : "transparent"
            }`,
            bgcolor: isSelected ? `${THEME_COLORS.primary}15` : "transparent",
            transition: "all 0.15s",
            "&:hover": {
              bgcolor: isSelected
                ? `${THEME_COLORS.primary}20`
                : `${THEME_COLORS.hover}50`,
              border: `1.5px solid ${THEME_COLORS.primary}`,
            },
          }}
        >
          {asset.imagePath ? (
            <img
              src={asset.imagePath}
              alt={asset.name}
              style={{
                width: 28,
                height: 28,
                imageRendering: "pixelated",
              }}
            />
          ) : isEmpty ? (
            <CropFreeIcon sx={{ fontSize: 28, color: "#9E9E9E" }} />
          ) : isEraser ? (
            <DeleteIcon sx={{ fontSize: 28, color: THEME_COLORS.error }} />
          ) : null}
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.65rem",
              textAlign: "center",
              lineHeight: 1,
              color: isSelected
                ? THEME_COLORS.primary
                : THEME_COLORS.text.secondary,
              fontWeight: isSelected ? 600 : 400,
            }}
          >
            {asset.name}
          </Typography>
        </Box>
      </Tooltip>
    );
  };

  return (
    <Paper
      sx={{
        p: 1.5,
        height: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        bgcolor: THEME_COLORS.surface,
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 1,
          fontWeight: 600,
          color: THEME_COLORS.text.primary,
          fontSize: "0.95rem",
        }}
      >
        Workspace
      </Typography>

      {/* Map Name Input */}
      <TextField
        fullWidth
        label="Tên map"
        value={mapName}
        onChange={(e) => onMapNameChange(e.target.value)}
        size="small"
        sx={{
          mb: 1.5,
          "& .MuiOutlinedInput-root": {
            "&.Mui-focused fieldset": {
              borderColor: THEME_COLORS.primary,
            },
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: THEME_COLORS.primary,
          },
        }}
      />

      {/* Search Field */}
      <TextField
        fullWidth
        placeholder="Tìm kiếm asset..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        size="small"
        sx={{ mb: 1 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon
                sx={{ fontSize: 18, color: THEME_COLORS.text.secondary }}
              />
            </InputAdornment>
          ),
        }}
      />

      <Divider sx={{ mb: 1 }} />

      {/* Asset Categories Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 1,
          minHeight: 32,
          "& .MuiTab-root": {
            color: THEME_COLORS.text.secondary,
            fontSize: "0.75rem",
            minHeight: 32,
            py: 0.5,
            px: 1,
            textTransform: "none",
            whiteSpace: "nowrap",
          },
          "& .Mui-selected": {
            color: THEME_COLORS.primary,
          },
          "& .MuiTabs-indicator": {
            backgroundColor: THEME_COLORS.primary,
            height: 2,
          },
          "& .MuiTabs-scrollButtons": {
            "&.Mui-disabled": {
              opacity: 0.3,
            },
          },
        }}
      >
        <Tab label="Địa hình" />
        <Tab label="Robot" />
        <Tab label="Vật phẩm" />
        <Tab label="Chướng ngại" />
        <Tab label="Công cụ" />
      </Tabs>

      {/* Scrollable content area */}
      <Box sx={{ flexGrow: 1, overflow: "auto", pr: 1 }}>
        {/* Terrain Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 0.5,
            }}
          >
            {filterAssets(getAssetsByCategory("terrain")).map(
              renderAssetButton
            )}
          </Box>
        </TabPanel>

        {/* Robot Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 0.5,
            }}
          >
            {filterAssets(getAssetsByCategory("robot")).map(renderAssetButton)}
          </Box>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 1,
              color: THEME_COLORS.text.secondary,
              fontSize: "0.7rem",
            }}
          >
            * Chỉ được đặt 1 robot trên map
          </Typography>
        </TabPanel>

        {/* Items Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 0.5,
            }}
          >
            {filterAssets(getAssetsByCategory("item")).map(renderAssetButton)}
          </Box>
        </TabPanel>

        {/* Objects Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 0.5,
            }}
          >
            {filterAssets(getAssetsByCategory("object")).map(renderAssetButton)}
          </Box>
        </TabPanel>

        {/* Tools Tab */}
        <TabPanel value={tabValue} index={4}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 0.5,
            }}
          >
            {filterAssets(getAssetsByCategory("tool")).map(renderAssetButton)}
          </Box>
        </TabPanel>
      </Box>

      {/* Quick Templates */}
      <Divider sx={{ mt: 2, mb: 2 }} />
      <Box>
        <Typography
          variant="subtitle2"
          sx={{ mb: 1, color: THEME_COLORS.text.primary, fontWeight: 600 }}
        >
          Mẫu nhanh
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onAssetSelect("grass")}
            sx={{
              justifyContent: "flex-start",
              borderColor: THEME_COLORS.primary,
              color: THEME_COLORS.primary,
              fontSize: "0.75rem",
            }}
          >
            Fill toàn bộ cỏ
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onAssetSelect("road_h")}
            sx={{
              justifyContent: "flex-start",
              borderColor: THEME_COLORS.primary,
              color: THEME_COLORS.primary,
              fontSize: "0.75rem",
            }}
          >
            Vẽ đường ngang
          </Button>
        </Box>
      </Box>

      {/* Instructions */}
      <Box
        sx={{
          mt: 2,
          p: 1.5,
          bgcolor: THEME_COLORS.background,
          borderRadius: 1,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ mb: 1, color: THEME_COLORS.text.primary, fontWeight: 600 }}
        >
          Hướng dẫn
        </Typography>
        <Typography
          variant="caption"
          sx={{ display: "block", mb: 0.5, color: THEME_COLORS.text.secondary }}
        >
          • Chọn asset từ danh sách bên trên
        </Typography>
        <Typography
          variant="caption"
          sx={{ display: "block", mb: 0.5, color: THEME_COLORS.text.secondary }}
        >
          • Click để đặt asset, kéo để vẽ liên tục
        </Typography>
        <Typography
          variant="caption"
          sx={{ display: "block", mb: 0.5, color: THEME_COLORS.text.secondary }}
        >
          • Click lại asset đã đặt để xóa
        </Typography>
        <Typography
          variant="caption"
          sx={{ display: "block", mb: 0.5, color: THEME_COLORS.text.secondary }}
        >
          • Robot chỉ được đặt 1 con/map
        </Typography>
        <Typography
          variant="caption"
          sx={{ display: "block", color: THEME_COLORS.text.secondary }}
        >
          • Items có thể xếp chồng nhiều cái
        </Typography>
      </Box>
    </Paper>
  );
}
