import React from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import EmailConfirmationSection from "sections/auth/EmailConfirmationSection";
import { PATH_AUTH } from "routes/paths";

const EmailConfirmationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  const token = searchParams.get("token");

  // Redirect if missing required parameters
  if (!userId || !token) {
    return <Navigate to={PATH_AUTH.login} replace />;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 0,
        m: 0,
      }}
    >
      <EmailConfirmationSection userId={userId} token={token} />
    </Box>
  );
};

export default EmailConfirmationPage;
