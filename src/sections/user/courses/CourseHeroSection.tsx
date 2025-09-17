import { Box, Container, Typography, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface CourseHeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function CourseHeroSection({ searchQuery, onSearchChange }: CourseHeroSectionProps) {
  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #ffffff 0%, #f8fffe 50%, #e8f5e8 100%)",
        position: "relative",
        overflow: "hidden",
        borderBottom: "1px solid rgba(76, 175, 80, 0.1)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "url('data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234caf50' fill-opacity='0.03'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, pt: { xs: 10, md: 12 }, pb: { xs: 4, md: 6 } }}>
        {/* Main Hero Content */}
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: "2rem", md: "2.5rem" },
              background: "linear-gradient(135deg, #2e7d32 0%, #4caf50 50%, #66bb6a 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
            }}
          >
            Ottobit Courses
          </Typography>
          
          {/* Decorative underline */}
          <Box
            sx={{
              width: 60,
              height: 3,
              background: "linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)",
              borderRadius: 2,
              mx: "auto",
              mb: 2,
            }}
          />
          
          <Typography
            variant="h6"
            sx={{
              color: "text.secondary",
              maxWidth: "500px",
              mx: "auto",
              fontSize: { xs: "0.95rem", md: "1.1rem" },
              fontWeight: 400,
              lineHeight: 1.5,
              mb: 4,
            }}
          >
            Khám phá các khóa học lập trình thú vị với robot Ottobit
          </Typography>

          {/* Search Bar */}
          <Box sx={{ maxWidth: "600px", mx: "auto" }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm khóa học..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#666" }} />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: "white",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0, 0, 0, 0.12)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(76, 175, 80, 0.5)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#4caf50",
                  },
                },
              }}
              sx={{
                "& .MuiOutlinedInput-input": {
                  py: 2,
                },
              }}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
