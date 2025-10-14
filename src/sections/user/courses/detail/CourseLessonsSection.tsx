import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import {
  PlayArrow as PlayArrowIcon,
  School as SchoolIcon,
  AccessTime as AccessTimeIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { Lesson, LessonProgressResult } from "common/@types/lesson";
import {
  isLessonAccessible,
  getLessonProgress,
  getLessonStatusKey,
  getLessonButtonKey,
} from "../../../../utils/lessonUtils";
import { useLocales } from "../../../../hooks";

interface CourseLessonsSectionProps {
  lessons: Lesson[];
  lessonProgresses?: LessonProgressResult[];
  isUserEnrolled: boolean;
  onLessonClick: (lessonId: string) => void;
}

export default function CourseLessonsSection({
  lessons,
  lessonProgresses = [],
  isUserEnrolled,
  onLessonClick,
}: CourseLessonsSectionProps) {
  const { translate } = useLocales();
  return (
    <Box
      sx={{
        bgcolor: "white",
        border: "1px solid #e0e0e0",
        borderRadius: { xs: 0, sm: 1 },
        mb: 4,
        maxWidth: "100%",
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, pb: 0 }}>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ fontWeight: 600, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
        >
          {translate("courses.CourseContent")}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {translate("courses.LessonsCount", { count: lessons.length })}
        </Typography>
      </Box>

      {lessons.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <SchoolIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {translate("courses.NoLessonsYet")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {translate("courses.NoLessonsInCourse")}
          </Typography>
        </Box>
      ) : (
        <List sx={{ pt: 0 }}>
          {lessons.map((lesson, index) => {
            const isAccessible = isUserEnrolled
              ? isLessonAccessible(lesson, lessonProgresses)
              : index === 0;
            const progress = getLessonProgress(lesson.id, lessonProgresses);
            const statusKey = getLessonStatusKey(lesson, lessonProgresses);
            const buttonKey = getLessonButtonKey(lesson, lessonProgresses);
            const challengeCount =
              (progress as any).totalChallenges ??
              (lesson as any).challengesCount ??
              0;

            return (
              <React.Fragment key={lesson.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => isUserEnrolled && isAccessible && onLessonClick(lesson.id)}
                    disabled={!isUserEnrolled || !isAccessible}
                    sx={{
                      py: { xs: 2, sm: 2.5 },
                      px: { xs: 2, sm: 2.5, md: 3 },
                      opacity: !isAccessible ? 0.6 : 1,
                      cursor: !isUserEnrolled ? "default" : "pointer",
                      "&:hover": {
                        bgcolor: !isUserEnrolled || !isAccessible ? "transparent" : "action.hover",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: { xs: 56, sm: 64 } }}>
                      <Avatar
                        sx={{
                          width: { xs: 40, sm: 48 },
                          height: { xs: 40, sm: 48 },
                          bgcolor: !isAccessible
                            ? "grey.400"
                            : progress.isCompleted
                            ? "#4caf50"
                            : progress.isInProgress
                            ? "#ff9800"
                            : index === 0
                            ? "#4caf50"
                            : "primary.main",
                          fontSize: "1rem",
                          fontWeight: 600,
                        }}
                      >
                        {!isAccessible ? (
                          <LockIcon />
                        ) : progress.isCompleted ? (
                          "✓"
                        ) : (
                          lesson.order
                        )}
                      </Avatar>
                    </ListItemIcon>

                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            fontWeight={600}
                            component="span"
                          >
                            {lesson.title}
                          </Typography>
                          {/* Status Chip */}
                          <Chip
                            label={
                              isUserEnrolled
                                ? translate(statusKey)
                                : index === 0
                                ? translate("courses.Free")
                                : translate("courses.RequiresEnrollment")
                            }
                            size="small"
                            sx={{
                              bgcolor: !isAccessible
                                ? "#fafafa"
                                : progress.isCompleted
                                ? "#e8f5e9"
                                : progress.isInProgress
                                ? "#fff3e0"
                                : index === 0
                                ? "#e8f5e9"
                                : "#e3f2fd",
                              color: !isAccessible
                                ? "#757575"
                                : progress.isCompleted
                                ? "#2e7d32"
                                : progress.isInProgress
                                ? "#f57c00"
                                : index === 0
                                ? "#2e7d32"
                                : "#1976d2",
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                            component="span"
                          >
                            {lesson.content}
                          </Typography>

                          <Box
                            sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
                          >
                            <Chip
                              label={`${challengeCount} ${translate("courses.Challenges")}`}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: "primary.main",
                                color: "primary.main",
                              }}
                            />
                            <Chip
                              label={`${lesson.durationInMinutes} ${translate("courses.Minutes")}`}
                              size="small"
                              variant="outlined"
                              icon={<AccessTimeIcon />}
                            />
                          </Box>
                        </Box>
                      }
                      primaryTypographyProps={{
                        component: "div",
                      }}
                      secondaryTypographyProps={{
                        component: "div",
                      }}
                    />

                    {/* Only show buttons when user is enrolled (learning mode) */}
                    {isUserEnrolled && (
                      <Button
                        variant={isAccessible ? "contained" : "outlined"}
                        startIcon={
                          !isAccessible ? <LockIcon /> : <PlayArrowIcon />
                        }
                        size="medium"
                        disabled={!isAccessible}
                        onClick={(e) => {
                          e.stopPropagation();
                          isAccessible && onLessonClick(lesson.id);
                        }}
                        sx={{
                          minWidth: 120,
                          ...(isAccessible && {
                            bgcolor: progress.isCompleted
                              ? "#ff9800"
                              : progress.isInProgress
                              ? "#2196f3"
                              : "#4caf50",
                            "&:hover": {
                              bgcolor: progress.isCompleted
                                ? "#f57c00"
                                : progress.isInProgress
                                ? "#1976d2"
                                : "#43a047",
                            },
                          }),
                        }}
                      >
                        {translate(buttonKey)}
                      </Button>
                    )}
                  </ListItemButton>
                </ListItem>
                {index < lessons.length - 1 && <Divider />}
              </React.Fragment>
            );
          })}
        </List>
      )}
    </Box>
  );
}
