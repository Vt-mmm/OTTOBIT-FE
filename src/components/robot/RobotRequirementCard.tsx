import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import { useLocales } from "hooks";

interface RobotRequirementCardProps {
  robotName: string;
  robotModel: string;
  robotBrand: string;
  robotImageUrl?: string;
  isRequired: boolean;
  isOwned: boolean;
}

export default function RobotRequirementCard({
  robotName,
  robotModel,
  robotBrand,
  robotImageUrl,
  isRequired,
  isOwned,
}: RobotRequirementCardProps) {
  const { translate } = useLocales();

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        border: isRequired ? "2px solid" : "1px solid",
        borderColor: isRequired
          ? isOwned
            ? "success.main"
            : "warning.main"
          : "divider",
      }}
    >
      {robotImageUrl && (
        <CardMedia
          component="img"
          sx={{
            width: { xs: "100%", sm: 140 },
            height: { xs: 140, sm: "auto" },
            objectFit: "cover",
          }}
          image={robotImageUrl}
          alt={robotName}
        />
      )}
      <CardContent sx={{ flex: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div" sx={{ mb: 0.5 }}>
              {robotName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {robotModel} - {robotBrand}
            </Typography>
          </Box>

          {/* Status chips - simplified */}
          {isOwned && (
            <Chip
              icon={<CheckCircleIcon />}
              label={translate("common.Activated")}
              color="success"
              size="small"
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
