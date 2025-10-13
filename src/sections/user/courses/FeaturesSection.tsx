import { Box, Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CodeIcon from "@mui/icons-material/Code";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupsIcon from "@mui/icons-material/Groups";
import { useLocales } from "../../../hooks";

const features = [
  {
    icon: SmartToyIcon,
    titleKey: "courses.features.robot",
    descriptionKey: "courses.features.robotDesc",
    color: "#4caf50",
  },
  {
    icon: CodeIcon,
    titleKey: "courses.features.interactive",
    descriptionKey: "courses.features.interactiveDesc",
    color: "#2196f3",
  },
  {
    icon: EmojiEventsIcon,
    titleKey: "courses.features.certificate",
    descriptionKey: "courses.features.certificateDesc",
    color: "#ff9800",
  },
  {
    icon: GroupsIcon,
    titleKey: "courses.features.community",
    descriptionKey: "courses.features.communityDesc",
    color: "#9c27b0",
  },
];

export default function FeaturesSection() {
  const { translate } = useLocales();

  return (
    <Box
      sx={{
        py: { xs: 4, md: 6 },
        backgroundColor: "transparent",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "repeat(4, 1fr)",
            },
            gap: { xs: 3, md: 4 },
          }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Box
                key={index}
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.2 },
                }}
                sx={{
                  textAlign: "center",
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(76, 175, 80, 0.1)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    border: `1px solid ${feature.color}`,
                    boxShadow: `0 8px 30px ${feature.color}20`,
                  },
                }}
              >
                {/* Icon with animated background */}
                <Box
                  component={motion.div}
                  whileHover={{
                    scale: 1.1,
                    rotate: [0, -5, 5, -5, 0],
                    transition: { duration: 0.5 },
                  }}
                  sx={{
                    width: 70,
                    height: 70,
                    margin: "0 auto 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    backgroundColor: `${feature.color}15`,
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      inset: -4,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${feature.color}30, transparent)`,
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                    },
                    "&:hover::before": {
                      opacity: 1,
                    },
                  }}
                >
                  <Icon
                    sx={{
                      fontSize: 36,
                      color: feature.color,
                    }}
                  />
                </Box>

                {/* Title */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                    fontSize: { xs: "1rem", md: "1.1rem" },
                    color: "#1a1a1a",
                  }}
                >
                  {translate(feature.titleKey)}
                </Typography>

                {/* Description */}
                <Typography
                  variant="body2"
                  sx={{
                    color: "#666",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                  }}
                >
                  {translate(feature.descriptionKey)}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}
