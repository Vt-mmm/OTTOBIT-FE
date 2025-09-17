import React from "react";
import { 
  Breadcrumbs as MuiBreadcrumbs, 
  Link, 
  Typography, 
  Box 
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Link as RouterLink } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
  sx?: object;
}

export default function Breadcrumbs({
  items,
  separator = <NavigateNextIcon fontSize="small" />,
  maxItems = 8,
  sx = {},
}: BreadcrumbsProps) {
  // Add home as first item if not already included
  const breadcrumbItems = items[0]?.label === "Home" ? items : [
    { label: "Home", path: "/", icon: <HomeIcon fontSize="small" sx={{ mr: 0.5 }} /> },
    ...items,
  ];

  return (
    <Box sx={{ py: 2, ...sx }}>
      <MuiBreadcrumbs
        separator={separator}
        maxItems={maxItems}
        aria-label="breadcrumb"
      >
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return isLast ? (
            <Typography
              key={item.label}
              color="text.primary"
              sx={{ 
                display: "flex", 
                alignItems: "center",
                fontWeight: 500
              }}
            >
              {item.icon}
              {item.label}
            </Typography>
          ) : (
            <Link
              key={item.label}
              component={RouterLink}
              to={item.path || "#"}
              color="inherit"
              sx={{ 
                display: "flex", 
                alignItems: "center",
                "&:hover": {
                  textDecoration: "underline"
                }
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
}