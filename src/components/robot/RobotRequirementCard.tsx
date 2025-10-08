import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
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
  onActivate?: () => void;
}

export default function RobotRequirementCard({
  robotName,
  robotModel,
  robotBrand,
  robotImageUrl,
  isRequired,
  isOwned,
  onActivate,
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

            {/* Action buttons for not owned robots */}
            {!isOwned && (
              <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                <Button variant="contained" size="small" onClick={onActivate}>
                  {translate("common.ActivateRobot")}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  href="#"
                  target="_blank"
                >
                  {translate("common.BuyRobot")}
                </Button>
              </Box>
            )}
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
