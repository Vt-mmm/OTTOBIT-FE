import { useState, useEffect, useCallback } from "react";
import { Box, IconButton } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Course } from "../../common/@types/course";
import CourseCard3D from "./CourseCard3D";
import { useNavigate } from "react-router-dom";
import { PATH_USER } from "../../routes/paths";

interface CourseCarousel3DProps {
  courses: Course[];
  autoPlayInterval?: number;
  maxVisibleCards?: number;
}

export default function CourseCarousel3D({
  courses,
  autoPlayInterval = 5000,
  maxVisibleCards = 5,
}: CourseCarousel3DProps) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play functionality - only if more than 1 course
  useEffect(() => {
    if (!isPaused && courses.length > 1) {
      const timer = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % courses.length);
      }, autoPlayInterval);

      return () => clearInterval(timer);
    }
  }, [isPaused, courses.length, autoPlayInterval]);

  const handlePrevious = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + courses.length) % courses.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000);
  }, [courses.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % courses.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000);
  }, [courses.length]);

  const handleCardClick = useCallback(() => {
    const activeCourse = courses[activeIndex];
    if (activeCourse) {
      navigate(PATH_USER.courseDetail.replace(":id", activeCourse.id));
    }
  }, [activeIndex, courses, navigate]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrevious]);

  if (!courses || courses.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          height: 450,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#999",
        }}
      >
        Không có khóa học nào
      </Box>
    );
  }

  // Calculate visible cards range - no duplication for small course count
  const getVisibleCards = () => {
    const visibleCards: { course: Course; index: number }[] = [];
    const halfVisible = Math.floor(maxVisibleCards / 2);

    // If we have fewer courses than maxVisibleCards, only show actual courses
    if (courses.length <= maxVisibleCards) {
      courses.forEach((course, index) => {
        visibleCards.push({ course, index });
      });
      return visibleCards;
    }

    // Normal carousel behavior with wrapping
    for (let i = -halfVisible; i <= halfVisible; i++) {
      const index = (activeIndex + i + courses.length) % courses.length;
      visibleCards.push({ course: courses[index], index });
    }

    return visibleCards;
  };

  const visibleCards = getVisibleCards();

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: 450,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: 2000,
        overflow: "visible",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 3D Cards Container */}
      <Box
        sx={{
          position: "relative",
          width: 280,
          height: 380,
          transformStyle: "preserve-3d",
        }}
      >
        <AnimatePresence mode="popLayout">
          {visibleCards.map(({ course, index }) => {
            const offset = index - activeIndex;
            // Only render cards within visible range
            if (Math.abs(offset) <= Math.floor(maxVisibleCards / 2)) {
              return (
                <CourseCard3D
                  key={course.id}
                  course={course}
                  index={index}
                  activeIndex={activeIndex}
                  onClick={handleCardClick}
                />
              );
            }
            return null;
          })}
        </AnimatePresence>
      </Box>

      {/* Navigation Arrows - Only show if more than 1 course */}
      {courses.length > 1 && (
        <>
          <IconButton
            onClick={handlePrevious}
            component={motion.button}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            sx={{
              position: "absolute",
              left: { xs: -10, md: -20 },
              top: "50%",
              transform: "translateY(-50%)",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              width: { xs: 40, md: 50 },
              height: { xs: 40, md: 50 },
              zIndex: 10,
              "&:hover": {
                backgroundColor: "#fff",
                boxShadow: "0 6px 25px rgba(0,0,0,0.15)",
              },
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: { xs: 28, md: 32 } }} />
          </IconButton>

          <IconButton
            onClick={handleNext}
            component={motion.button}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            sx={{
              position: "absolute",
              right: { xs: -10, md: -20 },
              top: "50%",
              transform: "translateY(-50%)",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              width: { xs: 40, md: 50 },
              height: { xs: 40, md: 50 },
              zIndex: 10,
              "&:hover": {
                backgroundColor: "#fff",
                boxShadow: "0 6px 25px rgba(0,0,0,0.15)",
              },
            }}
          >
            <ChevronRightIcon sx={{ fontSize: { xs: 28, md: 32 } }} />
          </IconButton>
        </>
      )}

      {/* Progress Indicators - Only show if more than 1 course */}
      {courses.length > 1 && (
        <Box
          sx={{
            position: "absolute",
            bottom: -40,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 1,
            zIndex: 10,
          }}
        >
          {courses.map((_, index) => (
            <Box
              key={index}
              component={motion.div}
              animate={{
                scale: index === activeIndex ? 1.2 : 1,
                backgroundColor:
                  index === activeIndex
                    ? "#4caf50"
                    : "rgba(76, 175, 80, 0.3)",
              }}
              transition={{ duration: 0.3 }}
              onClick={() => {
                setActiveIndex(index);
                setIsPaused(true);
                setTimeout(() => setIsPaused(false), 3000);
              }}
              sx={{
                width: index === activeIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                cursor: "pointer",
                transition: "width 0.3s ease",
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
