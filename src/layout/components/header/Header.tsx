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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { logout } from "../../../redux/auth/authSlice";
import { PATH_PUBLIC, PATH_USER, PATH_AUTH } from "../../../routes/paths";
// Logo placeholder - sẽ thay thế bằng logo thật sau

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

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  // Lấy thông tin người dùng từ redux store
  const { isAuthenticated, userAuth, userInfo } = useAppSelector(
    (state) => state.auth
  );

  // Danh sách menu với icon và scroll target
  const [menuItems, setMenuItems] = useState([
    {
      name: "Home",
      icon: <HomeIcon sx={{ mr: 1, fontSize: "1.1rem" }} />,
      href: PATH_PUBLIC.homepage,
      id: "home",
      isPage: true,
    },
  ]);

  // Update menu items when authentication state changes
  useEffect(() => {
    setMenuItems([
      {
        name: "Trang chủ",
        icon: <HomeIcon sx={{ mr: 1, fontSize: "1rem" }} />,
        href: isAuthenticated ? PATH_USER.homepage : PATH_PUBLIC.homepage,
        id: "home",
        isPage: true,
      },
    ]);
  }, [isAuthenticated]);

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
    navigate("/user/profile");
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
          bgcolor: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(112, 200, 210, 0.2)",
          transition: "all 0.3s ease-in-out",
          boxShadow: mobileMenuOpen ? "none" : "0 2px 15px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: "70px", md: "80px" },
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
                  height: { xs: "55px", sm: "60px", md: "80px" },
                  width: { xs: "55px", sm: "60px", md: "80px" },
                  mr: { xs: 1, sm: 1.5, md: 2 },
                  borderRadius: "14px",
                  boxShadow: "0 4px 20px rgba(112, 200, 210, 0.3)",
                  border: "1.5px solid #70c8d2",
                  background:
                    "linear-gradient(135deg, #e5f9f4 0%, #e5f0f1 100%)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" },
                  fontWeight: 700,
                  color: "#70c8d2",
                  "&:hover": {
                    boxShadow: "0 6px 25px rgba(110, 204, 217, 0.5)",
                    transform: "translateY(-2px)",
                  },
                }}
                onClick={() => scrollToSection("home")}
              >
                O
              </Box>
            </motion.div>
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              onClick={() => scrollToSection("home")}
              style={{ cursor: "pointer" }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "#000000",
                  fontSize: { xs: "1.2rem", sm: "1.5rem", md: "1.8rem" },
                  display: { xs: "none", sm: "block" },
                  letterSpacing: "-0.5px",
                }}
              ></Typography>
            </motion.div>
          </Box>

          {/* Desktop Navigation */}
          <Stack
            direction="row"
            spacing={{ md: 2, lg: 4 }}
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
                    color: activeSection === item.id ? "#000000" : "#555",
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
                        ? "rgba(112, 200, 210, 0.1)"
                        : "transparent",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      color: "#000000",
                      background: "rgba(112, 200, 210, 0.1)",
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      width: activeSection === item.id ? "30%" : "0%",
                      height: "2px",
                      bottom: "0",
                      left: "35%",
                      background: "#70c8d2",
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
                  border: "2px solid #6eccd9",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    border: "2px solid #5ab9c3",
                  },
                }}
              >
                <Avatar
                  alt={userInfo?.fullName || userAuth?.email || ""}
                  sx={{
                    width: { xs: 36, sm: 40, md: 44 },
                    height: { xs: 36, sm: 40, md: 44 },
                    bgcolor: "#6eccd9",
                  }}
                >
                  {userInfo?.fullName?.charAt(0) ||
                    userAuth?.email?.charAt(0) ||
                    "U"}
                </Avatar>
              </IconButton>
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
                    minWidth: "200px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
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
                    py: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    {userInfo?.fullName || "Người dùng"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {userAuth?.email || ""}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={handleProfileClick}>Hồ sơ của tôi</MenuItem>

                <MenuItem onClick={() => navigate(PATH_USER.homepage)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="#6eccd9"
                    viewBox="0 0 16 16"
                    style={{ marginRight: "12px" }}
                  >
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                    <path d="M9.05 6.5a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0V7.5h-.5a.5.5 0 0 1 0-1h1zm.5-2a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm-7 1a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5z" />
                  </svg>
                  Hồ sơ tư vấn
                </MenuItem>

                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon
                    fontSize="small"
                    sx={{ mr: 1.5, color: "#f44336" }}
                  />
                  Đăng xuất
                </MenuItem>
              </Menu>
            </motion.div>
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
                  background: "#6eccd9",
                  color: "#ffffff",
                  borderRadius: { xs: "8px", sm: "10px", md: "12px" },
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                  textTransform: "none",
                  fontWeight: 600,
                  padding: { xs: "8px 18px", sm: "8px 22px", md: "10px 26px" },
                  fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1.05rem" },
                  "&:hover": {
                    background: "#5ab9c3",
                    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
                  },
                }}
              >
                Sign In
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
              color: "#000000",
              display: { xs: "flex", md: "none" },
              transition: "transform 0.3s ease",
              transform: mobileMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
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
                  top: "70px",
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
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                    borderBottom: "1px solid rgba(112, 200, 210, 0.3)",
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
                          color: activeSection === item.id ? "#000000" : "#555",
                          fontWeight: activeSection === item.id ? 600 : 500,
                          fontSize: "1rem",
                          borderBottom:
                            index < menuItems.length - 1
                              ? "1px solid rgba(112, 200, 210, 0.2)"
                              : "none",
                          background:
                            activeSection === item.id
                              ? "rgba(112, 200, 210, 0.1)"
                              : "transparent",
                          "&:hover": {
                            background: "rgba(112, 200, 210, 0.1)",
                            color: "#000000",
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
