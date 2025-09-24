import {
  Box,
  Paper,
  Typography,
  TextField,
  Tabs,
  Tab,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CropFreeIcon from "@mui/icons-material/CropFree";
import { useState } from "react";
import { MapAsset } from "common/models";
import { getAssetsByCategory } from "./mapAssets.config";
import { THEME_COLORS } from "./theme.config";

interface WorkspaceSectionLiteProps {
  selectedAsset: string;
  onAssetSelect: (assetId: string) => void;
}

export default function WorkspaceSectionLite({
  selectedAsset,
  onAssetSelect,
}: WorkspaceSectionLiteProps) {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const filterAssets = (assets: MapAsset[]) => {
    if (!searchTerm) return assets;
    return assets.filter(
      (a) =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const AssetGrid = ({ assets }: { assets: MapAsset[] }) => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 0.5,
        mt: 0.5,
      }}
    >
      {assets.map((asset) => {
        const isSelected = selectedAsset === asset.id;
        const isEmpty = asset.id === "empty";
        return (
          <Box
            key={asset.id}
            onClick={() => onAssetSelect(asset.id)}
            sx={{
              width: "100%",
              aspectRatio: "1/1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: 0.5,
              gap: 0.25,
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
              <Box
                component="img"
                src={asset.imagePath}
                alt={asset.name}
                sx={{ width: 28, height: 28, objectFit: "contain" }}
              />
            ) : isEmpty ? (
              <CropFreeIcon sx={{ fontSize: 28, color: "#9E9E9E" }} />
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
        );
      })}
    </Box>
  );

  return (
    <Paper
      sx={{
        p: 1.25,
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
        sx={{ mb: 1, fontWeight: 600, fontSize: "0.95rem" }}
      >
        Workspace
      </Typography>

      <TextField
        fullWidth
        placeholder="Search assets..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        size="small"
        sx={{ mb: 0.25 }}
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

      <Tabs
        value={tabValue}
        onChange={(_, v) => setTabValue(v)}
        variant="fullWidth"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          minHeight: 30,
          mb: 0.25,
          "& .MuiTab-root": { minHeight: 30, py: 0.25, fontSize: "0.8rem" },
          "& .MuiTabs-indicator": { height: 2, bgcolor: THEME_COLORS.primary },
        }}
      >
        <Tab label="Terrain" />
        <Tab label="Tools" />
      </Tabs>

      <Box sx={{ flexGrow: 1, overflow: "auto", pr: 1 }}>
        {tabValue === 0 && (
          <AssetGrid assets={filterAssets(getAssetsByCategory("terrain"))} />
        )}
        {tabValue === 1 && (
          <AssetGrid
            assets={filterAssets(
              getAssetsByCategory("tool").filter((a) => a.id !== "eraser")
            )}
          />
        )}
      </Box>

      {/* Guide */}
      <Box
        sx={{
          mt: 2,
          p: 1.25,
          bgcolor: THEME_COLORS.background,
          borderRadius: 1,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ mb: 1, color: THEME_COLORS.text.primary, fontWeight: 600 }}
        >
          Guide
        </Typography>
        <Typography
          variant="caption"
          sx={{ display: "block", mb: 0.5, color: THEME_COLORS.text.secondary }}
        >
          • Use Terrain to place tiles. Click to place, click-drag to paint
        </Typography>
        <Typography
          variant="caption"
          sx={{ display: "block", color: THEME_COLORS.text.secondary }}
        >
          • Use Tools → Empty Cell to clear a cell
        </Typography>
      </Box>
    </Paper>
  );
}
