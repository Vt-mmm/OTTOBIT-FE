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
import { formatVND } from "utils/utils";

const categories = ["Robots", "Components"];

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  type: "robot" | "component";
}

export default function BestSellingProductSection() {
  const [activeCategory, setActiveCategory] = useState("Robots");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { robots } = useAppSelector((state) => state.robot);
  const { components } = useAppSelector((state) => state.component);

  // Fetch data on component mount
  useEffect(() => {
    // Fetch robots with limit for best selling
    dispatch(
      getRobotsThunk({
        pageNumber: 1,
        pageSize: 4,
        sortBy: 5, // CreatedAt enum value
        sortDirection: 2, // DESC enum value
      })
    );
    // Fetch components with limit for best selling
    dispatch(
      getComponentsThunk({
        page: 1,
        size: 4,
        orderBy: "CreatedAt",
        orderDirection: "DESC",
      })
    );
  }, [dispatch]);

  // Convert API data to unified product format
  const convertToProducts = (): Product[] => {
    if (activeCategory === "Robots") {
      return (
        robots.data?.items?.slice(0, 4).map((robot) => ({
          id: robot.id,
          name: robot.name,
          price: robot.price || 0,
          image: robot.imageUrl || "/asset/OttobitCar.png",
          type: "robot" as const,
        })) || []
      );
    } else {
      return (
        components.data?.items?.slice(0, 4).map((component) => ({
          id: component.id,
          name: component.name,
          price: component.price || 0,
          image: component.imageUrl || "/asset/Microbitv2-removebg-preview.png",
          type: "component" as const,
        })) || []
      );
    }
  };

  const filteredProducts = convertToProducts();
  const isLoading = robots.isLoading || components.isLoading;
  const hasError = robots.error || components.error;

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
              Daily Deals
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
            See All
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
              key={category}
              onClick={() => setActiveCategory(category)}
              sx={{
                bgcolor: activeCategory === category ? "white" : "transparent",
                color: "#2c3e50",
                fontWeight: activeCategory === category ? 600 : 400,
                textTransform: "none",
                borderRadius: "32px",
                px: 3,
                py: 1,
                minWidth: "auto",
                boxShadow:
                  activeCategory === category
                    ? "0 2px 8px rgba(0,0,0,0.1)"
                    : "none",
                opacity: activeCategory === category ? 1 : 0.8,
                "&:hover": {
                  bgcolor:
                    activeCategory === category
                      ? "white"
                      : "rgba(255,255,255,0.5)",
                },
              }}
            >
              {category}
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
              >
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 5,
                    overflow: "visible",
                    background: getCardGradient(index),
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    position: "relative",
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
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 3,
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
                      p: 3,
                      borderBottomLeftRadius: 20,
                      borderBottomRightRadius: 20,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: "#2c3e50",
                        mb: 0.5,
                        fontSize: "1.1rem",
                      }}
                    >
                      {product.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "#7f8c8d",
                        mb: 2.5,
                        fontSize: "0.9rem",
                      }}
                    >
                      {product.type === "robot" ? "Popular items" : "Popular items"}
                    </Typography>

                    {/* Price Section */}
                    <Box
                      sx={{
                        mb: 2.5,
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: "#2c3e50",
                          fontSize: "1.4rem",
                        }}
                      >
                        {formatVND(product.price)}
                      </Typography>
                    </Box>

                    {/* Action Buttons */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        justifyContent: "flex-start",
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
                          py: 1.2,
                          fontWeight: 600,
                          "&:hover": {
                            bgcolor: "#34495e",
                          },
                        }}
                      >
                        Add to Cart
                      </Button>

                      <IconButton
                        sx={{
                          bgcolor: "white",
                          border: "1px solid #e0e0e0",
                          borderRadius: 2,
                          width: 44,
                          height: 44,
                          "&:hover": {
                            bgcolor: "#f5f5f5",
                          },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <CompareArrowsIcon sx={{ color: "#7f8c8d", fontSize: 20 }} />
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
                No {activeCategory.toLowerCase()} found
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Please check back later for new products
              </Typography>
            </Box>
          )}
        </Box>

        {/* Navigation Arrows */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <IconButton
            sx={{
              bgcolor: "white",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              width: 52,
              height: 52,
              "&:hover": {
                bgcolor: "#E8E3D5",
                transform: "scale(1.1)",
              },
              transition: "all 0.3s ease",
            }}
          >
            <ArrowBackIcon sx={{ color: "#7f8c8d" }} />
          </IconButton>

          <IconButton
            sx={{
              bgcolor: "white",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              width: 52,
              height: 52,
              "&:hover": {
                bgcolor: "#E8E3D5",
                transform: "scale(1.1)",
              },
              transition: "all 0.3s ease",
            }}
          >
            <ArrowForwardIcon sx={{ color: "#7f8c8d" }} />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
}
