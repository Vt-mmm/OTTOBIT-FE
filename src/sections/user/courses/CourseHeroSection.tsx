import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Button,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
// import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useLocales } from "../../../hooks";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getCourses } from "../../../redux/course/courseSlice";
import CourseCarousel3D from "../../../components/course/CourseCarousel3D";
import AnimatedBlob from "../../../components/common/AnimatedBlob";
import CourseFilterDialog, { CourseFilters } from "./CourseFilterDialog";

interface CourseHeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterApply?: (filters: CourseFilters) => void;
}

export default function CourseHeroSection({
  searchQuery,
  onSearchChange,
  onFilterApply,
}: CourseHeroSectionProps) {
  const { translate } = useLocales();
  const dispatch = useAppDispatch();
  const { data: courses, isLoading } = useAppSelector(
    (state) => state.course.courses
  );
  const [displayedText, setDisplayedText] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const fullText = translate("courses.Title");

  // Listen for filter dialog open event
  useEffect(() => {
    const handleOpenFilter = () => {
      setFilterOpen(true);
    };

    window.addEventListener("openCourseFilter", handleOpenFilter);
    return () =>
      window.removeEventListener("openCourseFilter", handleOpenFilter);
  }, []);

  // Fetch courses for carousel
  useEffect(() => {
    if (!courses?.items) {
      dispatch(getCourses({ pageSize: 10 }));
    }
  }, [dispatch, courses?.items]);

  // Typing effect for title
  useEffect(() => {
    if (fullText) {
      let index = 0;
      const timer = setInterval(() => {
        if (index <= fullText.length) {
          setDisplayedText(fullText.substring(0, index));
          index++;
        } else {
          clearInterval(timer);
        }
      }, 100);
      return () => clearInterval(timer);
    }
  }, [fullText]);

  // Get top courses for carousel (limit to 6 for better performance)
  const carouselCourses = courses?.items?.slice(0, 6) || [];

  // Calculate max visible cards based on available courses
  const getMaxVisibleCards = () => {
    const count = carouselCourses.length;
    if (count <= 1) return 1;
    if (count === 2) return 2;
    if (count === 3) return 3;
    return Math.min(5, count); // Max 5 cards visible
  };

  return (
    <Box
      sx={{
        background:
          "linear-gradient(135deg, #ffffff 0%, #f8fffe 50%, #e8f5e8 100%)",
        position: "relative",
        overflow: "hidden",
        minHeight: { xs: "auto", md: "auto" },
      }}
    >
      {/* Animated Blobs */}
      <AnimatedBlob
        color="#4caf50"
        size={400}
        top="-10%"
        left="-10%"
        delay={0}
        duration={25}
        opacity={0.08}
      />
      <AnimatedBlob
        color="#2196f3"
        size={350}
        top="20%"
        right="-5%"
        delay={2}
        duration={20}
        opacity={0.06}
      />
      <AnimatedBlob
        color="#4caf50"
        size={300}
        bottom="-5%"
        left="50%"
        delay={4}
        duration={22}
        opacity={0.05}
      />

      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          zIndex: 1,
          pt: { xs: 6, md: 8 },
          pb: { xs: 2, md: 3 },
        }}
      >
        {/* Main Hero Content - Split Layout */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "45% 55%" },
            gap: { xs: 4, md: 6 },
            alignItems: "center",
            mb: 0,
          }}
        >
          {/* Left Side - 3D Carousel */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            sx={{
              order: { xs: 2, md: 1 },
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: { xs: 350, md: 450 },
            }}
          >
            {!isLoading && carouselCourses.length > 0 ? (
              <CourseCarousel3D
                courses={carouselCourses}
                autoPlayInterval={5000}
                maxVisibleCards={getMaxVisibleCards()}
              />
            ) : (
              <Box
                sx={{
                  width: 280,
                  height: 380,
                  backgroundColor: "rgba(255,255,255,0.5)",
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography color="text.secondary">Đang tải...</Typography>
              </Box>
            )}
          </Box>

          {/* Right Side - Content */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            sx={{
              order: { xs: 1, md: 2 },
              textAlign: { xs: "center", md: "left" },
            }}
          >
            {/* Main Title with Typing Effect */}
            <Typography
              variant="h1"
              component={motion.h1}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              sx={{
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4rem" },
                lineHeight: 1.2,
                background:
                  "linear-gradient(135deg, #2e7d32 0%, #4caf50 50%, #66bb6a 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
                minHeight: { xs: "auto", md: 150 },
              }}
            >
              {displayedText}
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  width: 4,
                  height: { xs: 40, md: 60 },
                  backgroundColor: "#4caf50",
                  ml: 1,
                  animation: "blink 1s infinite",
                  "@keyframes blink": {
                    "0%, 49%": { opacity: 1 },
                    "50%, 100%": { opacity: 0 },
                  },
                }}
              />
            </Typography>

            {/* Subtitle */}
            <Typography
              variant="h5"
              component={motion.p}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              sx={{
                color: "#555",
                mb: 4,
                fontSize: { xs: "1.1rem", md: "1.3rem" },
                fontWeight: 400,
                lineHeight: 1.6,
                maxWidth: 600,
                mx: { xs: "auto", md: 0 },
              }}
            >
              {translate("courses.Subtitle")}
            </Typography>

            {/* Search Bar */}
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              sx={{
                maxWidth: 600,
                mx: { xs: "auto", md: 0 },
                mb: 3,
              }}
            >
              <TextField
                fullWidth
                placeholder={translate("courses.SearchPlaceholder")}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onFilterApply?.({});
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => onFilterApply?.({})}
                        sx={{ color: "#4caf50" }}
                      >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 3,
                    boxShadow: "0 4px 20px rgba(76, 175, 80, 0.15)",
                    border: "2px solid transparent",
                    transition: "all 0.3s ease",
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    "&:hover": {
                      boxShadow: "0 6px 25px rgba(76, 175, 80, 0.2)",
                      border: "2px solid rgba(76, 175, 80, 0.3)",
                    },
                    "&.Mui-focused": {
                      boxShadow: "0 8px 30px rgba(76, 175, 80, 0.25)",
                      border: "2px solid #4caf50",
                    },
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-input": {
                    py: 2.5,
                    fontSize: "1.05rem",
                  },
                }}
              />
            </Box>

            {/* Action Button */}
            <Button
              component={motion.button}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 8px 30px rgba(76, 175, 80, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => {
                const element = document.getElementById("courses-list");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
              sx={{
                px: 4,
                py: 2,
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: 3,
                backgroundColor: "#4caf50",
                textTransform: "none",
                boxShadow: "0 4px 20px rgba(76, 175, 80, 0.3)",
                "&:hover": {
                  backgroundColor: "#45a049",
                },
              }}
            >
              {translate("courses.ExploreAllCourses") ||
                "Khám phá tất cả khóa học"}
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Filter Dialog */}
      <CourseFilterDialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={(filters) => {
          onFilterApply?.(filters);
          setFilterOpen(false);
        }}
      />
    </Box>
  );
}
