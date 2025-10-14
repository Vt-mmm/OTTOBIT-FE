import { Box, Typography, Chip } from "@mui/material";
import { useLocales } from "../../../../hooks";

interface CourseSkillsSectionProps {
  skills: string[];
}

export default function CourseSkillsSection({ skills }: CourseSkillsSectionProps) {
  const { translate } = useLocales();

  // Default skills if none provided - Using translation keys
  const defaultSkills = [
    translate("courses.SkillBlockly"),
    translate("courses.SkillRobotControl"),
    translate("courses.SkillLogicalThinking"),
    translate("courses.SkillProblemSolving"),
    translate("courses.SkillSTEM"),
  ];

  const displaySkills = skills.length > 0 ? skills : defaultSkills;

  return (
    <Box>
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
        {displaySkills.map((skill, index) => (
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
  );
}
