import { Box, Typography, Chip, Divider } from "@mui/material";
import {
  CheckCircle as CheckIcon,
  Language as LanguageIcon,
  Assignment as AssignmentIcon,
  LinkedIn as LinkedInIcon,
} from "@mui/icons-material";
import { useLocales } from "../../../../hooks";
import CourseRobotRequirementsSection from "./CourseRobotRequirementsSection";

import { CourseResult } from "common/@types/course";
import { LessonResult, LessonPreview } from "common/@types/lesson";

interface CourseAboutSectionProps {
  course: CourseResult;
  lessons: (LessonResult | LessonPreview)[];
}

export default function CourseAboutSection({ course, lessons }: CourseAboutSectionProps) {
  const { translate } = useLocales();

  // What you'll learn items - Default outcomes (can be extended with BE data in future)
  const learningOutcomes = [
    translate("courses.LearningOutcome1"),
    translate("courses.LearningOutcome2"),
    translate("courses.LearningOutcome3"),
    translate("courses.LearningOutcome4"),
  ];

  // Skills you'll gain - Default skills (can be extended with BE data in future)
  const skills = [
    translate("courses.SkillBlockly"),
    translate("courses.SkillRobotControl"),
    translate("courses.SkillLogicalThinking"),
    translate("courses.SkillProblemSolving"),
    translate("courses.SkillSTEM"),
  ];

  // Details to know - Using BE data
  const detailsToKnow = [
    {
      icon: <LinkedInIcon sx={{ fontSize: 40, color: "#0077B5" }} />,
      title: translate("courses.ShareableCertificate"),
      subtitle: translate("courses.AddToLinkedIn"),
    },
    {
      icon: <AssignmentIcon sx={{ fontSize: 40, color: "#616161" }} />,
      title: translate("courses.Assessments"),
      subtitle: translate("courses.AssignmentsCount", { count: lessons.length }),
    },
    {
      icon: <LanguageIcon sx={{ fontSize: 40, color: "#616161" }} />,
      title: translate("courses.TaughtInVietnamese"),
      subtitle: translate("courses.Vietnamese"),
    },
  ];

  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: 1 }}>
      {/* What you'll learn */}
      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600, 
            mb: 3, 
            color: "#1f1f1f",
            fontSize: { xs: "1.5rem", md: "1.75rem" },
          }}
        >
          {translate("courses.WhatYouWillLearn")}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2.5,
            rowGap: 2,
          }}
        >
          {learningOutcomes.map((outcome, index) => (
            <Box 
              key={index} 
              sx={{ 
                display: "flex", 
                gap: 1.5, 
                alignItems: "flex-start",
              }}
            >
              <CheckIcon 
                sx={{ 
                  color: "#1f1f1f", 
                  fontSize: 20, 
                  flexShrink: 0, 
                  mt: 0.3,
                }} 
              />
              <Typography 
                variant="body1" 
                sx={{ 
                  color: "#1f1f1f", 
                  lineHeight: 1.6, 
                  fontSize: "0.95rem",
                  fontWeight: 400,
                }}
              >
                {outcome}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Robot Requirements - SPOTLIGHT SECTION */}
      <CourseRobotRequirementsSection robots={course.courseRobots} />

      {/* Skills you'll gain */}
      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            mb: 2.5, 
            color: "#1f1f1f",
            fontSize: "1.25rem",
          }}
        >
          {translate("courses.SkillsYouWillGain")}
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          {skills.map((skill, index) => (
            <Chip
              key={index}
              label={skill}
              sx={{
                bgcolor: "#f0f0f0",
                color: "#1f1f1f",
                fontWeight: 500,
                height: "auto",
                py: 1,
                px: 2,
                fontSize: "0.875rem",
                border: "1px solid #d9d9d9",
                borderRadius: 1,
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "#e8e8e8",
                  borderColor: "#c0c0c0",
                  transform: "translateY(-1px)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Details to know */}
      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            mb: 3, 
            color: "#1f1f1f",
            fontSize: "1.25rem",
          }}
        >
          Details to know
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 5,
          }}
        >
          {detailsToKnow.map((detail, index) => (
            <Box key={index} sx={{ textAlign: "left" }}>
              <Box sx={{ mb: 1.5 }}>{detail.icon}</Box>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 0.5, 
                  color: "#1f1f1f",
                  fontSize: "1rem",
                }}
              >
                {detail.title}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: "#5f6368", 
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                }}
              >
                {detail.subtitle}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Divider */}
      <Divider sx={{ my: 5, borderColor: "#e0e0e0" }} />

      {/* Course Description */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            mb: 2.5, 
            color: "#1f1f1f",
            fontSize: "1.25rem",
          }}
        >
          {translate("courses.AboutThisCourse")}
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            lineHeight: 1.7, 
            color: "#3c4043", 
            fontSize: "0.95rem",
            fontWeight: 400,
          }}
        >
          {course.description}
        </Typography>
      </Box>
    </Box>
  );
}
