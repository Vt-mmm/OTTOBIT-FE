import React from "react";
import { Box, Container, Paper, Typography } from "@mui/material";
import { motion } from "framer-motion";
import ResendEmailForm from "sections/auth/ResendEmailForm";

const ResendEmailConfirmationPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Paper
            elevation={24}
            sx={{
              p: 4,
              borderRadius: 3,
              backgroundColor: "#ffffff",
              backdropFilter: "blur(10px)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            }}
          >
            <ResendEmailForm />
          </Paper>
        </Box>

        {/* Footer */}
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          sx={{
            textAlign: "center",
            mt: 3,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.8)",
              fontWeight: 400,
            }}
          >
            © 2024 Ottobit. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default ResendEmailConfirmationPage;
