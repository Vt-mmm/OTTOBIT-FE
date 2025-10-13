import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Alert,
} from "@mui/material";
import {
  SmartToy as RobotIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { useLocales } from "../../../../hooks";
import { CourseRobotInfo } from "common/@types/course";

interface CourseRobotRequirementsSectionProps {
  robots?: CourseRobotInfo[];
}

export default function CourseRobotRequirementsSection({
  robots,
}: CourseRobotRequirementsSectionProps) {
  const { translate } = useLocales();

  // If no robots data, don't render anything
  if (!robots || robots.length === 0) {
    return null;
  }

  // Filter required robots
  const requiredRobots = robots.filter((robot) => robot.isRequired);

  // If no required robots, show optional message
  if (requiredRobots.length === 0) {
    return (
      <Box sx={{ mb: 6 }}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <Typography variant="body2">
            {translate("courses.NoRobotsRequired")}
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 6 }}>
      {/* Section Header with Icon */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: "50%",
            bgcolor: "#FFB800",
            color: "#fff",
          }}
        >
          <RobotIcon sx={{ fontSize: 28 }} />
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "#1f1f1f",
              fontSize: "1.25rem",
            }}
          >
            {translate("courses.RequiredRobots")}
          </Typography>
          <Typography variant="body2" sx={{ color: "#5f6368" }}>
            {translate("courses.RequiredRobotsDesc")}
          </Typography>
        </Box>
      </Box>

      {/* Robots Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 3,
        }}
      >
        {requiredRobots.map((robot) => (
          <Card
            key={robot.robotId}
            sx={{
              border: "2px solid #FFB800",
              borderRadius: 3,
              boxShadow: "0 4px 12px rgba(255, 184, 0, 0.15)",
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "visible",
              "&:hover": {
                boxShadow: "0 6px 20px rgba(255, 184, 0, 0.25)",
                transform: "translateY(-4px)",
              },
            }}
          >
            {/* Required Badge */}
            <Chip
              icon={<CheckIcon sx={{ fontSize: 16 }} />}
              label={translate("courses.Required")}
              size="small"
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 1,
                bgcolor: "#FFB800",
                color: "#fff",
                fontWeight: 600,
                "& .MuiChip-icon": {
                  color: "#fff",
                },
              }}
            />

            {/* Robot Image */}
            {robot.robotImageUrl ? (
              <CardMedia
                component="img"
                height="200"
                image={robot.robotImageUrl}
                alt={robot.robotName}
                sx={{
                  objectFit: "contain",
                  bgcolor: "#fafafa",
                  p: 2,
                }}
              />
            ) : (
              <Box
                sx={{
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#fafafa",
                }}
              >
                <RobotIcon sx={{ fontSize: 80, color: "#e0e0e0" }} />
              </Box>
            )}

            <CardContent sx={{ p: 2.5 }}>
              {/* Robot Name */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "#1f1f1f",
                  fontSize: "1.1rem",
                  mb: 1,
                }}
              >
                {robot.robotName}
              </Typography>

              {/* Robot Model & Brand */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography variant="body2" sx={{ color: "#5f6368" }}>
                  <strong>{translate("courses.Model")}:</strong>{" "}
                  {robot.robotModel}
                </Typography>
                <Typography variant="body2" sx={{ color: "#5f6368" }}>
                  <strong>{translate("courses.Brand")}:</strong>{" "}
                  {robot.robotBrand}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
