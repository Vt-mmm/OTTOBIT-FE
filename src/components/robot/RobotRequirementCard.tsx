import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
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
            mb: 1,
          }}
        >
          <Box>
            <Typography variant="h6" component="div">
              {robotName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {robotModel} - {robotBrand}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              alignItems: "flex-end",
            }}
          >
            {isRequired && (
              <Chip
                label={translate("common.Required")}
                color="error"
                size="small"
              />
            )}
            {isOwned ? (
              <Chip
                icon={<CheckCircleIcon />}
                label={translate("common.Activated")}
                color="success"
                size="small"
              />
            ) : (
              <Chip
                icon={<WarningIcon />}
                label={translate("common.NotAvailable")}
                color="warning"
                size="small"
              />
            )}
          </Box>
        </Box>

        {!isOwned && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="contained" size="small" onClick={onActivate}>
              {translate("common.ActivateRobot")}
            </Button>
            <Button variant="outlined" size="small" href="#" target="_blank">
              {translate("common.BuyRobot")}
            </Button>
          </Box>
        )}

        {isOwned && (
          <Typography
            variant="body2"
            color="success.main"
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <CheckCircleIcon fontSize="small" />
            {translate("common.YouOwnThisRobot")}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
