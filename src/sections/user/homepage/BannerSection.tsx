import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useLocales } from "../../../hooks";

const BannerSection: React.FC = () => {
  const { translate } = useLocales();

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        mb: 4,
        mt: 2,
        px: { xs: 0, md: 4 },
      }}
    >
      {/* Banner content */}
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        sx={{
          width: "100%",
          height: { xs: "auto" },
          py: { xs: 6, md: 8 },
          background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          borderRadius: { xs: 0, md: "8px" },
          boxShadow: "0 10px 30px rgba(34, 197, 94, 0.25)",
        }}
      >
        {/* Background pattern */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "30px 30px",
            zIndex: 0,
          }}
        />

        {/* STEM graphic */}
        <Box
          component="img"
          src="https://placehold.co/400x400/22c55e/ffffff?text=🤖+STEM"
          alt="STEM robotics graphic"
          sx={{
            position: "absolute",
            right: { xs: "-100px", md: "10%" },
            maxWidth: { xs: "300px", md: "400px" },
            opacity: 0.5,
            filter: "blur(2px)",
            zIndex: 0,
          }}
        />

        {/* Content Container */}
        <Container
          maxWidth="lg"
          sx={{
            position: "relative",
            zIndex: 1,
            mx: "auto",
            textAlign: "center",
            color: "#fff",
          }}
        >
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
              mb: { xs: 2, sm: 3 },
            }}
          >
            {translate("homepage.STEMWorkshop")}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: "0.9rem", sm: "1rem", md: "1.2rem" },
              mb: { xs: 3, md: 4 },
              maxWidth: "800px",
              mx: "auto",
              opacity: 0.9,
            }}
          >
            {translate("homepage.DiscoverRoboticsAI")}
          </Typography>

          <Typography
            variant="h4"
            component="h3"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
              mb: { xs: 4, sm: 5 },
              color: "#dcfce7",
            }}
          >
            15.09.2025
          </Typography>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: "#ffffff",
                color: "#16a34a",
                fontWeight: 600,
                fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                px: { xs: 3, sm: 4, md: 5 },
                py: { xs: 1, sm: 1.5, md: 1.8 },
                borderRadius: "12px",
                textTransform: "none",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
                "&:hover": {
                  bgcolor: "#f0fdf4",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              {translate("homepage.JoinUs")}
            </Button>
          </motion.div>

          {/* Contact information */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "center",
              mt: 4,
              gap: { xs: 1, md: 3 },
              fontSize: { xs: "0.8rem", md: "0.9rem" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box component="span" sx={{ opacity: 0.8, mr: 1 }}>
                📱
              </Box>
              0868 993 382
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box component="span" sx={{ opacity: 0.8, mr: 1 }}>
                📧
              </Box>
              contact@ottobit.edu.vn
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box component="span" sx={{ opacity: 0.8, mr: 1 }}>
                🌐
              </Box>
              www.ottobit.edu.vn
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default BannerSection;
