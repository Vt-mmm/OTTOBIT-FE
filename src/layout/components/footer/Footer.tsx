import React from "react";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Stack,
  Divider,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import { useNavigate } from "react-router-dom";
import { PATH_PUBLIC, PATH_AUTH } from "routes/paths";

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string, external = false) => {
    if (external) {
      window.open(path, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(path);
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
              md: "2fr 1fr 1fr",
            },
            gap: 4,
          }}
        >
          {/* Company Info */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Ottobit Frontend
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Platform ứng dụng hiện đại được xây dựng với React 18.3.1,
              TypeScript 5.4.x và Material UI v6.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: contact@ottobit.com
            </Typography>
          </Box>

          {/* Navigation Links */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Liên kết
            </Typography>
            <Stack spacing={1}>
              <Typography
                variant="body2"
                component="button"
                onClick={() => handleNavigation(PATH_PUBLIC.homepage)}
                sx={{
                  color: "text.secondary",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
              >
                Trang chủ
              </Typography>
              <Typography
                variant="body2"
                component="button"
                onClick={() => handleNavigation(PATH_AUTH.login)}
                sx={{
                  color: "text.secondary",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
              >
                Đăng nhập
              </Typography>
              <Typography
                variant="body2"
                component="button"
                onClick={() => handleNavigation(PATH_AUTH.register)}
                sx={{
                  color: "text.secondary",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
              >
                Đăng ký
              </Typography>
            </Stack>
          </Box>

          {/* Social Media */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Kết nối với chúng tôi
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
          © 2025 Ottobit Frontend. Tất cả quyền được bảo lưu.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
