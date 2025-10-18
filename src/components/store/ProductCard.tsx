import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Avatar,
} from "@mui/material";
import {
  SmartToy as RobotIcon,
  Memory as ComponentIcon,
} from "@mui/icons-material";
import { ComponentType } from "common/@types/component";
import { formatVND } from "utils/utils";

interface ProductCardProps {
  id: string;
  name: string;
  price?: number; // Optional - showroom mode
  imageUrl?: string;
  description?: string;
  stockQuantity?: number; // Optional - showroom mode
  onClick: () => void;
  type: "robot" | "component";
  // Robot specific
  brand?: string;
  model?: string;
  // Component specific
  componentType?: ComponentType;
}

export default function ProductCard({
  name,
  price,
  imageUrl,
  description,
  stockQuantity,
  onClick,
  type,
  brand,
  model,
  componentType,
}: ProductCardProps) {
  const getStockStatusColor = (stock: number): "default" | "primary" | "secondary" | "success" | "warning" | "info" | "error" => {
    if (stock === 0) return "error";
    if (stock < 10) return "warning";
    return "success";
  };

  const getStockStatusText = (stock: number) => {
    if (stock === 0) return "Out of Stock";
    if (stock < 10) return "Low Stock";
    return "In Stock";
  };

  const getComponentTypeLabel = (type: ComponentType) => {
    const typeLabels = {
      [ComponentType.SENSOR]: "Sensor",
      [ComponentType.ACTUATOR]: "Actuator",
      [ComponentType.CONTROLLER]: "Controller",
      [ComponentType.POWER_SUPPLY]: "Power Supply",
      [ComponentType.CONNECTIVITY]: "Connectivity",
      [ComponentType.MECHANICAL]: "Mechanical",
      [ComponentType.DISPLAY]: "Display",
      [ComponentType.AUDIO]: "Audio",
      [ComponentType.OTHER]: "Other",
    };
    return typeLabels[type] || "Unknown";
  };

  const getComponentTypeColor = (type: ComponentType): "default" | "primary" | "secondary" | "success" | "warning" | "info" | "error" => {
    const typeColors: Record<ComponentType, "default" | "primary" | "secondary" | "success" | "warning" | "info" | "error"> = {
      [ComponentType.SENSOR]: "primary",
      [ComponentType.ACTUATOR]: "secondary",
      [ComponentType.CONTROLLER]: "success",
      [ComponentType.POWER_SUPPLY]: "warning",
      [ComponentType.CONNECTIVITY]: "info",
      [ComponentType.MECHANICAL]: "default",
      [ComponentType.DISPLAY]: "secondary",
      [ComponentType.AUDIO]: "success",
      [ComponentType.OTHER]: "default",
    };
    return typeColors[type] || "default";
  };

  return (
    <Card
      onClick={onClick}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: 6,
        },
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      {/* Image Section */}
      <Box sx={{ position: "relative", height: 200, bgcolor: "grey.100" }}>
        {imageUrl ? (
          <CardMedia
            component="img"
            height="200"
            image={imageUrl}
            alt={name}
            sx={{ objectFit: "contain", p: 1 }}
          />
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: type === "robot" ? "primary.main" : "secondary.main",
              }}
            >
              {type === "robot" ? (
                <RobotIcon sx={{ fontSize: 40 }} />
              ) : (
                <ComponentIcon sx={{ fontSize: 40 }} />
              )}
            </Avatar>
          </Box>
        )}

        {/* Price Badge - Only show if price available */}
        {price !== undefined && (
          <Chip
            label={formatVND(price)}
            color="primary"
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              fontWeight: "bold",
              fontSize: "0.85rem",
            }}
          />
        )}

        {/* Stock Status - Only show if stockQuantity available */}
        {stockQuantity !== undefined && (
          <Chip
            label={getStockStatusText(stockQuantity)}
            color={getStockStatusColor(stockQuantity)}
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
            }}
          />
        )}
      </Box>

      {/* Content Section */}
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 600,
            mb: 1,
            lineHeight: 1.4,
            height: "2.8em",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            wordBreak: "break-word",
          }}
          title={name}
        >
          {name}
        </Typography>

        {/* Robot specific info */}
        {type === "robot" && brand && model && (
          <Typography
            variant="body2"
            color="primary.main"
            sx={{
              mb: 1,
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {brand} - {model}
          </Typography>
        )}

        {/* Component specific info */}
        {type === "component" && componentType !== undefined && (
          <Box sx={{ mb: 1 }}>
            <Chip
              label={getComponentTypeLabel(componentType)}
              color={getComponentTypeColor(componentType)}
              size="small"
            />
          </Box>
        )}

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "2.5em",
            mb: 2,
          }}
        >
          {description || "No description available"}
        </Typography>

        {/* Price and Stock Info - Only show if available */}
        {(price !== undefined || stockQuantity !== undefined) && (
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: "auto" }}>
            {price !== undefined && (
              <Typography variant="h6" color="primary.main" fontWeight="bold">
                {formatVND(price)}
              </Typography>
            )}
            {stockQuantity !== undefined && (
              <Typography variant="body2" color="text.secondary">
                {stockQuantity} units
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}