import { useState } from "react";
import { Box, Tabs, Tab, Card } from "@mui/material";
import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUpOutlined";
import EmojiEventsIcon from "@mui/icons-material/EmojiEventsOutlined";
import OverviewTab from "../tabs/OverviewTab";
import EnrolledCoursesTab from "../tabs/EnrolledCoursesTab";
import LearningProgressTab from "../tabs/LearningProgressTab";
import AchievementsTab from "../tabs/AchievementsTab";

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
  challengeProcesses: any[];
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
  challengeProcesses,
  starBuckets,
  loading,
}: ProfileContentTabsProps) {
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const tabs = [
    { label: "Tổng quan", icon: <DashboardIcon /> },
    { label: "Khóa học", icon: <SchoolIcon /> },
    { label: "Tiến độ", icon: <TrendingUpIcon /> },
    { label: "Thành tích", icon: <EmojiEventsIcon /> },
  ];

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            "& .MuiTab-root": {
              minHeight: 64,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              color: "text.secondary",
              mr: 2, // Thêm khoảng cách giữa các tab
              "&.Mui-selected": {
                color: "primary.main",
              },
            },
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: "3px 3px 0 0",
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

      <Box sx={{ p: 3 }}>
        <TabPanel value={value} index={0}>
          <OverviewTab stats={stats} learningProgress={learningProgress} loading={loading} />
        </TabPanel>

        <TabPanel value={value} index={1}>
          <EnrolledCoursesTab enrollments={enrollments} loading={loading} />
        </TabPanel>

        <TabPanel value={value} index={2}>
          <LearningProgressTab lessonProgress={lessonProgress} submissions={submissions} loading={loading} />
        </TabPanel>

        <TabPanel value={value} index={3}>
          <AchievementsTab challengeProcesses={challengeProcesses} starBuckets={starBuckets} loading={loading} />
        </TabPanel>
      </Box>
    </Card>
  );
}