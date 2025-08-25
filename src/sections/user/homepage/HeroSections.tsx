import { Box, Container, Typography, Button, Stack } from "@mui/material";
import { motion } from "framer-motion";
import { DroneModel3D } from "components/3d";
import { useAppSelector } from "store/config";
import { Science, School, Engineering } from "@mui/icons-material";

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
          "linear-gradient(135deg, #f0fdf4 0%, rgba(34, 197, 94, 0.15) 30%, #ecfdf5 70%, rgba(22, 163, 74, 0.1) 100%)",
        position: "relative",
        minHeight: { xs: "550px", md: "650px" },
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Decorative Elements - STEM themed */}
      <Box
        component={motion.div}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.4 }}
        transition={{ duration: 1.5, delay: 0.2 }}
        sx={{
          position: "absolute",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 50%, rgba(34, 197, 94, 0) 70%)",
          top: "-150px",
          right: "-80px",
          zIndex: 0,
          filter: "blur(50px)",
        }}
      />
      <Box
        component={motion.div}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        transition={{ duration: 1.5, delay: 0.4 }}
        sx={{
          position: "absolute",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(22, 163, 74, 0.2) 0%, rgba(22, 163, 74, 0.1) 50%, rgba(22, 163, 74, 0) 70%)",
          bottom: "30px",
          left: "-80px",
          zIndex: 0,
          filter: "blur(40px)",
        }}
      />

      {/* Floating STEM Icons */}
      <Box
        component={motion.div}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: [0, -10, 0], opacity: 0.6 }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        sx={{
          position: "absolute",
          top: "20%",
          left: "10%",
          color: "#22c55e",
          zIndex: 1,
        }}
      >
        <Science sx={{ fontSize: 40 }} />
      </Box>
      <Box
        component={motion.div}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: [0, -15, 0], opacity: 0.6 }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        sx={{
          position: "absolute",
          top: "30%",
          right: "15%",
          color: "#16a34a",
          zIndex: 1,
        }}
      >
        <Engineering sx={{ fontSize: 35 }} />
      </Box>
      <Box
        component={motion.div}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: [0, -12, 0], opacity: 0.6 }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        sx={{
          position: "absolute",
          bottom: "35%",
          left: "5%",
          color: "#15803d",
          zIndex: 1,
        }}
      >
        <School sx={{ fontSize: 38 }} />
      </Box>
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
              width: { xs: "100%", md: "35%" },
              order: { xs: 2, md: 1 },
              zIndex: 2,
              pr: { md: 2 },
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
                <Box component="span" sx={{ color: "#22c55e" }}>
                  OttoBit
                </Box>
                <br />
                STEM Education Platform
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
                Khám phá thế giới STEM với OttoBit - nền tảng giáo dục tương tác
                kết hợp Robotics, AI và lập trình trực quan. Trải nghiệm học tập
                thông qua mô hình 3D và các dự án thực tế hấp dẫn.
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
                      bgcolor: "#22c55e",
                      color: "#fff",
                      px: 4,
                      py: 1.3,
                      borderRadius: 1,
                      fontWeight: 600,
                      "&:hover": {
                        bgcolor: "#16a34a",
                      },
                    }}
                  >
                    Bắt đầu học
                  </Button>
                  <Button
                    variant="outlined"
                    href="#features"
                    sx={{
                      color: "#22c55e",
                      borderColor: "#22c55e",
                      px: 3,
                      py: 1.2,
                      borderRadius: 1,
                      "&:hover": {
                        borderColor: "#16a34a",
                        bgcolor: "rgba(34, 197, 94, 0.04)",
                      },
                    }}
                  >
                    Khám phá tính năng
                  </Button>
                </Stack>
              </motion.div>
            )}
          </Box>{" "}
          {/* Right Column - 3D Drone with Special Background */}
          <Box
            sx={{
              width: { xs: "100%", md: "65%" },
              order: { xs: 1, md: 2 },
              position: "relative",
              textAlign: "center",
              alignSelf: "flex-end",
              mb: { xs: 0, md: "-8px" },
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
                  maxWidth: "800px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  "& canvas": {
                    border: "none !important",
                    outline: "none !important",
                    boxShadow: "none !important",
                    background: "transparent !important",
                  },
                  "& > div": {
                    border: "none !important",
                    outline: "none !important",
                    background: "transparent !important",
                  },
                  "& model-viewer": {
                    border: "none !important",
                    outline: "none !important",
                    boxShadow: "none !important",
                    background: "transparent !important",
                    "--poster-color": "transparent !important",
                  },
                  "& *": {
                    border: "none !important",
                    outline: "none !important",
                    boxShadow: "none !important",
                  },
                }}
              >
                <DroneModel3D
                  width="100%"
                  height="500px"
                  autoRotate={true}
                  cameraControls={true}
                />
              </Box>
            </motion.div>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
