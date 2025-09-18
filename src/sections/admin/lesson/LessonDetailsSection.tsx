import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SchoolIcon from "@mui/icons-material/School";
import { LessonResult } from "../../../common/@types/lesson";

interface Props {
  lesson: LessonResult | null;
  onBack: () => void;
  onEdit: (lesson: LessonResult) => void;
}

export default function LessonDetailsSection({ lesson, onBack, onEdit }: Props) {
  if (!lesson) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography>Không tìm thấy thông tin bài học</Typography>
        <Button onClick={onBack} sx={{ mt: 2 }}>
          Quay lại
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
          Quay lại
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Chi tiết bài học
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        {/* Lesson Content */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <Chip
                      label={`Bài ${lesson.order}`}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={lesson.courseTitle || "Không xác định"}
                      variant="outlined"
                    />
                  </Stack>
                  
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                    {lesson.title}
                  </Typography>
                  
                  <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AccessTimeIcon color="primary" fontSize="small" />
                      <Typography variant="body2">
                        {lesson.durationInMinutes} phút
                      </Typography>
                    </Stack>
                    
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <SchoolIcon color="primary" fontSize="small" />
                      <Typography variant="body2">
                        {lesson.challengesCount || 0} thử thách
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
                
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => onEdit(lesson)}
                  sx={{ ml: 2 }}
                >
                  Chỉnh sửa
                </Button>
              </Stack>

              <Divider sx={{ mb: 3 }} />

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Nội dung bài học
              </Typography>
              
              <Box sx={{ 
                p: 3, 
                backgroundColor: "#f8f9fa", 
                borderRadius: 2,
                border: "1px solid #e0e0e0"
              }}>
                <Typography variant="body1" sx={{ 
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap"
                }}>
                  {lesson.content}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Challenges Section */}
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Thử thách
                </Typography>
                <Chip
                  label={`${lesson.challengesCount || 0} thử thách`}
                  color="primary"
                  variant="outlined"
                />
              </Stack>

              {lesson.challenges && lesson.challenges.length > 0 ? (
                <Grid container spacing={2}>
                  {lesson.challenges.map((challenge, index) => (
                    <Grid item xs={12} md={6} key={challenge.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                            <Chip
                              label={`#${index + 1}`}
                              size="small"
                              color="primary"
                            />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {challenge.title}
                            </Typography>
                          </Stack>
                          
                          <Typography variant="body2" color="text.secondary">
                            {challenge.description && challenge.description.length > 100 
                              ? `${challenge.description.substring(0, 100)}...`
                              : challenge.description || "Không có mô tả"
                            }
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <SchoolIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Chưa có thử thách nào
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    Thêm thử thách để học viên có thể thực hành
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Lesson Info Sidebar */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Thông tin bài học
              </Typography>

              <Stack spacing={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Khóa học
                  </Typography>
                  <Typography variant="subtitle2">
                    {lesson.courseTitle || "Không xác định"}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Thời lượng
                  </Typography>
                  <Typography variant="subtitle2">
                    {lesson.durationInMinutes} phút
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Thứ tự
                  </Typography>
                  <Typography variant="subtitle2">
                    Bài {lesson.order}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Số thử thách
                  </Typography>
                  <Typography variant="subtitle2">
                    {lesson.challengesCount || 0} thử thách
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Ngày tạo
                  </Typography>
                  <Typography variant="subtitle2">
                    {new Date(lesson.createdAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Cập nhật lần cuối
                  </Typography>
                  <Typography variant="subtitle2">
                    {new Date(lesson.updatedAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Trạng thái
                  </Typography>
                  <Chip
                    label="Đang hoạt động"
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}