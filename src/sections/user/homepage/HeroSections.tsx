import React from "react";
import { Box, Container, Typography, Button, Stack } from "@mui/material";
import { motion } from "framer-motion";
// Hero image sẽ thay thế sau
import { useAppSelector } from "reduxStore/config";

const HeroSection = () => {
  // Lấy trạng thái đăng nhập từ Redux store
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Animation config - sẽ dùng trực tiếp trong motion components

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      sx={{
        width: "100%",
        pt: { xs: 12, md: 14 },
        pb: { xs: 5, md: 8 },
        background:
          "linear-gradient(180deg, #ffffff 0%, rgba(112, 200, 210, 0.15) 100%)",
        position: "relative",
        minHeight: { xs: "550px", md: "650px" },
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Decorative Elements */}
      <Box
        component={motion.div}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        transition={{ duration: 1.5, delay: 0.2 }}
        sx={{
          position: "absolute",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(112, 200, 210, 0.3) 0%, rgba(112, 200, 210, 0.1) 50%, rgba(112, 200, 210, 0) 70%)",
          top: "-150px",
          right: "-80px",
          zIndex: 0,
          filter: "blur(50px)",
        }}
      />
      <Box
        component={motion.div}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.2 }}
        transition={{ duration: 1.5, delay: 0.4 }}
        sx={{
          position: "absolute",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(160, 216, 179, 0.3) 0%, rgba(160, 216, 179, 0.1) 50%, rgba(160, 216, 179, 0) 70%)",
          bottom: "30px",
          left: "-80px",
          zIndex: 0,
          filter: "blur(40px)",
        }}
      />
      <Container
        maxWidth={false}
        sx={{
          maxWidth: "1440px",
          px: { xs: 3, sm: 4, md: 5 },
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: { xs: 8, md: 0 },
          }}
        >
          {/* Left Column - Text Content */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            sx={{
              width: { xs: "100%", md: "40%" },
              order: { xs: 2, md: 1 },
              zIndex: 2,
            }}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: "#000000",
                  fontSize: { xs: "2.4rem", sm: "3rem", md: "4rem" },
                  lineHeight: 1.2,
                  mb: 3,
                }}
              >
                "Ottobit"
                <br />
                Here for you
              </Typography>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <Typography
                variant="body1"
                paragraph
                sx={{
                  color: "#444",
                  fontSize: { xs: "1rem", md: "1.1rem" },
                  lineHeight: 1.7,
                  mb: 4,
                }}
              >
                Ottobit là công ty hướng đến Sức khỏe tinh thần, kết hợp sức
                mạnh của khoa học thần kinh, âm học tâm lý và công nghệ.
              </Typography>
            </motion.div>

            {/* Chỉ hiển thị các nút khi người dùng chưa đăng nhập */}
            {!isAuthenticated && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2.5}
                  sx={{ mt: 4 }}
                >
                  <Button
                    variant="contained"
                    href="/auth/login"
                    sx={{
                      bgcolor: "#6eccd9",
                      color: "#fff",
                      px: 4,
                      py: 1.3,
                      borderRadius: 1,
                      fontWeight: 600,
                      "&:hover": {
                        bgcolor: "#5ab9c3",
                      },
                    }}
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    variant="outlined"
                    href="#"
                    sx={{
                      color: "#000",
                      borderColor: "#000",
                      px: 3,
                      py: 1.2,
                      borderRadius: 1,
                      "&:hover": {
                        borderColor: "#000",
                        bgcolor: "rgba(0,0,0,0.04)",
                      },
                    }}
                  >
                    Liên hệ
                  </Button>
                </Stack>
              </motion.div>
            )}
          </Box>{" "}
          {/* Right Column - Illustration */}
          <Box
            sx={{
              width: { xs: "100%", md: "60%" },
              order: { xs: 1, md: 2 },
              position: "relative",
              textAlign: "center",
              alignSelf: "flex-end",
              mb: { xs: 0, md: "-8px" }, // Negative margin to create touch-bottom effect
            }}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Box
                sx={{
                  width: "100%",
                  maxWidth: "650px",
                  height: "400px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: "auto",
                  marginRight: "auto",
                  background:
                    "linear-gradient(135deg, #e5f9f4 0%, #e5f0f1 100%)",
                  borderRadius: "20px",
                  border: "2px solid #70c8d2",
                  fontSize: "8rem",
                  color: "#70c8d2",
                  boxShadow: "0 10px 30px rgba(112, 200, 210, 0.2)",
                }}
              >
                💚
              </Box>
            </motion.div>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
