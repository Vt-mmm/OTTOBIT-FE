import React, { useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { motion, useInView } from "framer-motion";
import {
  DeveloperBoard as MicrobitIcon,
  ViewModule as BlocklyIcon,
  Science as STEMIcon,
} from "@mui/icons-material";
import { useLocales } from "hooks";

const ExhibitionSection: React.FC = () => {
  const { translate } = useLocales();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const exhibitionItems = [
    {
      title: "Visual Programming với Blockly",
      description:
        "Lập trình kéo thả trực quan, dễ học cho mọi lứa tuổi. Tạo ra những chương trình phức tạp chỉ bằng cách kéo và ghép các khối lệnh.",
      image: "/asset/BlockLy.png",
      icon: <BlocklyIcon sx={{ fontSize: 40 }} />,
      color: "#22c55e",
      features: [
        "Drag & Drop Interface",
        "Real-time Code Generation",
        "Educational Friendly",
        "Multi-language Support",
      ],
    },
    {
      title: "BBC micro:bit v2",
      description:
        "Vi điều khiển giáo dục mạnh mẽ với cảm biến tích hợp. Khám phá thế giới IoT và robotics một cách thú vị.",
      image: "/asset/Microbitv2.webp",
      icon: <MicrobitIcon sx={{ fontSize: 40 }} />,
      color: "#16a34a",
      features: [
        "Built-in Sensors",
        "Wireless Communication",
        "LED Matrix Display",
        "Easy Programming",
      ],
    },
  ];

  return (
    <Box
      ref={sectionRef}
      sx={{
        py: { xs: 8, md: 12 },
        background:
          "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative Elements */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0 }}
        animate={isInView ? { opacity: 0.1, scale: 1 } : {}}
        transition={{ duration: 2 }}
        sx={{
          position: "absolute",
          top: "10%",
          right: "5%",
          width: "200px",
          height: "200px",
          background: "radial-gradient(circle, #22c55e 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(50px)",
        }}
      />
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0 }}
        animate={isInView ? { opacity: 0.1, scale: 1 } : {}}
        transition={{ duration: 2, delay: 0.5 }}
        sx={{
          position: "absolute",
          bottom: "10%",
          left: "5%",
          width: "150px",
          height: "150px",
          background: "radial-gradient(circle, #16a34a 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(40px)",
        }}
      />

      <Container maxWidth="xl">
        {/* Header */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          <Box textAlign="center" mb={8}>
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
              Technology Exhibition
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
              Trưng bày Công nghệ
              <Box component="span" sx={{ color: "#22c55e" }}>
                {" "}
                STEM
              </Box>
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#666",
                fontSize: "1.2rem",
                maxWidth: "600px",
                mx: "auto",
              }}
            >
              Khám phá các công nghệ tiên tiến trong giáo dục STEM
            </Typography>
          </Box>
        </motion.div>

        {/* Exhibition Grid */}
        <Grid container spacing={6}>
          {exhibitionItems.map((item, index) => (
            <Grid item xs={12} md={6} key={index}>
              <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={isInView ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: index * 0.3 }}
              >
                <Card
                  component={motion.div}
                  whileHover={{
                    y: -10,
                    boxShadow: "0 20px 40px rgba(34, 197, 94, 0.15)",
                  }}
                  sx={{
                    height: "100%",
                    borderRadius: "20px",
                    overflow: "hidden",
                    background: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(10px)",
                    border: `2px solid ${item.color}20`,
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                >
                  {/* Image Section */}
                  <Box
                    sx={{
                      height: "300px",
                      position: "relative",
                      background: `linear-gradient(135deg, ${item.color}10, ${item.color}05)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <motion.img
                      src={item.image}
                      alt={item.title}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        maxWidth: "80%",
                        maxHeight: "80%",
                        objectFit: "contain",
                        borderRadius: "10px",
                      }}
                    />

                    {/* Floating Icon */}
                    <Box
                      component={motion.div}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={isInView ? { scale: 1, rotate: 0 } : {}}
                      transition={{ duration: 0.6, delay: index * 0.2 + 0.5 }}
                      sx={{
                        position: "absolute",
                        top: 20,
                        right: 20,
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${item.color}, ${item.color}dd)`,
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

                  {/* Content Section */}
                  <CardContent sx={{ p: 4 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: "#1a1a1a",
                        mb: 2,
                        fontSize: "1.5rem",
                      }}
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        color: "#666",
                        lineHeight: 1.6,
                        mb: 3,
                      }}
                    >
                      {item.description}
                    </Typography>

                    {/* Features List */}
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: item.color,
                          mb: 2,
                          fontSize: "1rem",
                        }}
                      >
                        Tính năng nổi bật:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {item.features.map((feature, featureIndex) => (
                          <Box
                            key={featureIndex}
                            component={motion.div}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={isInView ? { scale: 1, opacity: 1 } : {}}
                            transition={{
                              duration: 0.3,
                              delay: index * 0.3 + featureIndex * 0.1 + 0.8,
                            }}
                            sx={{
                              px: 2,
                              py: 0.5,
                              background: `${item.color}15`,
                              border: `1px solid ${item.color}30`,
                              borderRadius: "20px",
                              fontSize: "0.85rem",
                              color: item.color,
                              fontWeight: 500,
                            }}
                          >
                            {feature}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <Box
            textAlign="center"
            mt={8}
            sx={{
              p: 6,
              background: "linear-gradient(135deg, #22c55e10, #16a34a05)",
              borderRadius: "20px",
              border: "2px solid #22c55e20",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <STEMIcon sx={{ fontSize: 40 }} />
              </Box>
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#1a1a1a",
                mb: 2,
              }}
            >
              Sẵn sàng khám phá?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#666",
                fontSize: "1.1rem",
                maxWidth: "500px",
                mx: "auto",
              }}
            >
              {translate("homepage.JoinExperienceSTEM")}
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ExhibitionSection;
