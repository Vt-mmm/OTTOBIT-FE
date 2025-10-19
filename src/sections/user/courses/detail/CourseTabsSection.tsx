import { useState } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import { useLocales } from "../../../../hooks";
import CourseSkillsSection from "./CourseSkillsSection";
import CourseModulesSection from "./CourseModulesSection";
import CourseAboutSection from "./CourseAboutSection";
import CourseCertificatePreviewSection from "./CourseCertificatePreviewSection";
import CourseRatingSection from "./CourseRatingSection";
import { CourseResult } from "common/@types/course";
import { LessonResult, LessonPreview } from "common/@types/lesson";
import { LessonProgressResult } from "common/@types/lessonProgress";

interface CourseTabsSectionProps {
  course: CourseResult;
  lessons: (LessonResult | LessonPreview)[];
  lessonProgresses?: LessonProgressResult[];
  isUserEnrolled: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`course-tabpanel-${index}`}
      aria-labelledby={`course-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 4, px: { xs: 2, md: 4 } }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `course-tab-${index}`,
    "aria-controls": `course-tabpanel-${index}`,
  };
}

export default function CourseTabsSection({
  course,
  lessons,
  lessonProgresses,
  isUserEnrolled,
}: CourseTabsSectionProps) {
  const { translate } = useLocales();
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%", bgcolor: "white", borderRadius: 3, overflow: "hidden" }}>
      {/* Tabs Navigation - Sticky */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          bgcolor: "white",
          borderBottom: 1,
          borderColor: "divider",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="course tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1rem",
              minWidth: 120,
              py: 2.5,
              px: 3,
            },
            "& .Mui-selected": {
              color: "#00AB55",
            },
            "& .MuiTabs-indicator": {
              height: 2,
              backgroundColor: "#00AB55",
            },
          }}
        >
          <Tab label={translate("courses.About")} {...a11yProps(0)} />
          <Tab label={translate("courses.Outcomes")} {...a11yProps(1)} />
          <Tab label={translate("courses.Modules")} {...a11yProps(2)} />
          <Tab label={translate("courses.Certificate")} {...a11yProps(3)} />
          <Tab label={translate("courses.Reviews")} {...a11yProps(4)} />
        </Tabs>
      </Box>

      {/* About Tab */}
      <TabPanel value={value} index={0}>
        <CourseAboutSection course={course} lessons={lessons} />
      </TabPanel>

      {/* Outcomes Tab */}
      <TabPanel value={value} index={1}>
        <Box>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600, 
              mb: 4, 
              color: "#1f1f1f",
              fontSize: { xs: "1.5rem", md: "1.75rem" },
            }}
          >
            {translate("courses.LearningObjectives")}
          </Typography>
          
          {/* Learning Outcomes Description */}
          <Box sx={{ mb: 5 }}>
            <Typography 
              variant="body1" 
              sx={{ 
                lineHeight: 1.7, 
                color: "#3c4043", 
                fontSize: "0.95rem",
                mb: 4,
              }}
            >
              {translate("courses.LearningOutcomesNote")}
            </Typography>
          </Box>

          {/* Skills Section */}
          <CourseSkillsSection skills={[]} />
        </Box>
      </TabPanel>

      {/* Modules Tab */}
      <TabPanel value={value} index={2}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600, 
            mb: 4, 
            color: "#1f1f1f",
            fontSize: { xs: "1.5rem", md: "1.75rem" },
          }}
        >
          {translate("courses.CourseModules")}
        </Typography>
        <CourseModulesSection
          lessons={lessons}
          lessonProgresses={lessonProgresses || []}
          isUserEnrolled={isUserEnrolled}
        />
      </TabPanel>

      {/* Certificate Tab */}
      <TabPanel value={value} index={3}>
        <CourseCertificatePreviewSection
          course={course}
          isUserEnrolled={isUserEnrolled}
        />
      </TabPanel>

      {/* Reviews Tab */}
      <TabPanel value={value} index={4}>
        <CourseRatingSection
          courseId={course.id}
          isUserEnrolled={isUserEnrolled}
          ratingAverage={course.ratingAverage}
          ratingCount={course.ratingCount}
        />
      </TabPanel>
    </Box>
  );
}
