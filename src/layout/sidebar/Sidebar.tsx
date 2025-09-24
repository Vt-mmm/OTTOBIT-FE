import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  Stack,
  Typography,
  Divider,
  alpha,
  IconButton,
} from "@mui/material";
import useResponsive from "hooks/useResponsive";
import NavSection from "components/nav-section/NavSection";
import { Role } from "common/enums";
import { useAppSelector } from "store/config";
import { useConfigSidebar } from "./useConfigSidebar";
import { Close, ArrowBack } from "@mui/icons-material";
import { PATH_USER } from "routes/paths";
// Logo placeholder sẽ thay thế sau

// ----------------------------------------------------------------------

const NAV_WIDTH = 280;

interface SidebarProps {
  openNav: boolean;
  onCloseNav: () => void;
}

// Animation keyframes
const slideInLeft = {
  "@keyframes slideInLeft": {
    "0%": { transform: "translateX(-20px)", opacity: 0 },
    "100%": { transform: "translateX(0)", opacity: 1 },
  },
};

export function Sidebar({ openNav, onCloseNav }: SidebarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { navAdmin, navUser } = useConfigSidebar();
  const { userAuth } = useAppSelector((state) => state.auth);
  const isDesktop = useResponsive("up", "lg");
  const [hoveredSection, setHoveredSection] = useState<number | null>(null);

  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openNav) onCloseNav();
  }, [pathname]);

  const renderContent = (
    <Stack
      ref={sidebarRef}
      sx={() => ({
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        backgroundColor: "#fff",
        borderRight: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "none",
        p: 2,
        borderRadius: 0,
        border: "none",
        transform: "none",
        transition: "none",
        transformStyle: "flat",
        maxWidth: NAV_WIDTH,
        "&::-webkit-scrollbar": {
          width: "6px",
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: alpha("#9e9e9e", 0.2),
          borderRadius: "10px",
          transition: "background-color 0.3s ease",
        },
        "&:hover::-webkit-scrollbar-thumb": {
          backgroundColor: alpha("#9e9e9e", 0.35),
        },
        "& > *": {
          maxWidth: "100%",
        },
      })}
    >
      {/* Top bar with Back button for user sidebar */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton size="small" onClick={() => navigate(PATH_USER.homepage)} aria-label="back">
          <ArrowBack />
        </IconButton>
        <Typography variant="subtitle2" sx={{ ml: 1 }}>
          Quay lại
        </Typography>
      </Box>

      {(userAuth?.roles?.includes(Role.OTTOBIT_ADMIN) ? navAdmin : navUser).map(
        (navItem, index) =>
          navItem.missions && navItem.listNav ? (
            <Box
              key={index}
              sx={{
                mb: 3,
                animation: `slideInLeft 0.3s ease forwards ${index * 0.1}s`,
                opacity: 0,
                ...slideInLeft,
                transform:
                  hoveredSection === index
                    ? "perspective(1000px) translateZ(15px)"
                    : "perspective(1000px) translateZ(0px)",
                transition: "transform 0.3s ease",
                maxWidth: "100%",
              }}
              onMouseEnter={() => setHoveredSection(index)}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <Typography
                variant="subtitle2"
                sx={() => ({
                  ml: 1,
                  fontWeight: 600,
                  textTransform: "none",
                  color: "text.secondary",
                  letterSpacing: 0.2,
                  mb: 1,
                  display: "block",
                  whiteSpace: "nowrap",
                })}
              >
                {navItem.missions}
              </Typography>
              <Box
                sx={{
                  position: "relative",
                  maxWidth: "100%",
                  "& .MuiListItemButton-root": {
                    transition: "background-color 0.2s, color 0.2s",
                    borderRadius: "8px",
                    mb: 0.25,
                    color: (theme: any) => theme.palette.text.primary,
                    position: "relative",
                    overflow: "hidden",
                    paddingTop: 2,
                    paddingBottom: 1,
                    paddingLeft: 1,
                    paddingRight: 2,
                    minHeight: 30,
                  },
                  "& .MuiListItemButton-root:hover": {
                    backgroundColor: (theme: any) => theme.palette.action.hover,
                    color: (theme: any) => theme.palette.text.primary,
                  },
                  "& .Mui-selected": {
                    backgroundColor: (theme: any) =>
                      theme.palette.action.selected,
                    color: (theme: any) => theme.palette.text.primary,
                    "& .MuiListItemText-primary": {
                      fontWeight: 700,
                    },
                  },
                  "& .Mui-selected:hover": {
                    backgroundColor: (theme: any) =>
                      theme.palette.action.selected,
                    color: (theme: any) => theme.palette.text.primary,
                  },
                  "& .MuiListItemIcon-root": {
                    color: (theme: any) => theme.palette.text.secondary,
                    minWidth: 36,
                  },
                  "& .MuiListItemText-primary": {
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    color: (theme: any) => theme.palette.text.primary,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                  "& .MuiListItemIcon-root svg": {
                    fontSize: 18,
                  },
                }}
              >
                <NavSection data={navItem.listNav} />
              </Box>
              {(userAuth?.roles?.includes(Role.OTTOBIT_ADMIN)
                ? navAdmin
                : navUser
              ).length -
                1 >
                index && (
                <Divider
                  sx={{
                    mt: 2,
                    mb: 2,
                    opacity: 0.5,
                    borderColor: alpha("#70c8d2", 0.2),
                  }}
                />
              )}
            </Box>
          ) : null
      )}

      {/* Version badge */}
      <Box
        sx={{
          mt: "auto",
          pt: 2,
          textAlign: "center",
          opacity: 0.7,
          transition: "opacity 0.3s ease, transform 0.3s ease",
          transform: "translateZ(5px)",
          maxWidth: "100%",
          "&:hover": {
            opacity: 1,
            transform: "translateZ(15px) scale(1.05)",
          },
        }}
      >
        <Typography
          variant="caption"
          display="block"
          sx={{
            color: "#5ab9c3",
            background: "rgba(112, 200, 210, 0.05)",
            borderRadius: "8px",
            padding: "6px 10px",
            display: "inline-block",
            boxShadow: "0 2px 8px rgba(112, 200, 210, 0.1)",
          }}
        >
          Tell Me v1.0
        </Typography>
      </Box>
    </Stack>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV_WIDTH },
      }}
    >
      {isDesktop ? (
        <Drawer
          open
          variant="permanent"
          PaperProps={{
            sx: {
              width: NAV_WIDTH,
              bgcolor: "background.paper",
              boxShadow: "none",
              overflow: "hidden",
              borderRight: "1px solid rgba(0,0,0,0.06)",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            },
          }}
        >
          {renderContent}
        </Drawer>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: {
              width: NAV_WIDTH,
              bgcolor: "background.paper",
              boxShadow: "none",
              overflow: "hidden",
            },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
            <IconButton
              onClick={onCloseNav}
              aria-label="close sidebar"
              sx={{ mb: 1 }}
            >
              <Close />
            </IconButton>
          </Box>
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
