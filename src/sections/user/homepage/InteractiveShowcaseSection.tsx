import React, { useRef, useState } from "react";
import { Box, Container, Typography, Button, Tab, Tabs } from "@mui/material";
import { motion, useInView } from "framer-motion";
import {
  PlayArrow as PlayIcon,
  Code as CodeIcon,
  Build as BuildIcon,
} from "@mui/icons-material";

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
      id={`showcase-tabpanel-${index}`}
      aria-labelledby={`showcase-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const InteractiveShowcaseSection: React.FC = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const showcaseData = [
    {
      title: "Visual Programming",
      description:
        "Học lập trình thông qua giao diện kéo thả trực quan với Blockly",
      image: "/asset/BlockLy.png",
      icon: <CodeIcon />,
      color: "#22c55e",
      features: [
        "Không cần kiến thức lập trình trước",
        "Tạo code JavaScript tự động",
        "Hỗ trợ nhiều ngôn ngữ",
        "Giao diện thân thiện",
      ],
    },
    {
      title: "Hardware Programming",
      description:
        "Lập trình vi điều khiển BBC micro:bit với các cảm biến tích hợp",
      image: "/asset/Microbitv2.webp",
      icon: <BuildIcon />,
      color: "#16a34a",
      features: [
        "Cảm biến gia tốc tích hợp",
        "Kết nối Bluetooth & Radio",
        "Màn hình LED 5x5",
        "Lập trình dễ dàng",
      ],
    },
  ];

  return (
    <Box
      ref={sectionRef}
      sx={{
        py: { xs: 8, md: 12 },
        background:
          "linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Floating Background Elements */}
      <Box
        component={motion.div}
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        sx={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: "100px",
          height: "100px",
          background: "linear-gradient(45deg, #22c55e, #16a34a)",
          borderRadius: "20px",
          opacity: 0.1,
          zIndex: 0,
        }}
      />
      <Box
        component={motion.div}
        animate={{
          y: [0, 15, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        sx={{
          position: "absolute",
          top: "60%",
          right: "8%",
          width: "80px",
          height: "80px",
          background: "linear-gradient(45deg, #15803d, #166534)",
          borderRadius: "50%",
          opacity: 0.1,
          zIndex: 0,
        }}
      />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          <Box textAlign="center" mb={6}>
            <Typography
              variant="h6"
              sx={{
                color: "#22c55e",
                fontWeight: 600,
                mb: 2,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              Interactive Showcase
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                color: "#1a1a1a",
                mb: 3,
                fontSize: { xs: "2rem", md: "3.5rem" },
                lineHeight: 1.2,
              }}
            >
              Tương tác với
              <Box component="span" sx={{ color: "#22c55e" }}>
                {" "}
                Công nghệ
              </Box>
            </Typography>
          </Box>
        </motion.div>

        {/* Interactive Tabs */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
            <Tabs
              value={value}
              onChange={handleChange}
              centered
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#666",
                  "&.Mui-selected": {
                    color: "#22c55e",
                  },
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "#22c55e",
                  height: 3,
                },
              }}
            >
              {showcaseData.map((item, index) => (
                <Tab
                  key={index}
                  icon={item.icon}
                  iconPosition="start"
                  label={item.title}
                  sx={{
                    minWidth: { xs: "auto", md: 200 },
                    px: { xs: 1, md: 3 },
                  }}
                />
              ))}
            </Tabs>
          </Box>
        </motion.div>

        {/* Tab Panels */}
        {showcaseData.map((item, index) => (
          <TabPanel key={index} value={value} index={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: { xs: 4, md: 6 },
                  alignItems: "center",
                  minHeight: "600px",
                }}
              >
                {/* Content Side */}
                <Box sx={{ order: { xs: 2, md: index % 2 === 0 ? 1 : 2 } }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: "#1a1a1a",
                      mb: 3,
                      fontSize: { xs: "1.8rem", md: "2.5rem" },
                    }}
                  >
                    {item.title}
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      color: "#666",
                      fontSize: "1.2rem",
                      lineHeight: 1.6,
                      mb: 4,
                    }}
                  >
                    {item.description}
                  </Typography>

                  {/* Features Grid */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 2,
                      mb: 4,
                    }}
                  >
                    {item.features.map((feature, featureIndex) => (
                      <motion.div
                        key={featureIndex}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                          duration: 0.5,
                          delay: featureIndex * 0.1,
                        }}
                      >
                        <Box
                          sx={{
                            p: 2,
                            background: `${item.color}10`,
                            border: `2px solid ${item.color}20`,
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: item.color,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#333",
                              fontWeight: 500,
                              fontSize: "0.9rem",
                            }}
                          >
                            {feature}
                          </Typography>
                        </Box>
                      </motion.div>
                    ))}
                  </Box>

                  {/* CTA Button */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PlayIcon />}
                      sx={{
                        bgcolor: item.color,
                        color: "white",
                        px: 4,
                        py: 1.5,
                        borderRadius: "12px",
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        textTransform: "none",
                        boxShadow: `0 8px 20px ${item.color}40`,
                        "&:hover": {
                          bgcolor: item.color,
                          filter: "brightness(0.9)",
                          boxShadow: `0 12px 25px ${item.color}50`,
                        },
                      }}
                    >
                      Trải nghiệm ngay
                    </Button>
                  </motion.div>
                </Box>

                {/* Image Side */}
                <Box
                  sx={{
                    order: { xs: 1, md: index % 2 === 0 ? 2 : 1 },
                    textAlign: "center",
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box
                      className="showcase-image"
                      sx={{
                        position: "relative",
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        overflow: "visible",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: "500px",
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{
                          width: "100%",
                          maxWidth: "700px",
                          height: "auto",
                          minHeight: "400px",
                          objectFit: "contain",
                          border: "none",
                          outline: "none",
                          boxShadow: "none",
                          background: "transparent",
                          borderRadius: "0",
                        }}
                      />

                      {/* Floating Elements */}
                      <Box
                        component={motion.div}
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        sx={{
                          position: "absolute",
                          top: 20,
                          right: 20,
                          width: 60,
                          height: 60,
                          background: `linear-gradient(45deg, ${item.color}, ${item.color}dd)`,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          boxShadow: `0 10px 20px ${item.color}40`,
                        }}
                      >
                        {item.icon}
                      </Box>
                    </Box>
                  </motion.div>
                </Box>
              </Box>
            </motion.div>
          </TabPanel>
        ))}
      </Container>
    </Box>
  );
};

export default InteractiveShowcaseSection;
