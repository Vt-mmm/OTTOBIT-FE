import { useState } from "react";
import { Box, Tabs, Tab, Card } from "@mui/material";
import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUpOutlined";
import EmojiEventsIcon from "@mui/icons-material/EmojiEventsOutlined";
import SmartToyIcon from "@mui/icons-material/SmartToyOutlined";
import CardMembershipIcon from "@mui/icons-material/CardMembershipOutlined";
import NoteAltIcon from "@mui/icons-material/NoteAltOutlined";
import OverviewTab from "../tabs/OverviewTab";
import EnrolledCoursesTab from "../tabs/EnrolledCoursesTab";
import LearningProgressTab from "../tabs/LearningProgressTab";
import AchievementsTab from "../tabs/AchievementsTab";
import MyRobotsTab from "../tabs/MyRobotsTab";
import MyCertificatesTab from "../tabs/MyCertificatesTab";
import MyNotesTab from "../tabs/MyNotesTab";
import { useLocales } from "../../../../hooks";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface ProfileContentTabsProps {
  stats: {
    totalEnrollments: number;
    totalSubmissions: number;
    completedCourses: number;
    totalPoints: number;
  };
  learningProgress: Array<{
    subject: string;
    progress: number;
    color: string;
  }>;
  enrollments: any[];
  lessonProgress: any[];
  submissions: any[];
  challengeBestStars: Map<string, number>;
  starBuckets: Array<{
    star: number;
    count: number;
  }>;
  loading?: boolean;
}

export default function ProfileContentTabs({
  stats,
  learningProgress,
  enrollments,
  lessonProgress,
  submissions,
  challengeBestStars,
  starBuckets,
  loading,
}: ProfileContentTabsProps) {
  const { translate } = useLocales();
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const tabs = [
    { label: translate("student.Overview"), icon: <DashboardIcon /> },
    { label: translate("student.Courses"), icon: <SchoolIcon /> },
    { label: translate("student.Progress"), icon: <TrendingUpIcon /> },
    { label: translate("student.Achievements"), icon: <EmojiEventsIcon /> },
    { label: translate("student.Notes"), icon: <NoteAltIcon /> },
    { label: translate("student.Robots"), icon: <SmartToyIcon /> },
    { label: translate("student.Certificates"), icon: <CardMembershipIcon /> },
  ];

  return (
    <Card
      sx={{
        borderRadius: { xs: 0, sm: 4 },
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        minWidth: 0, // Allow shrinking below content width
        width: "100%",
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider", overflow: "hidden" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            px: { xs: 1, sm: 2 },
            minHeight: { xs: 56, sm: 64 },
            "& .MuiTab-root": {
              minHeight: { xs: 56, sm: 64 },
              textTransform: "none",
              fontSize: { xs: "0.875rem", sm: "1rem" },
              fontWeight: 600,
              color: "text.secondary",
              mr: { xs: 1, sm: 2 },
              minWidth: { xs: "auto", sm: 120 },
              px: { xs: 1, sm: 2 },
              "&.Mui-selected": {
                color: "primary.main",
              },
            },
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: "3px 3px 0 0",
            },
            "& .MuiTabs-scrollButtons": {
              "&.Mui-disabled": { opacity: 0.3 },
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              id={`profile-tab-${index}`}
              aria-controls={`profile-tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        <TabPanel value={value} index={0}>
          <OverviewTab
            stats={stats}
            learningProgress={learningProgress}
            loading={loading}
          />
        </TabPanel>

        <TabPanel value={value} index={1}>
          <EnrolledCoursesTab enrollments={enrollments} loading={loading} />
        </TabPanel>

        <TabPanel value={value} index={2}>
          <LearningProgressTab
            lessonProgress={lessonProgress}
            submissions={submissions}
            loading={loading}
          />
        </TabPanel>

        <TabPanel value={value} index={3}>
          <AchievementsTab
            submissions={submissions}
            challengeBestStars={challengeBestStars}
            starBuckets={starBuckets}
            loading={loading}
          />
        </TabPanel>

        <TabPanel value={value} index={4}>
          <MyNotesTab loading={loading} />
        </TabPanel>

        <TabPanel value={value} index={5}>
          <MyRobotsTab loading={loading} />
        </TabPanel>

        <TabPanel value={value} index={6}>
          <MyCertificatesTab loading={loading} />
        </TabPanel>
      </Box>
    </Card>
  );
}
