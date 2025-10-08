import React, { useRef } from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { motion, useInView } from "framer-motion";
import {
  TouchApp as TouchIcon,
  School as SchoolIcon,
  Print as PrintIcon,
  Lightbulb as LightbulbIcon,
  Extension as ExtensionIcon,
  Code as CodeIcon,
  Psychology as CreativityIcon,
} from "@mui/icons-material";
import { useLocales } from "../../../hooks";

interface FeatureDataType {
  icon: React.ReactNode;
  title: string;
  color: string;
  position: any;
}

const FeatureCard: React.FC<{
  feature: FeatureDataType;
  index: number;
}> = ({ feature, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0, opacity: 0 }}
      animate={isInView ? { scale: 1, opacity: 1 } : {}}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
      }}
      style={{
        position: "absolute",
        ...feature.position,
      }}
    >
      <Box
        component={motion.div}
        whileHover={{
          scale: 1.1,
          transition: { duration: 0.2 },
        }}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: "180px",
          cursor: "pointer",
        }}
      >
        {/* Icon Container */}
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "16px",
            background: feature.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            mb: 1.5,
            boxShadow: `0 8px 20px ${feature.color}40`,
          }}
        >
          {feature.icon}
        </Box>

        {/* Title */}
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: "#1a1a1a",
            fontSize: "0.9rem",
            lineHeight: 1.3,
          }}
        >
          {feature.title}
        </Typography>
      </Box>
    </motion.div>
  );
};

const FeaturesSection: React.FC = () => {
  const { translate } = useLocales();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Features data using translate
  const featuresData: FeatureDataType[] = [
    {
      icon: <TouchIcon sx={{ fontSize: 24 }} />,
      title: translate("homepage.NewWaysInteract"),
      color: "#60a5fa", // Blue
      position: { top: "30%", left: "15%" },
    },
    {
      icon: <SchoolIcon sx={{ fontSize: 24 }} />,
      title: translate("homepage.TeachSTEM"),
      color: "#a78bfa", // Purple
      position: { top: "5%", left: "25%" },
    },
    {
      icon: <PrintIcon sx={{ fontSize: 24 }} />,
      title: translate("homepage.Shape3D"),
      color: "#fbbf24", // Yellow
      position: { top: "30%", right: "15%" },
    },
    {
      icon: <CreativityIcon sx={{ fontSize: 24 }} />,
      title: translate("homepage.CreativityProblem"),
      color: "#60a5fa", // Blue
      position: { top: "50%", right: "10%" },
    },
    {
      icon: <LightbulbIcon sx={{ fontSize: 24 }} />,
      title: translate("homepage.FreeImagination"),
      color: "#fbbf24", // Yellow
      position: { top: "55%", left: "10%" },
    },
    {
      icon: <ExtensionIcon sx={{ fontSize: 24 }} />,
      title: translate("homepage.NewBuildingMechanisms"),
      color: "#22c55e", // Green
      position: { bottom: "5%", left: "25%" },
    },
    {
      icon: <CodeIcon sx={{ fontSize: 24 }} />,
      title: translate("homepage.MultipleCoding"),
      color: "#22c55e", // Green
      position: { bottom: "15%", right: "10%" },
    },
  ];

  return (
    <Box
      ref={sectionRef}
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      sx={{
        py: { xs: 8, md: 12 },
        position: "relative",
        background: "#f8fafc",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          maxWidth: "1400px", // Increased for more space
          position: "relative",
          zIndex: 1,
          height: "700px", // Increased height
        }}
      >
        {/* Central Content */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 2,
          }}
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h1"
              sx={{
                fontWeight: 700,
                color: "#1a1a1a",
                mb: 1,
                fontSize: { xs: "2.5rem", md: "4rem", lg: "4.5rem" },
                lineHeight: 1.1,
              }}
            >
              {translate("homepage.EndlessFunctionality")}
            </Typography>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 700,
                mb: 4,
                fontSize: { xs: "2.5rem", md: "4rem", lg: "4.5rem" },
                lineHeight: 1.1,
              }}
            >
              Endless{" "}
              <Box
                component="span"
                sx={{
                  background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "8px",
                    background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                    borderRadius: "4px",
                  },
                }}
              >
                {translate("homepage.EndlessFun")}
              </Box>
            </Typography>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "#1a1a1a",
                  color: "white",
                  px: 4,
                  py: 1.5,
                  borderRadius: "50px",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  textTransform: "none",
                  border: "2px solid #1a1a1a",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: "transparent",
                    color: "#1a1a1a",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                  },
                }}
              >
                {translate("homepage.ExploreSolutions")}
              </Button>
            </motion.div>
          </motion.div>
        </Box>

        {/* Feature Cards positioned around the center */}
        {featuresData.map((feature, index) => (
          <FeatureCard key={index} feature={feature} index={index} />
        ))}

        {/* Background Decorative Elements */}
        <Box
          component={motion.div}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 50,
            repeat: Infinity,
            ease: "linear",
          }}
          sx={{
            position: "absolute",
            top: "20%",
            left: "10%",
            width: "100px",
            height: "100px",
            border: "2px solid #e5e7eb",
            borderRadius: "20px",
            opacity: 0.3,
            zIndex: 0,
          }}
        />
        <Box
          component={motion.div}
          animate={{
            rotate: [360, 0],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
          }}
          sx={{
            position: "absolute",
            bottom: "20%",
            right: "10%",
            width: "80px",
            height: "80px",
            border: "2px solid #e5e7eb",
            borderRadius: "50%",
            opacity: 0.3,
            zIndex: 0,
          }}
        />
      </Container>
    </Box>
  );
};

export default FeaturesSection;
