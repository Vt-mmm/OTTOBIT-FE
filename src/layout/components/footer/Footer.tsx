import React from "react";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Stack,
  Divider,
  Link,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import { useNavigate } from "react-router-dom";
import { PATH_PUBLIC, PATH_AUTH, PATH_USER } from "routes/paths";
import useLocales from "hooks/useLocales";

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { translate } = useLocales();

  const handleNavigation = (path: string, external = false) => {
    if (external) {
      window.open(path, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(path);
  };

  // Link style for consistent hover effect
  const linkStyle = {
    color: "text.secondary",
    textDecoration: "none",
    cursor: "pointer",
    "&:hover": {
      color: "primary.main",
      textDecoration: "underline",
    },
  };

  return (
    <Box
      sx={{
        py: 4,
        backgroundColor: "grey.100",
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        {/* Main Footer Content */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "2fr 1fr 1fr 1fr",
            },
            gap: 4,
          }}
        >
          {/* Company Info */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {translate("common.footer.companyName")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {translate("common.footer.companyDescription")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {translate("common.footer.email")}
            </Typography>
          </Box>

          {/* Navigation Links */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {translate("common.footer.links")}
            </Typography>
            <Stack spacing={1}>
              <Link
                variant="body2"
                onClick={() => handleNavigation(PATH_PUBLIC.homepage)}
                sx={linkStyle}
              >
                {translate("common.footer.homepage")}
              </Link>
              <Link
                variant="body2"
                onClick={() => handleNavigation(PATH_AUTH.login)}
                sx={linkStyle}
              >
                {translate("common.footer.login")}
              </Link>
              <Link
                variant="body2"
                onClick={() => handleNavigation(PATH_AUTH.register)}
                sx={linkStyle}
              >
                {translate("common.footer.register")}
              </Link>
              <Link
                variant="body2"
                onClick={() => handleNavigation(PATH_PUBLIC.store)}
                sx={linkStyle}
              >
                {translate("common.footer.store")}
              </Link>
            </Stack>
          </Box>

          {/* Features Links */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {translate("common.footer.features")}
            </Typography>
            <Stack spacing={1}>
              <Link
                variant="body2"
                onClick={() => handleNavigation(PATH_USER.courses)}
                sx={linkStyle}
              >
                {translate("common.footer.courses")}
              </Link>
              <Link
                variant="body2"
                onClick={() => handleNavigation(PATH_USER.lessons)}
                sx={linkStyle}
              >
                {translate("common.footer.lessons")}
              </Link>
              <Link
                variant="body2"
                onClick={() => handleNavigation(PATH_USER.studio)}
                sx={linkStyle}
              >
                {translate("common.footer.studio")}
              </Link>
              <Link
                variant="body2"
                onClick={() => handleNavigation(PATH_USER.challenges)}
                sx={linkStyle}
              >
                {translate("common.footer.challenges")}
              </Link>
            </Stack>
          </Box>

          {/* Social Media */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {translate("common.footer.connectWithUs")}
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton
                aria-label="Facebook"
                component="a"
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{
                  color: "text.secondary",
                  "&:hover": {
                    color: "#1877f2",
                  },
                }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                aria-label="Instagram"
                component="a"
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{
                  color: "text.secondary",
                  "&:hover": {
                    color: "#c32aa3",
                  },
                }}
              >
                <InstagramIcon />
              </IconButton>
            </Stack>
          </Box>
        </Box>

        {/* Divider */}
        <Divider sx={{ my: 3 }} />

        {/* Copyright */}
        <Typography variant="body2" color="text.secondary" align="center">
          {translate("common.footer.copyright")}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
