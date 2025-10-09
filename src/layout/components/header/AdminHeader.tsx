import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  ListItemIcon,
  Chip,
  useTheme,
  alpha,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "store/config";
import { logout } from "store/auth/authSlice";
import LogoutIcon from "@mui/icons-material/Logout";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MenuIcon from "@mui/icons-material/Menu";
import useResponsive from "hooks/useResponsive";
import { LanguageSwitcher } from "components/common";
import { useLocales } from "hooks";

interface AdminHeaderProps {
  title?: string;
  onOpenNav?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, onOpenNav }) => {
  const theme = useTheme();
  const { translate } = useLocales();
  const isDesktop = useResponsive("up", "lg");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Lấy thông tin người dùng từ redux store
  const { userAuth } = useAppSelector((state) => state.auth);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    try {
      await dispatch(logout()).unwrap();
      navigate("/auth/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Tạo initials từ tên người dùng
  const getInitials = (name: string | undefined) => {
    if (!name) return "U";

    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  const userInitials = getInitials(userAuth?.username);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "rgba(255, 255, 255, 0.85)",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: alpha("#70c8d2", 0.3),
        backdropFilter: "blur(8px)",
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, sm: 3 } }}>
        {/* Mobile menu button */}
        {!isDesktop && (
          <IconButton
            onClick={onOpenNav}
            sx={{ mr: 1, color: "text.primary" }}
            aria-label="open menu"
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Title section - only on desktop */}
        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
          {title && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 500,
                letterSpacing: "0.02em",
                color: "#3a3a3a",
                textShadow: "0 1px 2px rgba(0,0,0,0.02)",
              }}
            >
              {title}
            </Typography>
          )}
        </Box>

        {/* User Profile Section */}
        <Box sx={{ display: "flex", alignItems: "center", ml: "auto", gap: 1 }}>
          {/* Language Switcher */}
          <LanguageSwitcher />

          {userAuth?.roles?.includes("Admin") && (
            <Chip
              icon={<AdminPanelSettingsIcon />}
              label="Admin"
              size="small"
              sx={{
                fontWeight: 500,
                bgcolor: alpha("#70c8d2", 0.15),
                color: "#4A7C82",
                border: `1px solid ${alpha("#70c8d2", 0.4)}`,
                "& .MuiChip-icon": {
                  color: "#4A7C82",
                },
              }}
            />
          )}

          <Box
            onClick={handleProfileMenuOpen}
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: alpha("#70c8d2", 0.1),
              },
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "#70c8d2",
                fontWeight: 500,
                fontSize: "0.95rem",
                boxShadow: `0 2px 8px ${alpha("#70c8d2", 0.35)}`,
              }}
            >
              {userInitials}
            </Avatar>

            <Box sx={{ ml: 1.5, display: { xs: "none", sm: "block" } }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: "#3a3a3a",
                  fontSize: "0.9rem",
                  letterSpacing: "0.01em",
                }}
              >
                {userAuth?.username || "User"}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(0, 0, 0, 0.55)",
                  fontSize: "0.75rem",
                  fontWeight: 400,
                }}
              >
                {userAuth?.email || "user@example.com"}
              </Typography>
            </Box>

            <ArrowDropDownIcon sx={{ ml: 1, color: "rgba(0, 0, 0, 0.45)" }} />
          </Box>

          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              elevation: 2,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 10px rgba(0,0,0,0.08))",
                width: 200,
                mt: 1.5,
                borderRadius: 2,
                "&:before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 500,
                  color: "#3a3a3a",
                  fontSize: "0.9rem",
                }}
              >
                {userAuth?.username || "User"}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(0, 0, 0, 0.55)",
                  display: "block",
                  mt: 0.25,
                  mb: 0.5,
                }}
              >
                {userAuth?.email || "user@example.com"}
              </Typography>

              {userAuth?.roles && userAuth.roles.length > 0 && (
                <Box
                  sx={{ mt: 0.5, display: "flex", flexWrap: "wrap", gap: 0.5 }}
                >
                  {userAuth.roles.map((role) => (
                    <Chip
                      key={role}
                      label={role}
                      size="small"
                      variant="outlined"
                      sx={{
                        height: 20,
                        fontSize: "0.7rem",
                        fontWeight: 400,
                        bgcolor: alpha("#70c8d2", 0.08),
                        borderColor: alpha("#70c8d2", 0.3),
                        color: "#4A7C82",
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>

            <MenuItem
              onClick={handleLogout}
              sx={{
                color: "#e63946",
                py: 1.5,
                borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                fontSize: "0.875rem",
                fontWeight: 500,
                mt: 0.5,
                "&:hover": {
                  bgcolor: "rgba(230, 57, 70, 0.04)",
                },
              }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: "#e63946" }} />
              </ListItemIcon>
              {translate("common.Logout")}
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AdminHeader;
