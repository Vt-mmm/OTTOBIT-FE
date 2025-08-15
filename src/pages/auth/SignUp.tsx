import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { motion } from "framer-motion";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
// Logo placeholder sẽ thay thế sau
import RegisterForm from "sections/auth/RegisterForm";

const SignUp: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#F6FEFC",
        p: { xs: 2, sm: 3 },
      }}
    >
      <Paper
        component={motion.div}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 500,
          borderRadius: 3,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            width: "100%",
            p: { xs: 3, sm: 3.5, md: 4 },
            background:
              "linear-gradient(180deg, rgba(238, 255, 251, 0.7) 0%, rgba(244, 254, 252, 0.7) 100%)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1,
                mr: 1,
                background:
                  "linear-gradient(180deg, rgba(238, 255, 251, 0.55) 0%, #FDD9FF 54.17%, #C1E7FF 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "#70c8d2",
              }}
            >
              O
            </Box>
            <Typography
              variant="h5"
              fontWeight={400}
              letterSpacing="-0.02em"
              fontSize={26}
              lineHeight="1.4em"
              color="#000000"
            >
              Ottobit
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              fontWeight={500}
              fontSize={20}
              lineHeight="1.5em"
              sx={{
                letterSpacing: "0.01em",
                mb: 2,
                display: "flex",
                alignItems: "center",
              }}
            >
              SIGN UP{" "}
              <LockOutlinedIcon
                fontSize="small"
                sx={{ ml: 0.5, fontSize: "0.9rem" }}
              />
            </Typography>
          </Box>

          {/* Render the RegisterForm component */}
          <RegisterForm />
        </Box>
      </Paper>
    </Box>
  );
};

export default SignUp;
