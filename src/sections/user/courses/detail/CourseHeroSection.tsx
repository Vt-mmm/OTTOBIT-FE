import {
  Box,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Avatar,
  Container,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  NavigateNext as NavigateNextIcon,
  Person as PersonIcon,
  MenuBook as ModulesIcon,
  Schedule as ScheduleIcon,
  School as LevelIcon,
} from "@mui/icons-material";
import CourseStatsCard from "./CourseStatsCard";
import { Link } from "react-router-dom";
import { CourseType } from "common/@types/course";
import { useLocales } from "../../../../hooks";
import { PATH_USER } from "../../../../routes/paths";

interface CourseHeroSectionProps {
  course: {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    createdByName?: string;
    enrollmentsCount?: number;
    price?: number;
    type?: CourseType;
  };
  lessons: any[];
  isUserEnrolled?: boolean;
  isEnrolling?: boolean;
  onEnrollCourse?: () => void;
  onGoToCourse?: () => void;
}

export default function CourseHeroSection({
  course,
  lessons,
  isUserEnrolled = false,
  isEnrolling = false,
  onEnrollCourse,
  onGoToCourse,
}: CourseHeroSectionProps) {
  const { translate } = useLocales();

  return (
    <Box>
      {/* Hero Background */}
      <Box
        sx={{
          bgcolor: "#fafafa",
          color: "#2c2c2c",
          py: { xs: 5, md: 8 },
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 3, md: 6 } }}>
          {/* Two Column Layout: Content Left, Image Right */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 4, md: 6 },
              alignItems: { xs: "flex-start", md: "flex-start" },
            }}
          >
            {/* Left Column - Course Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Breadcrumbs */}
              <Breadcrumbs
                separator={
                  <NavigateNextIcon fontSize="small" sx={{ color: "#757575" }} />
                }
                sx={{ mb: 4 }}
                aria-label="breadcrumb"
              >
                <MuiLink
                  component={Link}
                  to={PATH_USER.homepage}
                  sx={{
                    color: "#616161",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    "&:hover": { color: "#2c2c2c", textDecoration: "underline" },
                  }}
                >
                  {translate("courses.Home")}
                </MuiLink>
                <MuiLink
                  component={Link}
                  to={PATH_USER.courses}
                  sx={{
                    color: "#616161",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    "&:hover": { color: "#2c2c2c", textDecoration: "underline" },
                  }}
                >
                  {translate("courses.Courses")}
                </MuiLink>
                <Typography sx={{ color: "#9e9e9e", fontSize: "0.875rem" }}>
                  {translate("courses.Category")}
                </Typography>
              </Breadcrumbs>

              {/* Provider */}
              {course.createdByName && (
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "#757575", mb: 1, fontSize: "0.875rem" }}
                  >
                    {translate("courses.OfferedBy")}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#2c2c2c" }}
                  >
                    {course.createdByName}
                  </Typography>
                </Box>
              )}

              {/* Course Title */}
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: "1.75rem", sm: "2.5rem", md: "3rem" },
                  color: "#2c2c2c",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                }}
              >
                {course.title}
              </Typography>

              {/* Course Description */}
              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  lineHeight: 1.7,
                  fontSize: { xs: "1rem", md: "1.125rem" },
                  color: "#616161",
                  fontWeight: 400,
                }}
              >
                {course.description}
              </Typography>

              {/* Instructor with Avatar */}
              {course.createdByName && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: "#00AB55",
                      color: "#fff",
                      fontSize: "1.25rem",
                    }}
                  >
                    {course.createdByName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: "#757575", display: "block" }}
                    >
                      {translate("courses.Instructor")}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "#2c2c2c" }}
                    >
                      {course.createdByName}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Enrollment Count */}
              {course.enrollmentsCount !== undefined && (
                <Typography variant="body2" sx={{ mb: 3, color: "#616161" }}>
                  <strong style={{ color: "#2c2c2c", fontWeight: 600 }}>
                    {course.enrollmentsCount.toLocaleString()}
                  </strong>{" "}
                  {translate("courses.AlreadyEnrolled")}
                </Typography>
              )}

              {/* Enroll / Go to Course Button */}
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {isUserEnrolled ? (
              <Button
                variant="outlined"
                size="large"
                onClick={onGoToCourse}
                sx={{
                  bgcolor: "#ffffff",
                  color: "#2c2c2c",
                  borderColor: "#2c2c2c",
                  borderWidth: 2,
                  py: 1.5,
                  px: 4,
                  fontSize: "1rem",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 1,
                  "&:hover": {
                    bgcolor: "#f5f5f5",
                    borderColor: "#1a1a1a",
                    borderWidth: 2,
                  },
                }}
              >
                {translate("courses.ContinueLearning")}
              </Button>
            ) : (
              <Button
                variant="contained"
                size="large"
                onClick={onEnrollCourse}
                disabled={isEnrolling}
                startIcon={isEnrolling ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{
                  bgcolor: "#2e7d32",
                  color: "#ffffff",
                  py: 1.5,
                  px: 4,
                  fontSize: "1rem",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 1,
                  "&:hover": {
                    bgcolor: "#1b5e20",
                  },
                  "&:disabled": {
                    bgcolor: "#9e9e9e",
                    color: "#ffffff",
                  },
                }}
              >
                {isEnrolling
                  ? translate("courses.Processing")
                  : course.type === CourseType.Premium && course.price
                  ? `${translate("courses.JoinCourse")} - ${course.price.toLocaleString()} VND`
                  : translate("courses.JoinFreeCourse")}
              </Button>
            )}
              </Box>
            </Box>

            {/* Right Column - Course Image */}
            {course.imageUrl && (
              <Box
                sx={{
                  width: { xs: "100%", md: "45%" },
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                    height: { xs: 250, sm: 300, md: 400 },
                    position: "sticky",
                    top: 80,
                  }}
                >
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      {/* Stats Cards Section - Coursera Style */}
      <Box
        sx={{
          bgcolor: "#ffffff",
          borderBottom: "1px solid #e0e0e0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 3, md: 6 } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "stretch" },
              justifyContent: "space-between",
              py: { xs: 3, sm: 4 },
              gap: { xs: 2, sm: 0 },
              overflow: "auto",
            }}
          >
            {/* Modules Count - From BE */}
            <CourseStatsCard
              icon={<ModulesIcon />}
              title={translate("courses.Modules")}
              value={lessons.length}
              subtitle={translate("courses.GainInsight")}
              variant="primary"
            />

            {/* Level - Generic for now until BE provides */}
            <CourseStatsCard
              icon={<LevelIcon />}
              title={translate("courses.Level")}
              value={translate("courses.BeginnerLevel")}
              subtitle={translate("courses.NoExperienceRequired")}
            />

            {/* Schedule - Always flexible */}
            <CourseStatsCard
              icon={<ScheduleIcon />}
              title={translate("courses.Schedule")}
              value={translate("courses.Flexible")}
              subtitle={translate("courses.LearnAtOwnPace")}
            />

            {/* Enrollment Count - From BE */}
            {course.enrollmentsCount !== undefined &&
              course.enrollmentsCount > 0 && (
                <CourseStatsCard
                  icon={<PersonIcon />}
                  title={translate("courses.Students")}
                  value={course.enrollmentsCount}
                  subtitle={translate("courses.StudentsEnrolled")}
                  variant="success"
                  showDivider={false}
                />
              )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
