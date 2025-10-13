import { Box, Typography, Paper, Chip } from "@mui/material";
import {
  CheckCircle as CheckIcon,
  WorkspacePremium as PremiumIcon,
  VideoLibrary as VideoIcon,
  Assignment as AssignmentIcon,
  EmojiEvents as TrophyIcon,
} from "@mui/icons-material";
import { useLocales } from "../../../../hooks";

interface CourseBenefitsSectionProps {
  isPremium?: boolean;
}

export default function CourseBenefitsSection({
  isPremium = false,
}: CourseBenefitsSectionProps) {
  const { translate } = useLocales();

  const benefits = [
    {
      icon: <VideoIcon sx={{ fontSize: 20 }} />,
      text: translate("courses.BenefitVideoLectures"),
    },
    {
      icon: <AssignmentIcon sx={{ fontSize: 20 }} />,
      text: translate("courses.BenefitHandsOnProjects"),
    },
    {
      icon: <TrophyIcon sx={{ fontSize: 20 }} />,
      text: translate("courses.BenefitCertificate"),
    },
    {
      icon: <CheckIcon sx={{ fontSize: 20 }} />,
      text: translate("courses.BenefitLifetimeAccess"),
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        border: "1px solid #e0e0e0",
        borderRadius: 3,
        bgcolor: "#fafafa",
        mb: 3,
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <PremiumIcon sx={{ color: "#424242", fontSize: 24 }} />
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {translate("courses.IncludedWithCourse")}
          </Typography>
          {isPremium && (
            <Chip
              label={translate("courses.PremiumCourse")}
              size="small"
              sx={{
                bgcolor: "#ff9800",
                color: "white",
                fontWeight: 600,
                height: 22,
                mt: 0.5,
              }}
            />
          )}
        </Box>
      </Box>

      {/* Benefits List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {benefits.map((benefit, index) => (
          <Box
            key={index}
            sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
          >
            <Box
              sx={{
                color: "#616161",
                bgcolor: "#fafafa",
                p: 0.5,
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              {benefit.icon}
            </Box>
            <Typography variant="body2">{benefit.text}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
