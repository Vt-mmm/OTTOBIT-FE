import React from "react";
import { Card, CardContent, Typography, Grid, Box, Skeleton } from "@mui/material";
import {
  BookOpen,
  Trophy,
  MapPin,
  FileText,
  Bot,
  BotOff,
} from "lucide-react";
import { LearningContentStatistics } from "common/@types/dashboard";
import useLocales from "hooks/useLocales";

interface LearningContentStatsProps {
  data: LearningContentStatistics | null;
  isLoading: boolean;
}

interface ContentStatItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  bgColor: string;
  iconColor: string;
  isLoading: boolean;
}

const ContentStatItem = ({
  icon,
  label,
  value,
  bgColor,
  iconColor,
  isLoading,
}: ContentStatItemProps) => (
  <Card
    sx={{
      height: "100%",
      bgcolor: bgColor,
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: 3,
      },
    }}
  >
    <CardContent
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        py: 4,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 64,
          height: 64,
          borderRadius: 2,
          bgcolor: "rgba(255, 255, 255, 0.7)",
          color: iconColor,
          mb: 2,
        }}
      >
        {React.cloneElement(icon as React.ReactElement, { sx: { fontSize: 40 } })}
      </Box>
      {isLoading ? (
        <>
          <Skeleton variant="text" width={80} height={48} />
          <Skeleton variant="text" width={100} />
        </>
      ) : (
        <>
          <Typography variant="h3" fontWeight={700} color={iconColor} sx={{ mb: 1 }}>
            {value.toLocaleString()}
          </Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            {label}
          </Typography>
        </>
      )}
    </CardContent>
  </Card>
);

export default function LearningContentStats({
  data,
  isLoading,
}: LearningContentStatsProps) {
  const { translate } = useLocales();
  
  const stats = [
    {
      icon: <BookOpen />,
      label: translate("admin.dashboardStats.lessons"),
      value: data?.totalLessons || 0,
      bgColor: "#e3f2fd",
      iconColor: "#1976d2",
    },
    {
      icon: <Trophy />,
      label: translate("admin.dashboardStats.challenges"),
      value: data?.totalChallenges || 0,
      bgColor: "#fff3e0",
      iconColor: "#f57c00",
    },
    {
      icon: <MapPin />,
      label: translate("admin.dashboardStats.maps"),
      value: data?.totalMaps || 0,
      bgColor: "#e8f5e9",
      iconColor: "#2e7d32",
    },
    {
      icon: <FileText />,
      label: translate("admin.dashboardStats.resources"),
      value: data?.totalLessonResources || 0,
      bgColor: "#f3e5f5",
      iconColor: "#7b1fa2",
    },
    {
      icon: <Bot />,
      label: translate("admin.dashboardStats.activeRobots"),
      value: data?.activeRobots || 0,
      bgColor: "#e0f7fa",
      iconColor: "#00838f",
    },
    {
      icon: <BotOff />,
      label: translate("admin.dashboardStats.inactiveRobots"),
      value: data?.inactiveRobots || 0,
      bgColor: "#ffebee",
      iconColor: "#c62828",
    },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
          {translate("admin.dashboardStats.learningContentStats")}
        </Typography>
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
              <ContentStatItem
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
                bgColor={stat.bgColor}
                iconColor={stat.iconColor}
                isLoading={isLoading}
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
