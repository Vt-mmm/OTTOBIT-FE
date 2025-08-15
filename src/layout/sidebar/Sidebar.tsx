import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
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
import { useAppSelector } from "reduxStore/config";
import { useConfigSidebar } from "./useConfigSidebar";
import { Close } from "@mui/icons-material";
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

const floatAnimation = {
  "@keyframes float": {
    "0%": { transform: "translateY(0px)" },
    "50%": { transform: "translateY(-8px)" },
    "100%": { transform: "translateY(0px)" },
  },
};

export function Sidebar({ openNav, onCloseNav }: SidebarProps) {
  const { pathname } = useLocation();
  const { navAdmin } = useConfigSidebar();
  const { userAuth } = useAppSelector((state) => state.auth);
  const isDesktop = useResponsive("up", "lg");
  const [hoveredSection, setHoveredSection] = useState<number | null>(null);

  // Để track vị trí chuột cho hiệu ứng 3D
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Xử lý di chuyển chuột để tạo hiệu ứng 3D
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sidebarRef.current) return;

    const rect = sidebarRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

    setMousePosition({ x, y });
  };

  // Reset vị trí khi chuột ra khỏi sidebar
  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (openNav) onCloseNav();
  }, [pathname]);

  const renderContent = (
    <Stack
      ref={sidebarRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      sx={() => ({
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        background:
          "linear-gradient(180deg, rgba(224, 242, 245, 0.95) 0%, rgba(204, 230, 233, 0.95) 100%)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        p: 2,
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.18)",
        transform: `perspective(1000px) rotateY(${
          mousePosition.x * 5
        }deg) rotateX(${-mousePosition.y * 5}deg)`,
        transition: "transform 0.2s ease-out",
        transformStyle: "preserve-3d",
        maxWidth: NAV_WIDTH - 2,
        "&::-webkit-scrollbar": {
          width: "6px",
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: alpha("#70c8d2", 0.0),
          borderRadius: "10px",
          transition: "background-color 0.3s ease",
        },
        "&:hover::-webkit-scrollbar-thumb": {
          backgroundColor: alpha("#70c8d2", 0.25),
        },
        "& > *": {
          maxWidth: "100%",
        },
      })}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 3,
          transform: "perspective(1000px) rotateY(5deg) translateZ(20px)",
          transition: "transform 0.3s ease",
          animation: `float 6s ease-in-out infinite`,
          ...floatAnimation,
          maxWidth: "100%",
          "&:hover": {
            transform:
              "perspective(1000px) rotateY(0deg) scale(1.03) translateZ(30px)",
          },
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            padding: 1,
            borderRadius: 2,
            background: "linear-gradient(135deg, #e5f9f4 0%, #e5f0f1 100%)",
            boxShadow: "0 8px 32px 0 rgba(112, 200, 210, 0.3)",
            border: "1.5px solid #70c8d2",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 60,
            width: 60,
            fontSize: "1.8rem",
            fontWeight: 700,
            color: "#70c8d2",
            "&:hover": {
              boxShadow: "0 10px 30px rgba(110, 204, 217, 0.5)",
            },
          }}
        >
          O
        </Box>
      </Box>

      {userAuth?.roles?.includes(Role.OTTOBIT_ADMIN) && (
        <Box sx={{ maxWidth: "100%" }}>
          {navAdmin.map((navItem, index) =>
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
                  variant="caption"
                  sx={() => ({
                    ml: 1,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    background:
                      "linear-gradient(90deg, #70c8d2 0%, #5ab9c3 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: 1.2,
                    mb: 1,
                    textShadow: "0 1px 2px rgba(0,0,0,0.05)",
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
                      transition: "all 0.3s",
                      borderRadius: "12px",
                      mb: 1,
                      color: "#4A7C82",
                      position: "relative",
                      overflow: "hidden",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background:
                          "linear-gradient(45deg, rgba(112, 200, 210, 0.02), rgba(112, 200, 210, 0.05))",
                        opacity: 0,
                        transition: "opacity 0.3s ease",
                        zIndex: -1,
                      },
                    },
                    "& .MuiListItemButton-root:hover": {
                      backgroundColor: "rgba(112, 200, 210, 0.08)",
                      color: "#5ab9c3",
                      boxShadow: "0 4px 20px rgba(112, 200, 210, 0.15)",
                      transform: "translateY(-2px) translateZ(10px)",
                      "&::before": {
                        opacity: 1,
                      },
                    },
                    "& .Mui-selected": {
                      background: "linear-gradient(45deg, #70c8d2, #5ab9c3)",
                      color: "#FFFFFF",
                      boxShadow: "0 4px 15px rgba(112, 200, 210, 0.25)",
                    },
                    "& .Mui-selected:hover": {
                      background: "linear-gradient(45deg, #65bcc6, #51a8b0)",
                      color: "#FFFFFF",
                      transform: "translateY(-2px) translateZ(10px)",
                    },
                    "& .MuiListItemIcon-root": {
                      color: "inherit",
                      minWidth: 40,
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                    },
                    "& .MuiListItemText-primary": {
                      fontSize: "0.95rem",
                      fontWeight: "500",
                      color: "inherit",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    },
                    "& .MuiListItemButton-root .MuiListItemIcon-root": {
                      transition: "transform 0.2s ease",
                    },
                    "& .MuiListItemButton-root:hover .MuiListItemIcon-root": {
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <NavSection data={navItem.listNav} />
                </Box>
                {index < navAdmin.length - 1 && (
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
        </Box>
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
              bgcolor: "transparent",
              boxShadow: "none",
              overflow: "visible",
              borderRight: "none",
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
              bgcolor: "transparent",
              boxShadow: "none",
              overflow: "visible",
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
