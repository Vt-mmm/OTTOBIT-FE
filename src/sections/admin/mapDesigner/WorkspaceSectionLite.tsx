import {
  Box,
  Paper,
  Typography,
  TextField,
  Tabs,
  Tab,
  InputAdornment,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CropFreeIcon from "@mui/icons-material/CropFree";
import { useState } from "react";
import { MapAsset } from "common/models";
import { getAssetsByCategory } from "./mapAssets.config";
import { THEME_COLORS } from "./theme.config";
import useLocales from "hooks/useLocales";

interface WorkspaceSectionLiteProps {
  selectedAsset: string;
  onAssetSelect: (assetId: string) => void;
}

export default function WorkspaceSectionLite({
  selectedAsset,
  onAssetSelect,
}: WorkspaceSectionLiteProps) {
  const { translate } = useLocales();
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
        minHeight: "100%",
        maxHeight: "100%",
        overflow: "auto", // Allow scrolling if needed
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
          height: 24, // Fixed height like Challenge Designer
          flexShrink: 0, // Prevent shrinking
          display: "flex",
          alignItems: "center",
        }}
      >
        {translate("admin.workspace")}
      </Typography>

      <TextField
        fullWidth
        placeholder={translate("admin.searchAssets")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        size="small"
        sx={{
          mb: 1,
          height: 40, // Fixed height like Challenge Designer
          flexShrink: 0, // Prevent shrinking
          "& .MuiInputBase-root": {
            height: 40, // Fixed height for input
          },
        }}
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

      <Divider
        sx={{
          mb: 0.5,
          height: 1, // Fixed height
          flexShrink: 0, // Prevent shrinking
        }}
      />

      <Tabs
        value={tabValue}
        onChange={(_, v) => setTabValue(v)}
        variant="standard"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 0.5,
          height: 40, // Fixed height like Challenge Designer
          flexShrink: 0, // Prevent shrinking
          "& .MuiTabs-root": {
            height: 40, // Fixed height for root
          },
          "& .MuiTabs-flexContainer": {
            height: 40, // Fixed height for flex container
            alignItems: "center",
          },
          "& .MuiTab-root": {
            color: THEME_COLORS.text.secondary,
            fontSize: "0.75rem", // Same as Challenge Designer
            height: 40, // Fixed height for tabs
            minHeight: 40,
            py: 0.25,
            px: 1,
            textTransform: "none",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0, // Prevent shrinking
          },
          "& .Mui-selected": {
            color: THEME_COLORS.primary,
          },
          "& .MuiTabs-indicator": {
            backgroundColor: THEME_COLORS.primary,
            height: 2,
          },
        }}
      >
        <Tab label={translate("admin.terrain")} />
        <Tab label={translate("admin.tools")} />
      </Tabs>

      <Box sx={{ flexGrow: 1, overflow: "visible", pr: 1 }}>
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
          {translate("admin.guide")}
        </Typography>
        <Typography
          variant="caption"
          sx={{ display: "block", mb: 0.5, color: THEME_COLORS.text.secondary }}
        >
          • {translate("admin.useTerrainToPlaceTiles")}
        </Typography>
        <Typography
          variant="caption"
          sx={{ display: "block", color: THEME_COLORS.text.secondary }}
        >
          • {translate("admin.useToolsEmptyCell")}
        </Typography>
      </Box>
    </Paper>
  );
}
