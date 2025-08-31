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
        background: "#ffffff",
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

      {/* Floating Icons */}
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
                  fontSize: { xs: "3rem", sm: "4rem", md: "5rem" },
                  lineHeight: 1.1,
                  mb: 2,
                }}
              >
                <Box 
                  component="span" 
                  sx={{ 
                    color: "#1f2937",
                    display: "block",
                    fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem" },
                  }}
                >
                  Meet
                </Box>
                <Box 
                  component="span" 
                  sx={{ 
                    color: "#22c55e",
                    fontWeight: 800,
                    fontSize: { xs: "3.5rem", sm: "4.5rem", md: "6rem" },
                  }}
                >
                  Ottobit
                </Box>
              </Typography>
              
              <Typography
                variant="h2"
                sx={{
                  color: "#374151",
                  fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.6rem" },
                  fontWeight: 500,
                  lineHeight: 1.4,
                  mb: 4,
                  maxWidth: "500px",
                }}
              >
                your unique STEAM learning companion
                <br />
                and complete robotics solution
              </Typography>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              {/* Feature Icons Section */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  maxWidth: "400px",
                  mb: 4,
                  gap: 3,
                }}
              >
                {/* Build */}
                <Box sx={{ textAlign: "center", color: "#374151" }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      backgroundColor: "rgba(34, 197, 94, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 1,
                      mx: "auto",
                    }}
                  >
                    <Engineering sx={{ fontSize: 28, color: "#22c55e" }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: "#22c55e" }}>
                    Build
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#374151", opacity: 0.8 }}>
                    Easy and simple<br />to program
                  </Typography>
                </Box>

                {/* Learn */}
                <Box sx={{ textAlign: "center", color: "#374151" }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      backgroundColor: "rgba(34, 197, 94, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 1,
                      mx: "auto",
                    }}
                  >
                    <Science sx={{ fontSize: 28, color: "#22c55e" }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: "#22c55e" }}>
                    Learn
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#374151", opacity: 0.8 }}>
                    Creativity and<br />problem solving
                  </Typography>
                </Box>

                {/* Expandable */}
                <Box sx={{ textAlign: "center", color: "#374151" }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      backgroundColor: "rgba(34, 197, 94, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 1,
                      mx: "auto",
                    }}
                  >
                    <School sx={{ fontSize: 28, color: "#22c55e" }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: "#22c55e" }}>
                    Expandable
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#374151", opacity: 0.8 }}>
                    Let your imagination<br />flow!
                  </Typography>
                </Box>
              </Box>
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
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: "#16a34a",
                      },
                    }}
                  >
                    🛒 Get yours here!
                  </Button>
                  <Button
                    variant="contained"
                    href="#features"
                    sx={{
                      bgcolor: "#f59e0b",
                      color: "#fff",
                      px: 4,
                      py: 1.3,
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: "#d97706",
                      },
                    }}
                  >
                    ⚙️ Specifications
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
