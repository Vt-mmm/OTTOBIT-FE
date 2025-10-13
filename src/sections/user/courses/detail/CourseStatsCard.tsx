import { Box, Typography, Divider } from "@mui/material";
import { ReactNode } from "react";

interface CourseStatsCardProps {
  icon?: ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: "default" | "primary" | "success";
  showDivider?: boolean;
}

export default function CourseStatsCard({
  icon,
  title,
  value,
  subtitle,
  variant: _variant = "default",
  showDivider = true,
}: CourseStatsCardProps) {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          px: { xs: 2, sm: 3 },
          py: 1,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "#757575",
            fontWeight: 600,
            textTransform: "uppercase",
            fontSize: "0.6875rem",
            letterSpacing: "0.5px",
          }}
        >
          {title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {icon && (
            <Box
              sx={{
                color: "#616161",
                display: "flex",
                alignItems: "center",
                fontSize: "1.25rem",
              }}
            >
              {icon}
            </Box>
          )}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "#2c2c2c",
              lineHeight: 1.2,
              fontSize: "1.125rem",
            }}
          >
            {value}
          </Typography>
        </Box>
        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: "#9e9e9e",
              fontSize: "0.75rem",
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {showDivider && (
        <Divider
          orientation="vertical"
          flexItem
          sx={{
            borderColor: "#e0e0e0",
            display: { xs: "none", sm: "block" },
          }}
        />
      )}
    </>
  );
}
