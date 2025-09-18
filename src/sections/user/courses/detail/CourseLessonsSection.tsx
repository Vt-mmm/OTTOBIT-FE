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
import { Lesson } from "common/@types/lesson";

interface CourseLessonsSectionProps {
  lessons: Lesson[];
  isUserEnrolled: boolean;
  onLessonClick: (lessonId: string, lessonIndex: number) => void;
}

export default function CourseLessonsSection({
  lessons,
  isUserEnrolled,
  onLessonClick,
}: CourseLessonsSectionProps) {
  return (
    <Box sx={{ bgcolor: "white", border: "1px solid #e0e0e0", borderRadius: 1, mb: 4 }}>
      <Box sx={{ p: 3, pb: 0 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
          Nội dung khóa học
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {lessons.length} bài học • Khoảng 4-6 giờ
        </Typography>
      </Box>

      {lessons.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <SchoolIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Chưa có bài học nào
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Khóa học này chưa có bài học nào được tạo.
          </Typography>
        </Box>
      ) : (
        <List sx={{ pt: 0 }}>
          {lessons.map((lesson, index) => {
            const isLocked = !isUserEnrolled && index > 0; // First lesson free, others need enrollment
            
            return (
              <React.Fragment key={lesson.id}>
                <ListItem disablePadding>
                  <ListItemButton 
                    onClick={() => !isLocked && onLessonClick(lesson.id, index)}
                    disabled={isLocked}
                    sx={{ 
                      py: 2.5,
                      opacity: isLocked ? 0.6 : 1,
                      "&:hover": {
                        bgcolor: isLocked ? "transparent" : "action.hover",
                      }
                    }}
                  >
                    <ListItemIcon>
                      <Avatar 
                        sx={{ 
                          width: 48, 
                          height: 48, 
                          bgcolor: isLocked ? "grey.400" : index === 0 ? "#4caf50" : "primary.main",
                          fontSize: "1rem",
                          fontWeight: 600
                        }}
                      >
                        {isLocked ? <LockIcon /> : lesson.order + 1}
                      </Avatar>
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {lesson.title}
                          </Typography>
                          {index === 0 && (
                            <Chip 
                              label="Miễn phí" 
                              size="small" 
                              sx={{ 
                                bgcolor: "#e8f5e9",
                                color: "#2e7d32",
                                fontWeight: 600
                              }} 
                            />
                          )}
                          {isLocked && (
                            <Chip 
                              label="Cần tham gia" 
                              size="small" 
                              sx={{ 
                                bgcolor: "#fff3e0",
                                color: "#f57c00",
                                fontWeight: 600
                              }} 
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {lesson.content}
                          </Typography>
                          
                          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            <Chip
                              label={`${lesson.challengesCount || 0} thử thách`}
                              size="small"
                              variant="outlined"
                              sx={{ borderColor: "primary.main", color: "primary.main" }}
                            />
                            <Chip
                              label={`${lesson.durationInMinutes} phút`}
                              size="small"
                              variant="outlined"
                              icon={<AccessTimeIcon />}
                            />
                          </Box>
                        </Box>
                      }
                    />
                    
                    {!isLocked && (
                      <Button
                        variant={index === 0 ? "contained" : "outlined"}
                        startIcon={<PlayArrowIcon />}
                        size="medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLessonClick(lesson.id, index);
                        }}
                        sx={{
                          minWidth: 100,
                          ...(index === 0 && {
                            bgcolor: "#4caf50",
                            "&:hover": { bgcolor: "#43a047" }
                          })
                        }}
                      >
                        {index === 0 ? "Thử ngay" : "Bắt đầu"}
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