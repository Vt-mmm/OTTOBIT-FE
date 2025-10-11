import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Stack,
  Link,
  useScrollTrigger,
  Slide,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  AdminPanelSettings as AdminIcon,
  Store as StoreIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "store/config";
import { logout } from "../../../redux/auth/authSlice";
import { CartButton } from "components/cart";
import {
  PATH_PUBLIC,
  PATH_USER,
  PATH_AUTH,
  PATH_ADMIN,
} from "../../../routes/paths";
import { alpha } from "@mui/material/styles";
import { useLocales } from "hooks";

// Component ẩn header khi scroll xuống
function HideOnScroll(props: {
  window?: () => Window;
  children: React.ReactElement;
}) {
  const { children, window } = props;
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { translate } = useLocales();

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  // Lấy thông tin người dùng từ redux store
  const { isAuthenticated, userAuth, userInfo } = useAppSelector(
    (state) => state.auth
  );

  // Dánh sách menu với icon và scroll target
  const [menuItems, setMenuItems] = useState([
    {
      name: translate("common.Home"),
      icon: <HomeIcon sx={{ mr: 1, fontSize: "1.1rem" }} />,
      href: PATH_PUBLIC.homepage,
      id: "home",
      isPage: true,
    },
  ]);

  // Update menu items when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      setMenuItems([
        {
          name: translate("common.Home"),
          icon: <HomeIcon sx={{ mr: 1, fontSize: "1rem" }} />,
          href: PATH_USER.homepage,
          id: "home",
          isPage: true,
        },
        {
          name: translate("common.Products"),
          icon: <StoreIcon sx={{ mr: 1, fontSize: "1rem" }} />,
          href: PATH_USER.store,
          id: "store",
          isPage: true,
        },
        {
          name: translate("common.Courses"),
          icon: <SchoolIcon sx={{ mr: 1, fontSize: "1rem" }} />,
          href: PATH_USER.courses,
          id: "courses",
          isPage: true,
        },
        {
          name: translate("common.Studio"),
          icon: <DashboardIcon sx={{ mr: 1, fontSize: "1rem" }} />,
          href: PATH_USER.studio,
          id: "studio",
          isPage: true,
        },
      ]);
    } else {
      setMenuItems([
        {
          name: translate("common.Home"),
          icon: <HomeIcon sx={{ mr: 1, fontSize: "1rem" }} />,
          href: PATH_PUBLIC.homepage,
          id: "home",
          isPage: true,
        },
        {
          name: translate("common.Store"),
          icon: <StoreIcon sx={{ mr: 1, fontSize: "1rem" }} />,
          href: PATH_PUBLIC.store,
          id: "store",
          isPage: true,
        },
      ]);
    }
  }, [isAuthenticated, translate]);

  // Theo dõi URL và scroll để highlight menu item tương ứng với section hiện tại
  useEffect(() => {
    // Kiểm tra URL hiện tại để xác định trang
    const pathname = location.pathname;

    if (pathname.includes("/service")) {
      setActiveSection("services");
      return;
    } else if (pathname.includes("/quiz")) {
      setActiveSection("test");
      return;
    } else if (pathname.includes("/news")) {
      setActiveSection("news");
      return;
    } else if (pathname.includes("/supporter")) {
      setActiveSection("supporters");
      return;
    } else if (
      pathname === "/" ||
      pathname === "/home" ||
      pathname === "/user/homepage"
    ) {
      // Nếu đang ở trang chủ, theo dõi scroll
      const handleScroll = () => {
        const scrollPosition = window.scrollY;

        // Xác định section hiện tại dựa trên vị trí scroll
        if (scrollPosition < 600) {
          setActiveSection("home");
        } else if (scrollPosition < 1200) {
          setActiveSection("services");
        } else if (scrollPosition < 1800) {
          setActiveSection("supporters");
        } else if (scrollPosition < 2400) {
          setActiveSection("psychologists");
        } else {
          setActiveSection("news");
        }
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      // Nếu không thuộc section nào, không highlight menu nào
      setActiveSection("");
    }
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogin = () => {
    navigate("/auth/login");
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleProfileMenuClose();
    navigate(PATH_USER.profile);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    try {
      await dispatch(logout()).unwrap();
      // Redirect to login page after logout
      navigate(PATH_AUTH.login, { replace: true });
    } catch {
      // Even if logout fails, still redirect to login page
      navigate(PATH_AUTH.login, { replace: true });
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);

    // Tìm menu item tương ứng
    const menuItem = menuItems.find((item) => item.id === id);

    // Nếu là trang riêng biệt (isPage=true), chuyển hướng đến trang đó
    if (menuItem && menuItem.isPage) {
      // Special case for Home - just scroll to top if already on homepage
      if (
        id === "home" &&
        (location.pathname === "/" ||
          location.pathname === "/home" ||
          location.pathname === "/user/homepage")
      ) {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        return;
      }

      // Direct navigation to the target page
      navigate(menuItem.href);
      return;
    }

    // Nếu không phải trang riêng, scroll đến section tương ứng
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    } else if (id === "home") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <HideOnScroll>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(15px)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
          transition: "all 0.3s ease-in-out",
          boxShadow: mobileMenuOpen ? "none" : "0 2px 10px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: "56px", md: "64px" },
            width: "100%",
            maxWidth: "1600px",
            margin: "0 auto",
            padding: { xs: "0 16px", sm: "0 24px", md: "0 32px" },
          }}
        >
          {/* Logo and Title */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Box
                sx={{
                  height: { xs: "40px", sm: "44px", md: "48px" },
                  width: { xs: "120px", sm: "140px", md: "160px" },
                  mr: { xs: 1, sm: 1.5, md: 2 },
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    opacity: 0.8,
                  },
                }}
                onClick={() => scrollToSection("home")}
              >
                <img
                  src="/asset/OttobitLogoText.png"
                  alt="OttoBit Logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </Box>
            </motion.div>
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              onClick={() => scrollToSection("home")}
              style={{ cursor: "pointer" }}
            ></motion.div>
          </Box>

          {/* Desktop Navigation */}
          <Stack
            direction="row"
            spacing={2}
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
            }}
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 * (index + 1) }}
                whileHover={{ scale: 1.05 }}
              >
                <Link
                  component="button"
                  onClick={() => scrollToSection(item.id)}
                  underline="none"
                  sx={{
                    color: activeSection === item.id ? "#22c55e" : "#374151",
                    fontWeight: activeSection === item.id ? 600 : 500,
                    fontSize: { md: "0.95rem", lg: "1.05rem" },
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    py: 1,
                    px: { md: 1, lg: 2 },
                    borderRadius: "8px",
                    background:
                      activeSection === item.id
                        ? "rgba(34, 197, 94, 0.1)"
                        : "transparent",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      color: "#22c55e",
                      background: "rgba(34, 197, 94, 0.1)",
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      width: activeSection === item.id ? "30%" : "0%",
                      height: "2px",
                      bottom: "0",
                      left: "35%",
                      background: "#22c55e",
                      transition: "width 0.3s ease",
                    },
                    "&:hover::after": {
                      width: "30%",
                    },
                  }}
                >
                  {item.icon}
                  {item.name}
                </Link>
              </motion.div>
            ))}
          </Stack>

          {/* Sign In Button or User Profile */}
          {isAuthenticated ? (
            <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
              {/* Role Badge */}
              {userAuth?.roles?.includes("OTTOBIT_ADMIN") && (
                <Chip
                  icon={<AdminIcon />}
                  label="Admin"
                  size="small"
                  sx={{
                    mr: 2,
                    fontWeight: 600,
                    bgcolor: alpha("#FF9800", 0.15),
                    color: "#E65100",
                    border: `1px solid ${alpha("#FF9800", 0.4)}`,
                    "& .MuiChip-icon": {
                      color: "#E65100",
                    },
                  }}
                />
              )}

              {/* Cart Button - Only for authenticated users */}
              <CartButton />

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{
                    p: 0,
                    borderRadius: "50%",
                    border: "2px solid #8BC34A",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      border: "2px solid #689F38",
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <Avatar
                    alt={
                      userInfo?.fullName ||
                      userAuth?.username ||
                      userAuth?.email ||
                      ""
                    }
                    sx={{
                      width: { xs: 36, sm: 40, md: 44 },
                      height: { xs: 36, sm: 40, md: 44 },
                      bgcolor: "#8BC34A",
                      fontWeight: 600,
                    }}
                  >
                    {(
                      userInfo?.fullName ||
                      userAuth?.username ||
                      userAuth?.email
                    )
                      ?.charAt(0)
                      ?.toUpperCase() || "U"}
                  </Avatar>
                </IconButton>
              </motion.div>

              <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleProfileMenuClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                sx={{
                  "& .MuiPaper-root": {
                    borderRadius: "12px",
                    minWidth: "220px",
                    boxShadow: "0 8px 32px rgba(139, 195, 74, 0.25)",
                    border: `1px solid ${alpha("#8BC34A", 0.2)}`,
                    mt: 1.5,
                    "& .MuiMenu-list": {
                      padding: "8px",
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    borderBottom: `1px solid ${alpha("#8BC34A", 0.2)}`,
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ color: "#2E7D32" }}
                  >
                    {userInfo?.fullName || userAuth?.username || "Người dùng"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {userAuth?.email || ""}
                  </Typography>
                  {userAuth?.roles?.includes("OTTOBIT_ADMIN") && (
                    <Chip
                      icon={<AdminIcon />}
                      label="Quản trị viên"
                      size="small"
                      sx={{
                        mt: 1,
                        fontWeight: 600,
                        bgcolor: alpha("#FF9800", 0.15),
                        color: "#E65100",
                        border: `1px solid ${alpha("#FF9800", 0.4)}`,
                        "& .MuiChip-icon": {
                          color: "#E65100",
                        },
                      }}
                    />
                  )}
                </Box>

                <MenuItem
                  onClick={handleProfileClick}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    "&:hover": {
                      bgcolor: alpha("#8BC34A", 0.1),
                    },
                  }}
                >
                  <PersonIcon
                    sx={{ mr: 1.5, color: "#2E7D32", fontSize: 20 }}
                  />
                  Hồ sơ cá nhân
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    handleProfileMenuClose();
                    navigate(PATH_USER.studentProfile);
                  }}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    "&:hover": {
                      bgcolor: alpha("#8BC34A", 0.1),
                    },
                  }}
                >
                  <SchoolIcon
                    sx={{ mr: 1.5, color: "#2E7D32", fontSize: 20 }}
                  />
                  Việc học của tôi
                </MenuItem>

                <MenuItem
                  onClick={() => navigate(PATH_USER.homepage)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    "&:hover": {
                      bgcolor: alpha("#8BC34A", 0.1),
                    },
                  }}
                >
                  <DashboardIcon
                    sx={{ mr: 1.5, color: "#2E7D32", fontSize: 20 }}
                  />
                  Bảng điều khiển
                </MenuItem>

                {userAuth?.roles?.includes("OTTOBIT_ADMIN") && (
                  <MenuItem
                    onClick={() => navigate(PATH_ADMIN.dashboard)}
                    sx={{
                      borderRadius: 2,
                      mx: 1,
                      "&:hover": {
                        bgcolor: alpha("#FF9800", 0.1),
                      },
                    }}
                  >
                    <AdminIcon
                      sx={{ mr: 1.5, color: "#E65100", fontSize: 20 }}
                    />
                    Quản trị hệ thống
                  </MenuItem>
                )}

                <Divider sx={{ my: 1, bgcolor: alpha("#8BC34A", 0.2) }} />

                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    "&:hover": {
                      bgcolor: alpha("#f44336", 0.1),
                    },
                  }}
                >
                  <LogoutIcon
                    sx={{ mr: 1.5, color: "#f44336", fontSize: 20 }}
                  />
                  Đăng xuất
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              <Button
                variant="contained"
                onClick={handleLogin}
                sx={{
                  background: "linear-gradient(45deg, #22c55e, #16a34a)",
                  color: "#ffffff",
                  borderRadius: { xs: "8px", sm: "10px", md: "12px" },
                  boxShadow: "0 4px 15px rgba(34, 197, 94, 0.3)",
                  textTransform: "none",
                  fontWeight: 600,
                  padding: { xs: "8px 18px", sm: "8px 22px", md: "10px 26px" },
                  fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1.05rem" },
                  "&:hover": {
                    background: "linear-gradient(45deg, #16a34a, #15803d)",
                    boxShadow: "0 6px 20px rgba(34, 197, 94, 0.4)",
                  },
                }}
              >
                Đăng nhập
              </Button>
            </motion.div>
          )}

          {/* Mobile Menu Button */}
          <IconButton
            size="large"
            edge="start"
            aria-label={mobileMenuOpen ? "close menu" : "open menu"}
            onClick={toggleMobileMenu}
            sx={{
              ml: 2,
              color: "#374151",
              display: { xs: "flex", md: "none" },
              transition: "transform 0.3s ease",
              transform: mobileMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
              "&:hover": {
                color: "#22c55e",
              },
            }}
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: "absolute",
                  top: "56px",
                  left: 0,
                  width: "100%",
                  zIndex: 1000,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    backdropFilter: "blur(12px)",
                    bgcolor: "rgba(255, 255, 255, 0.98)",
                    boxShadow: "0 10px 30px rgba(139, 195, 74, 0.2)",
                    borderBottom: "1px solid rgba(139, 195, 74, 0.3)",
                    display: { xs: "block", md: "none" },
                  }}
                >
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 * index }}
                    >
                      <Link
                        component="button"
                        onClick={() => scrollToSection(item.id)}
                        underline="none"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          py: 2,
                          px: 3,
                          color: activeSection === item.id ? "#2E7D32" : "#555",
                          fontWeight: activeSection === item.id ? 600 : 500,
                          fontSize: "1rem",
                          borderBottom:
                            index < menuItems.length - 1
                              ? "1px solid rgba(139, 195, 74, 0.2)"
                              : "none",
                          background:
                            activeSection === item.id
                              ? "rgba(139, 195, 74, 0.1)"
                              : "transparent",
                          "&:hover": {
                            background: "rgba(139, 195, 74, 0.1)",
                            color: "#2E7D32",
                          },
                        }}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
};

export default Header;
