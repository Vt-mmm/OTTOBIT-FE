import {
  Box,
  Paper,
  Typography,
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
import useLocales from "hooks/useLocales";

interface WorkspaceSectionProps {
  selectedAsset: string;
  onAssetSelect: (assetId: string) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box
      hidden={value !== index}
      sx={{
        pt: 0,
        mt: 0,
        width: "100%", // Fixed width
        position: "relative", // Stable positioning
      }}
    >
      {value === index && (
        <Box
          sx={{
            mt: 0,
            width: "100%", // Fixed width
            position: "relative", // Stable positioning
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  );
}

export default function WorkspaceSection({
  selectedAsset,
  onAssetSelect,
}: WorkspaceSectionProps) {
  const { translate } = useLocales();
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
            position: "relative", // Stable positioning
            flexShrink: 0, // Prevent shrinking
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
        minHeight: "100%",
        maxHeight: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        bgcolor: THEME_COLORS.surface,
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        position: "relative", // Ensure stable positioning
        // Fixed padding to prevent layout shift
        paddingLeft: "12px !important",
        paddingRight: "12px !important",
        paddingTop: "12px !important",
        paddingBottom: "12px !important",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 1,
          fontWeight: 600,
          color: THEME_COLORS.text.primary,
          fontSize: "0.95rem",
          height: 24, // Fixed height
          flexShrink: 0, // Prevent shrinking
          display: "flex",
          alignItems: "center",
          // Fixed margin to prevent layout shift
          marginBottom: "8px !important",
          marginTop: "0px !important",
          marginLeft: "0px !important",
          marginRight: "0px !important",
        }}
      >
        {translate("admin.workspace")}
      </Typography>

      {/* Search Field - Fixed height to prevent layout shift */}
      <TextField
        fullWidth
        placeholder={translate("admin.searchAssets")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        size="small"
        sx={{
          mb: 1,
          height: 40, // Fixed height
          flexShrink: 0, // Prevent shrinking
          // Fixed margin to prevent layout shift
          marginBottom: "8px !important",
          marginTop: "0px !important",
          marginLeft: "0px !important",
          marginRight: "0px !important",
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
          // Fixed margin to prevent layout shift
          marginBottom: "4px !important",
          marginTop: "0px !important",
          marginLeft: "0px !important",
          marginRight: "0px !important",
        }}
      />

      {/* Asset Categories Tabs - Fixed height to prevent layout shift */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="standard"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 0.5,
          height: 40, // Fixed height instead of minHeight
          flexShrink: 0, // Prevent shrinking
          // No scrollbar needed with standard variant
          "& .MuiTabs-root": {
            height: 40, // Fixed height for root
          },
          "& .MuiTabs-flexContainer": {
            height: 40, // Fixed height for flex container
            alignItems: "center",
          },
          "& .MuiTab-root": {
            color: THEME_COLORS.text.secondary,
            fontSize: "0.75rem",
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
          // No scroll buttons needed with standard variant
        }}
      >
        <Tab label={translate("admin.robot")} />
        <Tab label={translate("admin.items")} />
        <Tab label={translate("admin.tools")} />
      </Tabs>

      {/* Content area - No scroll needed */}
      <Box
        sx={{
          flex: "1 1 0",
          minHeight: 0, // Allow flex shrinking
          overflow: "hidden", // Remove scroll completely
          pr: 1,
          mt: 0,
          position: "relative", // Stable positioning
          // Fixed padding to prevent layout shift
          paddingRight: "8px !important",
          paddingLeft: "0px !important",
          paddingTop: "0px !important",
          paddingBottom: "0px !important",
        }}
      >
        {/* Robot Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 0.5,
              width: "100%", // Fixed width
              position: "relative", // Stable positioning
            }}
          >
            {filterAssets(getAssetsByCategory("robot")).map(renderAssetButton)}
          </Box>
        </TabPanel>

        {/* Items Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 0.5,
              width: "100%", // Fixed width
              position: "relative", // Stable positioning
            }}
          >
            {filterAssets(getAssetsByCategory("item")).map(renderAssetButton)}
          </Box>
        </TabPanel>

        {/* Tools Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 0.5,
              width: "100%", // Fixed width
              position: "relative", // Stable positioning
            }}
          >
            {filterAssets(
              getAssetsByCategory("tool").filter((a) => a.id !== "empty")
            ).map(renderAssetButton)}
          </Box>
        </TabPanel>
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
          {translate("admin.guide")}
        </Typography>

        <Typography
          variant="caption"
          sx={{ display: "block", mb: 0.5, color: THEME_COLORS.text.secondary }}
        >
          • {translate("admin.clickToPlaceRobots")}
        </Typography>
        <Typography
          variant="caption"
          sx={{ display: "block", mb: 0.5, color: THEME_COLORS.text.secondary }}
        >
          • {translate("admin.useToolsDelete")}
        </Typography>
        <Typography
          variant="caption"
          sx={{ display: "block", mb: 0.5, color: THEME_COLORS.text.secondary }}
        >
          • {translate("admin.onlyOneRobotAllowed")}
        </Typography>
        <Typography
          variant="caption"
          sx={{ display: "block", color: THEME_COLORS.text.secondary }}
        >
          • {translate("admin.terrainIsFixed")}
        </Typography>
        <Typography
          variant="caption"
          sx={{ display: "block", color: THEME_COLORS.text.secondary }}
        ></Typography>
      </Box>
    </Paper>
  );
}
