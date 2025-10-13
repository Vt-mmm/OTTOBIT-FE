import { useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { useLocales } from "../../../../hooks";
import { LessonResult } from "common/@types/lesson";
import { LessonProgressResult, LessonStatus } from "common/@types/lessonProgress";

interface CourseModulesSectionProps {
  lessons: LessonResult[];
  lessonProgresses?: LessonProgressResult[];
  isUserEnrolled: boolean;
}

export default function CourseModulesSection({
  lessons,
  lessonProgresses,
  isUserEnrolled,
}: CourseModulesSectionProps) {
  const { translate } = useLocales();
  const [expanded, setExpanded] = useState<string | false>("module-0");

  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Get progress for a specific lesson
  const getLessonProgress = (lessonId: string) => {
    return lessonProgresses?.find((p) => p.lessonId === lessonId);
  };

  // Calculate module stats from BE data
  const getModuleStats = (lesson: LessonResult) => {
    const challengesCount = lesson.challengesCount || 0;
    const durationMinutes = lesson.durationInMinutes || 0;
    
    return {
      challengesCount,
      durationMinutes,
    };
  };

  return (
    <Box>
      {/* Course Info Summary */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          mb: 5,
          p: 4,
          bgcolor: "#fafafa",
          borderRadius: 3,
          border: "1px solid #eeeeee",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <Box>
          <Typography variant="body2" sx={{ color: "#757575", fontSize: "0.9375rem" }}>
            {translate("courses.TotalModules")}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#2c2c2c", mt: 0.5 }}>
            {lessons.length}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" sx={{ color: "#757575", fontSize: "0.9375rem" }}>
            {translate("courses.EstimatedTime")}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#2c2c2c", mt: 0.5 }}>
            {Math.ceil(lessons.reduce((sum, lesson) => sum + lesson.durationInMinutes, 0) / 60)}{" "}
            {translate("courses.Hours")}
          </Typography>
        </Box>
      </Box>

      {/* Modules List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {lessons.map((lesson, index) => {
          const progress = getLessonProgress(lesson.id);
          const isCompleted = progress?.status === LessonStatus.Completed;
          const stats = getModuleStats(lesson);
          const panelId = `module-${index}`;

          return (
            <Accordion
              key={lesson.id}
              expanded={expanded === panelId}
              onChange={handleChange(panelId)}
              sx={{
                border: "1px solid #eeeeee",
                borderRadius: "16px !important",
                "&:before": { display: "none" },
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                mb: 0,
                "&:hover": {
                  boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                },
                "&.Mui-expanded": {
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  "& .MuiAccordionSummary-content": {
                    my: 3,
                  },
                  px: 3.5,
                  py: 1,
                }}
              >
                <Box sx={{ width: "100%" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "#2c2c2c", fontWeight: 600, fontSize: "0.875rem" }}
                      >
                        {translate("courses.Module")} {index + 1}
                      </Typography>
                      {isCompleted && (
                        <Chip
                          icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                          label={translate("courses.Completed")}
                          size="small"
                          sx={{
                            bgcolor: "#f5f5f5",
                            color: "#000",
                            fontWeight: 600,
                            height: 24,
                          }}
                        />
                      )}
                      {!isUserEnrolled && (
                        <Chip
                          icon={<LockIcon sx={{ fontSize: 16 }} />}
                          label={translate("courses.EnrollToUnlock")}
                          size="small"
                          sx={{
                            bgcolor: "#f5f5f5",
                            color: "#666",
                            fontWeight: 600,
                            height: 24,
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, fontSize: "1.125rem", color: "#2c2c2c" }}>
                    {lesson.title}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    {stats.challengesCount > 0 && (
                      <Typography variant="body2" sx={{ color: "#616161", fontSize: "0.9375rem" }}>
                        {translate("courses.ChallengesCount", { count: stats.challengesCount })}
                      </Typography>
                    )}
                    {stats.durationMinutes > 0 && (
                      <Typography variant="body2" sx={{ color: "#616161", fontSize: "0.9375rem" }}>
                        {stats.challengesCount > 0 && "• "}{stats.durationMinutes} {translate("courses.Minutes")}
                      </Typography>
                    )}
                  </Box>

                  {/* Progress Bar for enrolled users */}
                  {isUserEnrolled && progress && (
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={
                          progress.status === LessonStatus.Completed
                            ? 100
                            : progress.status === LessonStatus.InProgress
                            ? 50
                            : 0
                        }
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: "#e0e0e0",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: "#00AB55",
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        {
                          progress.status === LessonStatus.Completed
                            ? 100
                            : progress.status === LessonStatus.InProgress
                            ? 50
                            : 0
                        }
                        % {translate("courses.Complete")}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ pt: 0, pb: 4, px: 3.5 }}>
                <Box>
                  {lesson.content && (
                    <Typography variant="body2" sx={{ mb: 3, color: "#616161", fontSize: "0.9375rem", lineHeight: 1.7 }}>
                      {lesson.content}
                    </Typography>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </Box>
  );
}
