import React from "react";
import { Box } from "@mui/material";
import RegisterForm from "sections/auth/RegisterForm";
import { LanguageSwitcher } from "components/common";

const SignUp: React.FC = () => {
  return (
    <Box sx={{ position: "relative" }}>
      {/* Language Switcher - Top right */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: 16, md: 32 },
          right: { xs: 16, md: 32 },
          zIndex: 999,
        }}
      >
        <LanguageSwitcher />
      </Box>
      <RegisterForm />
    </Box>
  );
};

export default SignUp;
