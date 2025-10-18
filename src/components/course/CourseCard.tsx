import { useState } from "react";
import { Card, Typography, Box, Button, Chip, Rating } from "@mui/material";
import { motion } from "framer-motion";
import PeopleIcon from "@mui/icons-material/People";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { CourseType } from "common/@types/course";
import { useLocales } from "hooks";
import AddToCartButton from "../cart/AddToCartButton";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdByName?: string;
  lessonsCount?: number;
  enrollmentsCount?: number;
  createdAt: string;
  updatedAt: string;
  onClick: (id: string) => void;
  compact?: boolean;
  isEnrolled?: boolean;
  onEnroll?: (courseId: string) => void;
  price?: number; // Price from backend
  type?: CourseType; // Course type from backend
  ratingAverage?: number; // Rating average from backend
  ratingCount?: number; // Rating count from backend
}

// Array of local images from public folder
const placeholderImages = [
  "/asset/BlockLy.png", // Blockly programming
  "/asset/OttobitCar.png", // Ottobit robot car
  "/asset/Microbitv2-removebg-preview.png", // Microbit
  "/OttoDIY/code-photo-2.png", // Code photo
  "/OttoDIY/create-photo-2.png", // Create photo
  "/OttoDIY/connect-photo-2.png", // Connect photo
];

// Function to get consistent placeholder for course ID
const getPlaceholderImage = (courseId: string) => {
  const index =
    courseId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    placeholderImages.length;
  return placeholderImages[index];
};

// Default fallback image
const DEFAULT_FALLBACK = "/asset/LogoOttobit.png";


export default function CourseCard({
  id,
  title,
  imageUrl,
  createdByName,
  lessonsCount,
  enrollmentsCount,
  onClick,
  isEnrolled = false,
  price = 0, // Default to 0 if not provided
  type = CourseType.Free, // Default to Free if not provided
  ratingAverage = 0, // Default to 0 if not provided
  ratingCount = 0, // Default to 0 if not provided
}: CourseCardProps) {
  const { translate } = useLocales();
  const [imgSrc, setImgSrc] = useState<string>(
    imageUrl || getPlaceholderImage(id)
  );

  // Determine course pricing display based on backend data
  const isFree = type === CourseType.Free || price === 0;
  // priceDisplay no longer needed on card

  const handleImageError = () => {
    setImgSrc(DEFAULT_FALLBACK);
  };

  // free join now navigates to detail; no direct enroll here

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      sx={{
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        position: "relative",
        borderRadius: 3,
        border: "2px solid transparent",
        backgroundColor: "white",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        overflow: "hidden",
        transition: "all 0.3s ease",
        height: "100%",
        "&:hover": {
          boxShadow: "0 8px 30px rgba(76, 175, 80, 0.2)",
          borderColor: "rgba(76, 175, 80, 0.3)",
          "& .course-arrow": {
            transform: "translateX(4px)",
          },
          "& .course-image": {
            transform: "scale(1.05)",
          },
        },
        width: "100%",
      }}
      onClick={() => onClick(id)}
    >
      {/* Image Section */}
      <Box
        sx={{
          width: "100%",
          height: 220,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234caf50' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
            opacity: 0.4,
          },
        }}
      >
        {/* Enrolled Badge */}
        {isEnrolled && (
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: "0.9rem !important" }} />}
            label="ĐÃ THAM GIA"
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              backgroundColor: "#4caf50",
              color: "white",
              fontSize: "0.7rem",
              fontWeight: 700,
              height: 28,
              zIndex: 2,
              boxShadow: "0 2px 8px rgba(76, 175, 80, 0.3)",
              "& .MuiChip-icon": {
                color: "white",
              },
            }}
          />
        )}

        <img
          src={imgSrc}
          alt={title}
          onError={handleImageError}
          className="course-image"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            padding: "16px",
            transition: "transform 0.3s ease",
          }}
        />
      </Box>

      {/* Content Section */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          p: 2.5,
          justifyContent: "space-between",
        }}
      >
        <Box>
          {/* Title */}
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 700,
              fontSize: "1.1rem",
              lineHeight: 1.3,
              mb: 0.75,
              color: "#1a1a1a",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minHeight: 56,
              transition: "color 0.2s",
              "&:hover": {
                color: "#4caf50",
              },
            }}
          >
            {title}
          </Typography>

          {/* Partner/Instructor */}
          {createdByName && (
            <Typography
              variant="body2"
              sx={{
                color: "#666",
                fontSize: "0.85rem",
                mb: 1.5,
                fontWeight: 500,
              }}
            >
              Ottobit • {createdByName}
            </Typography>
          )}

          {/* Rating - From Backend */}
          {ratingCount > 0 ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mb: 1.5,
              }}
            >
              <Rating
                value={ratingAverage}
                readOnly
                size="small"
                precision={0.1}
                sx={{
                  "& .MuiRating-iconFilled": {
                    color: "#ffc107",
                  },
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: "#666",
                  fontSize: "0.8rem",
                  ml: 0.5,
                  fontWeight: 500,
                }}
              >
                {ratingAverage.toFixed(1)}{" "}
                <Box component="span" sx={{ color: "#999" }}>
                  ({ratingCount.toLocaleString()})
                </Box>
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mb: 1.5, height: 24 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#999",
                  fontSize: "0.75rem",
                  fontStyle: "italic",
                }}
              >
                Chưa có đánh giá
              </Typography>
            </Box>
          )}
        </Box>

        {/* Bottom Section */}
        <Box>
          {/* Meta Information */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 1.5,
              mb: 2,
              color: "#666",
              fontSize: "0.8rem",
            }}
          >
            {/* Lessons */}
            {lessonsCount !== undefined && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <MenuBookIcon sx={{ fontSize: "0.9rem", mr: 0.3 }} />
                {lessonsCount} {translate("courses.Lessons")}
              </Box>
            )}

            {/* Students */}
            {enrollmentsCount !== undefined && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PeopleIcon sx={{ fontSize: "0.9rem", mr: 0.3 }} />
                {enrollmentsCount.toLocaleString()}{" "}
                {translate("courses.Students")}
              </Box>
            )}

            {/* Skills tags */}
            <Chip
              label="Blockly"
              size="small"
              variant="outlined"
              sx={{
                fontSize: "0.7rem",
                height: "20px",
                backgroundColor: "#f0f7ff",
                borderColor: "#1976d2",
                color: "#1976d2",
              }}
            />
            <Chip
              label="Robot"
              size="small"
              variant="outlined"
              sx={{
                fontSize: "0.7rem",
                height: "20px",
                backgroundColor: "#f0f7ff",
                borderColor: "#1976d2",
                color: "#1976d2",
              }}
            />
          </Box>

          {/* Action Button */}
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              alignItems: "center",
              mt: 1,
              justifyContent: "space-between",
            }}
          >
            {!isEnrolled ? (
              isFree ? (
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    component={motion.button}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    variant="contained"
                    size="medium"
                    onClick={() => onClick(id)}
                    endIcon={<ArrowForwardIcon className="course-arrow" />}
                    sx={{
                      textTransform: "none",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      px: 2.5,
                      py: 0.75,
                      borderRadius: 2,
                      backgroundColor: "#4caf50",
                      boxShadow: "0 4px 14px rgba(76, 175, 80, 0.3)",
                      "&:hover": {
                        backgroundColor: "#45a049",
                        boxShadow: "0 6px 20px rgba(76, 175, 80, 0.4)",
                      },
                      "& .course-arrow": {
                        transition: "transform 0.2s",
                      },
                    }}
                  >
                    {translate("courses.JoinFree")}
                  </Button>
                </Box>
              ) : (
                <>
                  {/* Price Display */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "#1976d2",
                      fontSize: "1rem",
                    }}
                  >
                    {price.toLocaleString()} VND
                  </Typography>

                  {/* Add to Cart Button */}
                  <Box
                    onClick={(e) => {
                      // Prevent card-level onClick (navigate) when adding to cart
                      e.stopPropagation();
                    }}
                    sx={{
                      "& .MuiButton-root": {
                        py: 0.75, // Nhỏ hơn
                        px: 2.5, // Nhỏ hơn
                        fontSize: "0.8rem", // Nhỏ hơn
                        fontWeight: 600,
                        textTransform: "none",
                        "& .MuiButton-startIcon": {
                          display: "none", // Ẩn icon cart
                        },
                      },
                    }}
                  >
                    <AddToCartButton courseId={id} coursePrice={price} />
                  </Box>
                </>
              )
            ) : (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  component={motion.button}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  variant="contained"
                  size="medium"
                  onClick={() => onClick(id)}
                  endIcon={<ArrowForwardIcon className="course-arrow" />}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    px: 2.5,
                    py: 0.75,
                    borderRadius: 2,
                    backgroundColor: "#4caf50",
                    boxShadow: "0 4px 14px rgba(76, 175, 80, 0.3)",
                    "&:hover": {
                      backgroundColor: "#45a049",
                      boxShadow: "0 6px 20px rgba(76, 175, 80, 0.4)",
                    },
                    "& .course-arrow": {
                      transition: "transform 0.2s",
                    },
                  }}
                >
                  {translate("courses.ContinueLearning")}
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
