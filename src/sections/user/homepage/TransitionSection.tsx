import React, { useRef } from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { motion, useInView } from "framer-motion";
import { ArrowForward as ArrowIcon } from "@mui/icons-material";
import { useLocales } from "hooks";

const TransitionSection: React.FC = () => {
  const { translate } = useLocales();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Blockly-inspired section data
  const sections = [
    {
      title: translate("homepage.CreateTitle"),
      subtitle: translate("homepage.CreateSubtitle"),
      buttonText: translate("homepage.CreateButton"),
      background:
        "linear-gradient(135deg, #FCD34D 0%, #F59E0B 50%, #D97706 100%)", // Yellow
      textColor: "#ffffff",
      image: "/OttoDIY/create-photo-2.png",
    },
    {
      title: translate("homepage.ConnectTitle"),
      subtitle: translate("homepage.ConnectSubtitle"),
      buttonText: translate("homepage.ConnectButton"),
      background:
        "linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)", // Blue
      textColor: "#ffffff",
      image: "/OttoDIY/connect-photo-2.png",
    },
    {
      title: translate("homepage.CodeTitle"),
      subtitle: translate("homepage.CodeSubtitle"),
      buttonText: translate("homepage.CodeButton"),
      background:
        "linear-gradient(135deg, #4ADE80 0%, #22C55E 50%, #16A34A 100%)", // Green
      textColor: "#ffffff",
      image: "/OttoDIY/code-photo-2.png",
    },
  ];

  return (
    <Box
      ref={sectionRef}
      sx={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      {sections.map((section, index) => (
        <Box
          key={section.title}
          sx={{
            position: "relative",
            minHeight: { xs: "80vh", md: "100vh" },
            display: "flex",
            alignItems: "center",
            background: section.background,
            clipPath:
              index === 0
                ? "polygon(0 0, 100% 0, 85% 100%, 0 100%)" // First section - slant right
                : index === 1
                ? "polygon(15% 0, 100% 0, 85% 100%, 0 100%)" // Middle section - slant both sides
                : "polygon(15% 0, 100% 0, 100% 100%, 0 100%)", // Last section - slant left
            zIndex: sections.length - index,
            marginTop: index > 0 ? "-5vh" : 0, // Overlap sections
          }}
        >
          {/* Blockly-style decorative elements */}
          <Box
            component={motion.div}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.5,
            }}
            sx={{
              position: "absolute",
              top: "20%",
              left: "10%",
              width: "60px",
              height: "60px",
              border: "3px solid rgba(255, 255, 255, 0.3)",
              borderRadius: index === 0 ? "12px" : index === 1 ? "50%" : "8px",
              zIndex: 2,
            }}
          />

          {/* Secondary decorative element */}
          <Box
            component={motion.div}
            animate={{
              rotate: [360, 0],
              y: [0, -15, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.3 + 1,
            }}
            sx={{
              position: "absolute",
              top: "60%",
              right: "15%",
              width: { xs: "30px", md: "40px" },
              height: { xs: "30px", md: "40px" },
              border: "2px solid rgba(255, 255, 255, 0.4)",
              borderRadius: index === 0 ? "50%" : index === 1 ? "8px" : "12px",
              zIndex: 2,
            }}
          />

          {/* Interlocking connector visual */}
          {index < sections.length - 1 && (
            <Box
              sx={{
                position: "absolute",
                bottom: "-10px",
                right: "45%",
                width: "60px",
                height: "20px",
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "10px 10px 0 0",
                zIndex: 3,
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: "15px",
                  left: "20px",
                  width: "20px",
                  height: "10px",
                  background: "rgba(255, 255, 255, 0.3)",
                  borderRadius: "0 0 10px 10px",
                },
              }}
            />
          )}

          <Container
            maxWidth="lg"
            sx={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              minHeight: "80vh",
              flexDirection: {
                xs: "column",
                md: index % 2 === 0 ? "row" : "row-reverse",
              },
              gap: { xs: 4, md: 8 },
              py: { xs: 8, md: 12 },
            }}
          >
            {/* Content */}
            <Box
              sx={{
                flex: 1,
                textAlign: {
                  xs: "center",
                  md: index % 2 === 0 ? "left" : "right",
                },
              }}
            >
              <motion.div
                initial={{ x: index % 2 === 0 ? -50 : 50, opacity: 0 }}
                animate={isInView ? { x: 0, opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 800,
                    color: section.textColor,
                    mb: 3,
                    fontSize: { xs: "3rem", md: "4rem", lg: "5rem" },
                    lineHeight: 0.9,
                    textShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  {section.title}
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    color: "rgba(255, 255, 255, 0.95)",
                    mb: 4,
                    fontSize: { xs: "1.1rem", md: "1.3rem" },
                    fontWeight: 400,
                    maxWidth: "500px",
                    mx: { xs: "auto", md: 0 },
                    lineHeight: 1.6,
                  }}
                >
                  {section.subtitle}
                </Typography>

                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={isInView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
                >
                  <Button
                    variant="outlined"
                    size="large"
                    endIcon={<ArrowIcon />}
                    sx={{
                      color: "#ffffff",
                      borderColor: "rgba(255, 255, 255, 0.6)",
                      px: 4,
                      py: 1.5,
                      borderRadius: "50px",
                      fontSize: "1rem",
                      fontWeight: 600,
                      textTransform: "none",
                      backdropFilter: "blur(10px)",
                      background: "rgba(255, 255, 255, 0.15)",
                      border: "2px solid rgba(255, 255, 255, 0.6)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: "#ffffff",
                        background: "rgba(255, 255, 255, 0.25)",
                        transform: "translateY(-3px)",
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
                      },
                    }}
                  >
                    {section.buttonText}
                  </Button>
                </motion.div>
              </motion.div>
            </Box>

            {/* Image placeholder */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <motion.div
                initial={{ y: 30, opacity: 0, scale: 0.9 }}
                animate={isInView ? { y: 0, opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 + 0.4 }}
              >
                <Box
                  sx={{
                    position: "relative",
                    display: "inline-block",
                  }}
                >
                  {/* Blockly-style corners */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: -15,
                      left: -15,
                      width: "30px",
                      height: "30px",
                      border: "3px solid rgba(255, 255, 255, 0.7)",
                      borderRight: "none",
                      borderBottom: "none",
                      borderRadius: "8px 0 0 0",
                      zIndex: 3,
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: -15,
                      right: -15,
                      width: "30px",
                      height: "30px",
                      border: "3px solid rgba(255, 255, 255, 0.7)",
                      borderLeft: "none",
                      borderBottom: "none",
                      borderRadius: "0 8px 0 0",
                      zIndex: 3,
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: -15,
                      left: -15,
                      width: "30px",
                      height: "30px",
                      border: "3px solid rgba(255, 255, 255, 0.7)",
                      borderRight: "none",
                      borderTop: "none",
                      borderRadius: "0 0 0 8px",
                      zIndex: 3,
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: -15,
                      right: -15,
                      width: "30px",
                      height: "30px",
                      border: "3px solid rgba(255, 255, 255, 0.7)",
                      borderLeft: "none",
                      borderTop: "none",
                      borderRadius: "0 0 8px 0",
                      zIndex: 3,
                    }}
                  />

                  {/* Image container with Blockly styling */}
                  <Box
                    sx={{
                      width: { xs: "280px", md: "350px", lg: "400px" },
                      height: { xs: "200px", md: "250px", lg: "280px" },
                      borderRadius: "20px",
                      background: "rgba(255, 255, 255, 0.95)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
                      overflow: "hidden",
                      border: "3px solid rgba(255, 255, 255, 0.8)",
                      position: "relative",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(45deg, transparent 30%, ${
                          index === 0
                            ? "rgba(252, 211, 77, 0.1)"
                            : index === 1
                            ? "rgba(96, 165, 250, 0.1)"
                            : "rgba(74, 222, 128, 0.1)"
                        } 50%, transparent 70%)`,
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={section.image}
                      alt={`${section.title} section`}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "17px", // Slightly smaller than container
                        zIndex: 1,
                        position: "relative",
                      }}
                    />
                  </Box>
                </Box>
              </motion.div>
            </Box>
          </Container>
        </Box>
      ))}
    </Box>
  );
};

export default TransitionSection;
