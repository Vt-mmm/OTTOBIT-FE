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
  useTheme,
  alpha,
  IconButton,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { useAppDispatch, useAppSelector } from "store/config";
import { logout } from "store/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { useLocales } from "hooks";
import useResponsive from "hooks/useResponsive";

interface UserProfileHeaderProps {
  title?: string;
  onOpenNav?: () => void;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({ title, onOpenNav }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { translate } = useLocales();
  const isDesktop = useResponsive("up", "lg");
  const { userAuth } = useAppSelector((s) => s.auth);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = async () => {
    handleMenuClose();
    try {
      await dispatch(logout()).unwrap();
      navigate("/auth/login");
    } catch {}
  };

  const initials = (userAuth?.username || userAuth?.email || "U").charAt(0).toUpperCase();

  const NAV_WIDTH = 280;
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "rgba(255,255,255,0.85)",
        color: "text.primary",
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        backdropFilter: "blur(8px)",
        zIndex: theme.zIndex.drawer + 1,
        width: { lg: `calc(100% - ${NAV_WIDTH}px)` },
        ml: { lg: `${NAV_WIDTH}px` },
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

        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
          {title && (
            <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
              {title}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
          <Box
            onClick={handleMenuOpen}
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              borderRadius: 2,
              px: 1.25,
              py: 0.5,
              transition: "background-color 0.2s ease",
              "&:hover": { bgcolor: alpha(theme.palette.text.primary, 0.06) },
            }}
          >
            <Avatar sx={{ width: 36, height: 36, bgcolor: theme.palette.primary.main, fontWeight: 600 }}>
              {initials}
            </Avatar>
            <Box sx={{ ml: 1.25, display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                {userAuth?.username || translate("common.User")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {userAuth?.email}
              </Typography>
            </Box>
            <IconButton size="small" sx={{ ml: 0.5 }}>
              <ArrowDropDownIcon />
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            id="user-profile-menu"
            open={open}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{ elevation: 2, sx: { width: 200, mt: 1, borderRadius: 2 } }}
          >
            <MenuItem onClick={handleLogout} sx={{ py: 1.25 }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              {translate("common.Logout")}
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default UserProfileHeader;
