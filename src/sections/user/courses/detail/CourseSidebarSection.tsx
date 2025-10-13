import { Box, Typography, Button, Paper, Divider, Chip, CircularProgress } from "@mui/material";
import {
  School as SchoolIcon,
  AccessTime as AccessTimeIcon,
  WorkspacePremium as CertificateIcon,
  Language as LanguageIcon,
  CheckCircle as CheckCircleIcon,
  Share as ShareIcon,
} from "@mui/icons-material";
import { CourseType } from "common/@types/course";
import { useLocales } from "../../../../hooks";
import AddToCartButton from "../../../../components/cart/AddToCartButton";

interface CourseSidebarSectionProps {
  course: {
    id: string;
    title: string;
    price?: number;
    type?: CourseType;
    imageUrl?: string;
  };
  lessons: any[];
  isUserEnrolled: boolean;
  isEnrolling: boolean;
  onEnrollCourse: () => void;
  onGoToCourse?: () => void;
  compact?: boolean;
}

export default function CourseSidebarSection({
  course,
  lessons,
  isUserEnrolled,
  isEnrolling,
  onEnrollCourse,
  onGoToCourse,
  compact = false,
}: CourseSidebarSectionProps) {
  const { translate } = useLocales();
  
  const isFree = course.type === CourseType.Free || (course.price ?? 0) === 0;
  const isPremium = !isFree;

  const sidebarItems = [
    {
      icon: <SchoolIcon fontSize="small" />,
      label: translate("courses.Lessons"),
      value: `${lessons.length} ${translate("courses.LessonsText")}`,
    },
    {
      icon: <AccessTimeIcon fontSize="small" />,
      label: translate("courses.Duration"),
      value: `${lessons.length * 2} ${translate("courses.Hours")}`,
    },
    {
      icon: <LanguageIcon fontSize="small" />,
      label: translate("courses.Language"),
      value: translate("courses.Vietnamese"),
    },
    {
      icon: <CertificateIcon fontSize="small" />,
      label: translate("courses.Certificate"),
      value: translate("courses.ShareableCertificate"),
    },
  ];

  // Compact mode: only show button, no paper wrapper
  if (compact) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {!isUserEnrolled ? (
          isPremium ? (
            <AddToCartButton
              courseId={course.id}
              coursePrice={course.price ?? 0}
              fullWidth
            />
          ) : (
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={onEnrollCourse}
              disabled={isEnrolling}
              sx={{
                bgcolor: "#2e7d32",
                color: "white",
                fontWeight: 600,
                py: 1.5,
                fontSize: "0.9375rem",
                textTransform: "none",
                borderRadius: 1,
                "&:hover": {
                  bgcolor: "#1b5e20",
                },
              }}
            >
              {isEnrolling ? (
                <>
                  <CircularProgress size={18} sx={{ mr: 1, color: "white" }} />
                  {translate("courses.Processing")}
                </>
              ) : (
                translate("courses.JoinFree")
              )}
            </Button>
          )
        ) : onGoToCourse ? (
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={onGoToCourse}
            sx={{
              bgcolor: "#000000",
              color: "white",
              fontWeight: 600,
              py: 1.5,
              fontSize: "0.9375rem",
              textTransform: "none",
              borderRadius: 1,
              "&:hover": {
                bgcolor: "#212121",
              },
            }}
          >
            {translate("courses.GoToCourse")}
          </Button>
        ) : null}
      </Box>
    );
  }

  return (
    <Box sx={{ position: "sticky", top: 100 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid #e0e0e0",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* Course Image */}
        {course.imageUrl && (
          <Box
            component="img"
            src={course.imageUrl}
            alt={course.title}
            sx={{
              width: "100%",
              height: 200,
              objectFit: "cover",
            }}
          />
        )}

        <Box sx={{ p: 4 }}>
          {/* Price / Free Badge */}
          <Box sx={{ mb: 4 }}>
            {course.type === CourseType.Free || (course.price ?? 0) === 0 ? (
              <Chip
                label={translate("courses.Free")}
                sx={{
                  bgcolor: "#4caf50",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  height: 36,
                  px: 2,
                }}
              />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#1976d2" }}>
                {(course.price ?? 0).toLocaleString()} VND
              </Typography>
            )}
          </Box>

          {/* CTA Button */}
          {!isUserEnrolled ? (
            isPremium ? (
              <Box sx={{ mb: 3 }}>
                <AddToCartButton
                  courseId={course.id}
                  coursePrice={course.price ?? 0}
                  fullWidth
                />
              </Box>
            ) : (
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={onEnrollCourse}
                disabled={isEnrolling}
                sx={{
                  bgcolor: "#2e7d32",
                  color: "white",
                  fontWeight: 600,
                  py: 2,
                  fontSize: "1rem",
                  textTransform: "none",
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                  "&:hover": {
                    bgcolor: "#1b5e20",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  },
                }}
              >
                {isEnrolling ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                    {translate("courses.Processing")}
                  </>
                ) : (
                  translate("courses.JoinFree")
                )}
              </Button>
            )
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                  p: 2,
                  bgcolor: "#e8f5e9",
                  borderRadius: 1,
                }}
              >
                <CheckCircleIcon sx={{ color: "#4caf50" }} />
                <Typography variant="body2" sx={{ color: "#2e7d32", fontWeight: 600 }}>
                  {translate("courses.YouAreEnrolled")}
                </Typography>
              </Box>
              {onGoToCourse && (
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={onGoToCourse}
                  sx={{
                    bgcolor: "#212121",
                    color: "white",
                    fontWeight: 600,
                    py: 2,
                    fontSize: "1rem",
                    textTransform: "none",
                    mb: 3,
                    borderRadius: 2,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                    "&:hover": {
                      bgcolor: "#424242",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  {translate("courses.GoToCourse")}
                </Button>
              )}
            </>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Course Info List */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {sidebarItems.map((item, index) => (
              <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ color: "#616161" }}>{item.icon}</Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.value}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Share Button */}
          <Button
            variant="outlined"
            fullWidth
            startIcon={<ShareIcon />}
            sx={{
              textTransform: "none",
              borderColor: "#e0e0e0",
              color: "#424242",
              borderRadius: 2,
              py: 1.5,
              "&:hover": {
                borderColor: "#bdbdbd",
                bgcolor: "#fafafa",
              },
            }}
          >
            {translate("courses.ShareCourse")}
          </Button>
        </Box>
      </Paper>

      {/* Additional Info Card */}
      <Paper
        elevation={1}
        sx={{
          mt: 2,
          p: 2,
          borderRadius: 2,
          bgcolor: "#f8f9fa",
          border: "1px solid #e0e0e0",
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          {translate("courses.WhatYouGet")}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircleIcon sx={{ fontSize: 18, color: "#4caf50" }} />
            <Typography variant="body2">{translate("courses.LifetimeAccess")}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircleIcon sx={{ fontSize: 18, color: "#4caf50" }} />
            <Typography variant="body2">{translate("courses.ShareableCertificate")}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircleIcon sx={{ fontSize: 18, color: "#4caf50" }} />
            <Typography variant="body2">{translate("courses.PracticeProjects")}</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
