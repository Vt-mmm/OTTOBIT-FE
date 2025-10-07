import React, { useState } from "react";
import { Card, Typography, Box, Button, Chip, Rating } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { CourseType } from "common/@types/course";

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
  price?: number; // NEW: Price from backend
  type?: CourseType; // NEW: Course type from backend
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

// Mock data generators based on course ID for consistency
const generateMockRating = (
  courseId: string
): { rating: number; reviewCount: number } => {
  const hash = courseId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rating = 4.1 + (hash % 9) / 10; // 4.1 - 4.9
  const reviewCount = 50 + (hash % 500); // 50-550 reviews
  return { rating: Math.round(rating * 10) / 10, reviewCount };
};

export default function CourseCard({
  id,
  title,
  imageUrl,
  createdByName,
  lessonsCount,
  enrollmentsCount,
  onClick,
  isEnrolled = false,
  onEnroll,
  price = 0, // Default to 0 if not provided
  type = CourseType.Free, // Default to Free if not provided
}: CourseCardProps) {
  const [imgSrc, setImgSrc] = useState<string>(
    imageUrl || getPlaceholderImage(id)
  );

  // Generate mock data based on course ID for consistency
  const { rating, reviewCount } = generateMockRating(id);

  // Determine course pricing display based on backend data
  const isFree = type === CourseType.Free || price === 0;
  const priceDisplay = isFree ? "Miễn phí" : `${price.toLocaleString()} VND`;

  const handleImageError = () => {
    setImgSrc(DEFAULT_FALLBACK);
  };

  const handleEnrollClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEnroll) {
      onEnroll(id);
    }
  };

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" }, // Horizontal on larger screens
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        position: "relative",
        borderRadius: 2,
        border: "1px solid #e0e0e0",
        backgroundColor: "white",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
          borderColor: "#4caf50",
        },
        width: "100%",
        overflow: "hidden",
      }}
      onClick={() => onClick(id)}
    >
      {/* Image Section */}
      <Box
        sx={{
          width: { xs: "100%", sm: "240px" },
          height: { xs: "180px", sm: "160px" },
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f9fa",
          position: "relative",
        }}
      >
        {/* Pricing Badge */}
        <Chip
          label={priceDisplay}
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: isFree ? "#4caf50" : "#ff9800",
            color: "white",
            fontSize: "0.7rem",
            fontWeight: 600,
            zIndex: 2,
          }}
        />

        {/* Enrolled Badge */}
        {isEnrolled && (
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: "0.8rem !important" }} />}
            label="Đã tham gia"
            size="small"
            sx={{
              position: "absolute",
              bottom: 8,
              right: 8,
              backgroundColor: "#4caf50",
              color: "white",
              fontSize: "0.65rem",
              fontWeight: 600,
              zIndex: 2,
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
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            padding: "16px",
          }}
        />
      </Box>

      {/* Content Section */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          p: { xs: 2, sm: 2.5 },
          justifyContent: "space-between",
        }}
      >
        <Box>
          {/* Title */}
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 600,
              fontSize: { xs: "1rem", sm: "1.1rem" },
              lineHeight: 1.3,
              mb: 0.5,
              color: "#1976d2",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              "&:hover": {
                color: "#1565c0",
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
                fontSize: "0.8rem",
                mb: 1,
                fontWeight: 500,
              }}
            >
              Ottobit • {createdByName}
            </Typography>
          )}

          {/* Rating */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              mb: 1.5,
            }}
          >
            <Rating
              value={rating}
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
                fontSize: "0.75rem",
                ml: 0.5,
              }}
            >
              {rating} ({reviewCount.toLocaleString()} đánh giá)
            </Typography>
          </Box>
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
                {lessonsCount} bài học
              </Box>
            )}

            {/* Students */}
            {enrollmentsCount !== undefined && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PeopleIcon sx={{ fontSize: "0.9rem", mr: 0.3 }} />
                {enrollmentsCount.toLocaleString()} học viên
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
          <Box sx={{ display: "flex", gap: 1 }}>
            {!isEnrolled ? (
              <Button
                variant="contained"
                size="small"
                onClick={handleEnrollClick}
                sx={{
                  textTransform: "none",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  px: 2,
                  py: 0.8,
                  borderRadius: 1,
                  backgroundColor: isFree ? "#4caf50" : "#1976d2",
                  "&:hover": {
                    backgroundColor: isFree ? "#43a047" : "#1565c0",
                  },
                }}
              >
                {isFree ? "Tham gia miễn phí" : "Tham gia khóa học"}
              </Button>
            ) : (
              <Button
                variant="contained"
                size="small"
                onClick={() => onClick(id)}
                sx={{
                  textTransform: "none",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  px: 2,
                  py: 0.8,
                  borderRadius: 1,
                  backgroundColor: "#4caf50",
                  "&:hover": {
                    backgroundColor: "#43a047",
                  },
                }}
              >
                Tiếp tục học
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
