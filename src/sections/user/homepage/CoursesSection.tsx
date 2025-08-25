import React, { useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Avatar,
} from "@mui/material";
import { motion, useInView } from "framer-motion";
import {
  PlayArrow,
  Schedule,
  Group,
  Star,
  Engineering,
  Computer,
  Psychology,
  Science,
} from "@mui/icons-material";

// Course data
const coursesData = [
  {
    id: 1,
    title: "Robotics Fundamentals",
    description:
      "Học cơ bản về robotics, từ lắp ráp đến lập trình điều khiển robot đơn giản",
    level: "Cơ bản",
    duration: "8 tuần",
    students: 1250,
    rating: 4.8,
    image: "https://placehold.co/400x200/22c55e/ffffff?text=🤖+Robotics",
    instructor: "TS. Nguyễn Văn A",
    price: "2,500,000đ",
    category: "Robotics",
    icon: <Engineering sx={{ fontSize: 24 }} />,
    color: "#22c55e",
    skills: ["Arduino", "C++", "Sensor", "Motor Control"],
  },
  {
    id: 2,
    title: "Visual Programming với Scratch",
    description:
      "Lập trình trực quan dành cho trẻ em, học cách tư duy logic thông qua game và animation",
    level: "Cơ bản",
    duration: "6 tuần",
    students: 2100,
    rating: 4.9,
    image: "https://placehold.co/400x200/16a34a/ffffff?text=💻+Scratch",
    instructor: "ThS. Trần Thị B",
    price: "1,800,000đ",
    category: "Programming",
    icon: <Computer sx={{ fontSize: 24 }} />,
    color: "#16a34a",
    skills: ["Scratch", "Logic", "Animation", "Game Design"],
  },
  {
    id: 3,
    title: "AI & Machine Learning for Kids",
    description:
      "Khám phá thế giới trí tuệ nhân tạo qua các dự án thú vị và dễ hiểu",
    level: "Trung cấp",
    duration: "10 tuần",
    students: 850,
    rating: 4.7,
    image: "https://placehold.co/400x200/15803d/ffffff?text=🧠+AI",
    instructor: "PGS. Lê Văn C",
    price: "3,200,000đ",
    category: "AI",
    icon: <Psychology sx={{ fontSize: 24 }} />,
    color: "#15803d",
    skills: ["Python", "TensorFlow", "Data Science", "Neural Networks"],
  },
  {
    id: 4,
    title: "STEM Project Lab",
    description:
      "Làm việc nhóm thực hiện các dự án STEM tích hợp, từ ý tưởng đến sản phẩm",
    level: "Nâng cao",
    duration: "12 tuần",
    students: 650,
    rating: 4.9,
    image: "https://placehold.co/400x200/166534/ffffff?text=🔬+STEM",
    instructor: "TS. Phạm Văn D",
    price: "4,000,000đ",
    category: "Project",
    icon: <Science sx={{ fontSize: 24 }} />,
    color: "#166534",
    skills: ["Research", "Design Thinking", "Prototyping", "Presentation"],
  },
];

const CourseCard: React.FC<{
  course: (typeof coursesData)[0];
  index: number;
}> = ({ course, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Cơ bản":
        return "#22c55e";
      case "Trung cấp":
        return "#f59e0b";
      case "Nâng cao":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ y: 50, opacity: 0 }}
      animate={isInView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Card
        component={motion.div}
        whileHover={{
          y: -8,
          transition: { duration: 0.3 },
        }}
        sx={{
          height: "100%",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          border: `1px solid ${course.color}20`,
          borderRadius: "20px",
          boxShadow: `0 8px 32px ${course.color}15`,
          transition: "all 0.3s ease",
          overflow: "hidden",
          "&:hover": {
            boxShadow: `0 12px 40px ${course.color}25`,
            background: "rgba(255, 255, 255, 1)",
          },
        }}
      >
        {/* Course Image */}
        <Box
          sx={{
            height: 200,
            background: `linear-gradient(135deg, ${course.color}, ${course.color}dd)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            component="img"
            src={course.image}
            alt={course.title}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              bgcolor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "12px",
              p: 1,
              display: "flex",
              alignItems: "center",
              color: course.color,
            }}
          >
            {course.icon}
          </Box>
          <Box
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
            }}
          >
            <Chip
              label={course.level}
              size="small"
              sx={{
                bgcolor: getLevelColor(course.level),
                color: "white",
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            />
          </Box>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {/* Course Title & Category */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="overline"
              sx={{
                color: course.color,
                fontWeight: 600,
                fontSize: "0.75rem",
                letterSpacing: 1,
              }}
            >
              {course.category}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#1a1a1a",
                mb: 1,
                fontSize: "1.1rem",
                lineHeight: 1.3,
              }}
            >
              {course.title}
            </Typography>
          </Box>

          {/* Description */}
          <Typography
            variant="body2"
            sx={{
              color: "#666",
              lineHeight: 1.6,
              mb: 3,
              fontSize: "0.9rem",
            }}
          >
            {course.description}
          </Typography>

          {/* Skills */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {course.skills.slice(0, 3).map((skill, i) => (
                <Chip
                  key={i}
                  label={skill}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: "0.7rem",
                    height: 24,
                    borderColor: `${course.color}40`,
                    color: course.color,
                  }}
                />
              ))}
              {course.skills.length > 3 && (
                <Chip
                  label={`+${course.skills.length - 3}`}
                  size="small"
                  sx={{
                    fontSize: "0.7rem",
                    height: 24,
                    bgcolor: `${course.color}20`,
                    color: course.color,
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Course Info */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Schedule sx={{ fontSize: 16, color: "#666" }} />
                <Typography variant="caption" color="#666">
                  {course.duration}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Group sx={{ fontSize: 16, color: "#666" }} />
                <Typography variant="caption" color="#666">
                  {course.students}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Star sx={{ fontSize: 16, color: "#f59e0b" }} />
                <Typography variant="caption" color="#666">
                  {course.rating}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Instructor & Price */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: course.color,
                  fontSize: "0.8rem",
                }}
              >
                {course.instructor.split(" ").pop()?.charAt(0)}
              </Avatar>
              <Typography variant="caption" color="#666">
                {course.instructor}
              </Typography>
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: course.color,
                fontSize: "1rem",
              }}
            >
              {course.price}
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<PlayArrow />}
              sx={{
                bgcolor: course.color,
                color: "white",
                fontWeight: 600,
                py: 1.2,
                "&:hover": {
                  bgcolor: `${course.color}dd`,
                },
              }}
            >
              Bắt đầu học
            </Button>
            <Button
              variant="outlined"
              sx={{
                minWidth: "auto",
                px: 2,
                borderColor: course.color,
                color: course.color,
                "&:hover": {
                  borderColor: course.color,
                  bgcolor: `${course.color}10`,
                },
              }}
            >
              ♡
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CoursesSection: React.FC = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <Box
      ref={sectionRef}
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      sx={{
        py: { xs: 8, md: 12 },
        position: "relative",
        background: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 30% 20%, rgba(34, 197, 94, 0.05) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(22, 163, 74, 0.05) 0%, transparent 50%)",
          zIndex: 0,
        },
      }}
    >
      <Container
        maxWidth={false}
        sx={{ maxWidth: "1440px", position: "relative", zIndex: 1 }}
      >
        {/* Header */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#22c55e",
                fontWeight: 600,
                mb: 2,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                fontSize: { xs: "0.9rem", md: "1rem" },
              }}
            >
              Khóa học STEM
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                color: "#1a1a1a",
                mb: 3,
                fontSize: { xs: "2.2rem", sm: "2.8rem", md: "3.2rem" },
                lineHeight: 1.2,
              }}
            >
              Khám phá{" "}
              <Box
                component="span"
                sx={{
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                thế giới STEM
              </Box>{" "}
              cùng OttoBit
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#666",
                fontSize: { xs: "1.1rem", md: "1.25rem" },
                lineHeight: 1.7,
                maxWidth: "700px",
                mx: "auto",
              }}
            >
              Từ robotics cơ bản đến AI nâng cao, chúng tôi có đầy đủ các khóa
              học để giúp bạn phát triển kỹ năng STEM một cách toàn diện
            </Typography>
          </Box>
        </motion.div>

        {/* Courses Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          {coursesData.map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
          ))}
        </Box>

        {/* View All Button */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Box sx={{ textAlign: "center", mt: 8 }}>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: "#22c55e",
                color: "#22c55e",
                px: 4,
                py: 1.5,
                borderRadius: "12px",
                fontWeight: 600,
                fontSize: "1rem",
                "&:hover": {
                  borderColor: "#16a34a",
                  bgcolor: "rgba(34, 197, 94, 0.05)",
                },
              }}
            >
              Xem tất cả khóa học
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default CoursesSection;
