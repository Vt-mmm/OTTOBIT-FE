import { Box, Container, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import useLocales from "hooks/useLocales";

export default function ExperiencesAndMaterialsSection() {
  const { translate } = useLocales();
  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: "#f8f9fa",
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            gap: 6,
          }}
        >
          {/* Experiences Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Box
              sx={{
                position: "relative",
                borderRadius: 6,
                overflow: "hidden",
                minHeight: 500,
                bgcolor: "#e8f5e8",
                p: 6,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              {/* Background decorative elements */}
              <Box
                sx={{
                  position: "absolute",
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  bgcolor: "rgba(76, 175, 80, 0.1)",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: -30,
                  left: -30,
                  width: 120,
                  height: 120,
                  borderRadius: 4,
                  bgcolor: "rgba(76, 175, 80, 0.15)",
                }}
              />

              <Box sx={{ position: "relative", zIndex: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#E58411",
                    fontWeight: 600,
                    fontSize: "1.2rem",
                    mb: 2,
                  }}
                >
                  {translate("store.experiences.learningExperience")}
                </Typography>
                
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: { xs: "1.8rem", md: "2.2rem" },
                    fontWeight: 700,
                    color: "#2c3e50",
                    lineHeight: 1.3,
                    mb: 3,
                  }}
                >
                  {translate("store.experiences.bestExperience")}
                </Typography>
                
                <Typography
                  variant="body1"
                  sx={{
                    color: "#7f8c8d",
                    lineHeight: 1.6,
                    mb: 4,
                    opacity: 0.8,
                    maxWidth: "400px",
                  }}
                >
                  {translate("store.experiences.description")}
                </Typography>
                
                <Button
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    color: "#E58411",
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: "1rem",
                    p: 0,
                    minWidth: "auto",
                    "&:hover": {
                      bgcolor: "transparent",
                      "& .MuiSvgIcon-root": {
                        transform: "translateX(4px)",
                      },
                    },
                    "& .MuiSvgIcon-root": {
                      transition: "transform 0.3s ease",
                      fontSize: 18,
                    },
                  }}
                >
                  {translate("store.experiences.moreInfo")}
                </Button>
              </Box>

              {/* Decorative room elements */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 40,
                  right: 40,
                  width: 80,
                  height: 60,
                  borderRadius: 2,
                  bgcolor: "#4CAF50",
                  opacity: 0.2,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 60,
                  right: 60,
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: "#81C784",
                  opacity: 0.3,
                }}
              />
            </Box>
          </motion.div>

          {/* Materials Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Box
              sx={{
                position: "relative",
                borderRadius: 6,
                overflow: "hidden",
                minHeight: 500,
                bgcolor: "#fff3e0",
                p: 6,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              {/* Background decorative elements */}
              <Box
                sx={{
                  position: "absolute",
                  top: -40,
                  left: -40,
                  width: 180,
                  height: 180,
                  borderRadius: "50%",
                  bgcolor: "rgba(255, 152, 0, 0.1)",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: 3,
                  bgcolor: "rgba(255, 152, 0, 0.15)",
                }}
              />

              <Box sx={{ position: "relative", zIndex: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#E58411",
                    fontWeight: 600,
                    fontSize: "1.2rem",
                    mb: 2,
                  }}
                >
                  {translate("store.materials.technology")}
                </Typography>
                
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: { xs: "1.8rem", md: "2.2rem" },
                    fontWeight: 700,
                    color: "#2c3e50",
                    lineHeight: 1.3,
                    mb: 3,
                  }}
                >
                  {translate("store.materials.cuttingEdge")}
                </Typography>
                
                <Typography
                  variant="body1"
                  sx={{
                    color: "#7f8c8d",
                    lineHeight: 1.6,
                    mb: 4,
                    opacity: 0.8,
                    maxWidth: "400px",
                  }}
                >
                  {translate("store.materials.description")}
                </Typography>
                
                <Button
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    color: "#E58411",
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: "1rem",
                    p: 0,
                    minWidth: "auto",
                    "&:hover": {
                      bgcolor: "transparent",
                      "& .MuiSvgIcon-root": {
                        transform: "translateX(4px)",
                      },
                    },
                    "& .MuiSvgIcon-root": {
                      transition: "transform 0.3s ease",
                      fontSize: 18,
                    },
                  }}
                >
                  {translate("store.materials.moreInfo")}
                </Button>
              </Box>

              {/* Decorative material elements */}
              <Box
                sx={{
                  position: "absolute",
                  top: 100,
                  right: 30,
                  width: 60,
                  height: 20,
                  borderRadius: 2,
                  bgcolor: "#FF9800",
                  opacity: 0.3,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 130,
                  right: 50,
                  width: 40,
                  height: 15,
                  borderRadius: 2,
                  bgcolor: "#FFC107",
                  opacity: 0.4,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 80,
                  left: 30,
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  bgcolor: "#FF9800",
                  opacity: 0.2,
                }}
              />
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}