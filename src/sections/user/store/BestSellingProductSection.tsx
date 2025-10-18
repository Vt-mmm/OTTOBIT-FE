import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "store/config";
import { getRobotsThunk } from "store/robot/robotThunks";
import { getComponentsThunk } from "store/component/componentThunks";
import { PATH_PUBLIC, PATH_USER } from "routes/paths";
import useLocales from "hooks/useLocales";

interface Product {
  id: string;
  name: string;
  image?: string;
  type: "robot" | "component";
}

export default function BestSellingProductSection() {
  const { translate } = useLocales();
  const [activeCategory, setActiveCategory] = useState("Robots");
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { robots } = useAppSelector((state) => state.robot);
  const { components } = useAppSelector((state) => state.component);

  // Get categories with translation
  const categories = [
    { key: "Robots", label: translate("store.bestSelling.robots") },
    { key: "Components", label: translate("store.bestSelling.components") },
  ];

  const ITEMS_PER_PAGE = 4;

  // Fetch data on component mount - get more items for pagination
  useEffect(() => {
    // Fetch robots with limit for best selling (fetch 12 items for 3 pages)
    dispatch(
      getRobotsThunk({
        page: 1,
        size: 10,
        orderBy: "CreatedAt",
        orderDirection: "DESC",
      })
    );
    // Fetch components with limit for best selling (fetch 12 items for 3 pages)
    dispatch(
      getComponentsThunk({
        page: 1,
        size: 10,
        orderBy: "CreatedAt",
        orderDirection: "DESC",
      })
    );
  }, [dispatch]);

  // Reset to first page when category changes
  useEffect(() => {
    setCurrentPage(0);
  }, [activeCategory]);

  // Convert API data to unified product format
  const convertToProducts = (): Product[] => {
    if (activeCategory === "Robots") {
      return (
        robots.data?.items?.map((robot) => ({
          id: robot.id,
          name: robot.name,
          image: robot.imageUrl || "/asset/OttobitCar.png",
          type: "robot" as const,
        })) || []
      );
    } else {
      return (
        components.data?.items?.map((component) => ({
          id: component.id,
          name: component.name,
          image: component.imageUrl || "/asset/Microbitv2-removebg-preview.png",
          type: "component" as const,
        })) || []
      );
    }
  };

  const allProducts = convertToProducts();
  const totalPages = Math.ceil(allProducts.length / ITEMS_PER_PAGE);

  // Get products for current page
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const filteredProducts = allProducts.slice(startIndex, endIndex);

  const isLoading = robots.isLoading || components.isLoading;
  const hasError = robots.error || components.error;

  // Carousel navigation handlers
  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  const canGoPrev = totalPages > 1;
  const canGoNext = totalPages > 1;

  // Navigation handlers
  const handleViewAll = () => {
    const targetPath =
      activeCategory === "Robots"
        ? isAuthenticated
          ? PATH_USER.robots
          : PATH_PUBLIC.robots
        : isAuthenticated
        ? PATH_USER.components
        : PATH_PUBLIC.components;

    // Scroll to top before navigation
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate(targetPath);
  };

  const handleProductClick = (product: Product) => {
    const targetPath =
      product.type === "robot"
        ? isAuthenticated
          ? PATH_USER.robotDetail.replace(":id", product.id)
          : PATH_PUBLIC.robotDetail.replace(":id", product.id)
        : isAuthenticated
        ? PATH_USER.componentDetail.replace(":id", product.id)
        : PATH_PUBLIC.componentDetail.replace(":id", product.id);
    navigate(targetPath);
  };

  // Card gradient colors based on index
  const getCardGradient = (index: number) => {
    const gradients = [
      "linear-gradient(135deg, #FFE082 0%, #FFD54F 100%)", // Yellow for Robots
      "linear-gradient(135deg, #F48FB1 0%, #F06292 100%)", // Pink
      "linear-gradient(135deg, #FFAB91 0%, #FF8A65 100%)", // Orange/Coral
      "linear-gradient(135deg, #CE93D8 0%, #BA68C8 100%)", // Purple
    ];
    return gradients[index % gradients.length];
  };

  return (
    <Box
      sx={{
        bgcolor: "#F5F5DC", // Beige color
        py: { xs: 8, md: 12 },
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 6,
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "2.5rem", md: "3rem" },
                fontWeight: 700,
                color: "#2c3e50",
              }}
            >
              {translate("store.bestSelling.title")}
            </Typography>
          </motion.div>

          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={handleViewAll}
            sx={{
              color: "#E58411",
              fontWeight: 600,
              textTransform: "none",
              fontSize: "1.1rem",
              "&:hover": {
                bgcolor: "transparent",
                "& .MuiSvgIcon-root": {
                  transform: "translateX(4px)",
                },
              },
              "& .MuiSvgIcon-root": {
                transition: "transform 0.3s ease",
              },
            }}
          >
            {translate("store.bestSelling.seeAll")}
          </Button>
        </Box>

        {/* Category Filter */}
        <Box
          sx={{
            bgcolor: "#E8E3D5",
            borderRadius: "44px",
            p: 1,
            display: "flex",
            gap: 1,
            mb: 6,
            width: "fit-content",
            mx: { xs: "auto", md: "0" },
            flexWrap: "wrap",
          }}
        >
          {categories.map((category) => (
            <Button
              key={category.key}
              onClick={() => setActiveCategory(category.key)}
              sx={{
                bgcolor: activeCategory === category.key ? "white" : "transparent",
                color: "#2c3e50",
                fontWeight: activeCategory === category.key ? 600 : 400,
                textTransform: "none",
                borderRadius: "32px",
                px: 3,
                py: 1,
                minWidth: "auto",
                boxShadow:
                  activeCategory === category.key
                    ? "0 2px 8px rgba(0,0,0,0.1)"
                    : "none",
                opacity: activeCategory === category.key ? 1 : 0.8,
                "&:hover": {
                  bgcolor:
                    activeCategory === category.key
                      ? "white"
                      : "rgba(255,255,255,0.5)",
                },
              }}
            >
              {category.label}
            </Button>
          ))}
        </Box>

        {/* Error Alert */}
        {hasError && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {hasError}
          </Alert>
        )}

        {/* Product Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              lg: "1fr 1fr 1fr 1fr",
            },
            gap: 4,
            mb: 6,
            minHeight: 300,
            gridAutoRows: "1fr",
          }}
        >
          {isLoading ? (
            // Loading state
            <Box
              sx={{
                gridColumn: "1 / -1",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
              }}
            >
              <CircularProgress />
            </Box>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                style={{ height: "100%" }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 5,
                    overflow: "hidden",
                    background: getCardGradient(index),
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    position: "relative",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                    },
                  }}
                >
                  {/* Product Image with Add Icon */}
                  <Box
                    sx={{
                      position: "relative",
                      height: 200,
                      minHeight: 200,
                      maxHeight: 200,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 3,
                      flexShrink: 0,
                    }}
                    onClick={() => handleProductClick(product)}
                  >
                    {/* Add Icon Top Right */}
                    <IconButton
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        bgcolor: "rgba(0,0,0,0.5)",
                        color: "white",
                        width: 36,
                        height: 36,
                        "&:hover": {
                          bgcolor: "rgba(0,0,0,0.7)",
                        },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>

                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: "70%",
                        height: "70%",
                        objectFit: "contain",
                        filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.2))",
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </Box>

                  {/* Product Info */}
                  <Box
                    sx={{
                      bgcolor: "white",
                      p: 2.5,
                      borderBottomLeftRadius: 20,
                      borderBottomRightRadius: 20,
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      minHeight: 0,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: "#2c3e50",
                        mb: 0.5,
                        fontSize: "1rem",
                        lineHeight: "1.4",
                        width: "100%",
                        height: "2.8em", // 2 lines
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        wordBreak: "break-word",
                      }}
                      title={product.name}
                    >
                      {product.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "#7f8c8d",
                        mb: 2,
                        fontSize: "0.875rem",
                        height: "1.3em",
                        lineHeight: "1.3em",
                      }}
                    >
                      {translate("store.bestSelling.popularItems")}
                    </Typography>

                    {/* Action Buttons */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        justifyContent: "flex-start",
                        mt: "auto",
                      }}
                    >
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleProductClick(product)}
                        sx={{
                          bgcolor: "#2c3e50",
                          color: "white",
                          textTransform: "none",
                          borderRadius: 2,
                          py: 1,
                          px: 2,
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          minHeight: 44,
                          "&:hover": {
                            bgcolor: "#34495e",
                          },
                        }}
                      >
                        {translate("store.bestSelling.viewDetails")}
                      </Button>

                      <IconButton
                        sx={{
                          bgcolor: "white",
                          border: "1px solid #e0e0e0",
                          borderRadius: 2,
                          width: 44,
                          minWidth: 44,
                          height: 44,
                          minHeight: 44,
                          flexShrink: 0,
                          "&:hover": {
                            bgcolor: "#f5f5f5",
                          },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <CompareArrowsIcon
                          sx={{ color: "#7f8c8d", fontSize: 18 }}
                        />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            ))
          ) : (
            // Empty state
            <Box
              sx={{
                gridColumn: "1 / -1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 200,
                color: "#666",
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                {translate("store.bestSelling.noProductsFound", {
                  category: activeCategory.toLowerCase(),
                })}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                {translate("store.bestSelling.checkBackLater")}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Navigation Arrows */}
        {totalPages > 1 && !isLoading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 3,
            }}
          >
            <IconButton
              onClick={handlePrevPage}
              disabled={!canGoPrev}
              sx={{
                bgcolor: "white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                width: 52,
                height: 52,
                "&:hover": {
                  bgcolor: "#E8E3D5",
                  transform: canGoPrev ? "scale(1.1)" : "none",
                },
                "&:disabled": {
                  opacity: 0.3,
                  cursor: "not-allowed",
                },
                transition: "all 0.3s ease",
              }}
            >
              <ArrowBackIcon sx={{ color: "#7f8c8d" }} />
            </IconButton>

            {/* Page Indicator */}
            <Typography
              variant="body2"
              sx={{
                color: "#7f8c8d",
                fontWeight: 600,
                minWidth: 80,
                textAlign: "center",
              }}
            >
              {currentPage + 1} / {totalPages}
            </Typography>

            <IconButton
              onClick={handleNextPage}
              disabled={!canGoNext}
              sx={{
                bgcolor: "white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                width: 52,
                height: 52,
                "&:hover": {
                  bgcolor: "#E8E3D5",
                  transform: canGoNext ? "scale(1.1)" : "none",
                },
                "&:disabled": {
                  opacity: 0.3,
                  cursor: "not-allowed",
                },
                transition: "all 0.3s ease",
              }}
            >
              <ArrowForwardIcon sx={{ color: "#7f8c8d" }} />
            </IconButton>
          </Box>
        )}
      </Container>
    </Box>
  );
}
