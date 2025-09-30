import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import dayjs from "dayjs";
import { StudentResult } from "common/@types/student";

interface Props {
  student: StudentResult;
  onEdit: () => void;
}

export default function ProfileHeaderCard({ student, onEdit }: Props) {
  const getAge = (dateOfBirth: string) =>
    dayjs().diff(dayjs(dateOfBirth), "year");

  return (
    <Card
      sx={{
        borderRadius: { xs: 3, md: 4 },
        mb: 3,
        bgcolor: "white",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* Top accent bar */}
      <Box
        sx={{
          height: 6,
          background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
        }}
      />
      
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 3,
          }}
        >
          {/* Left side - Avatar and Info */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3, flex: 1 }}>
            <Avatar
              sx={{
                width: { xs: 80, md: 100 },
                height: { xs: 80, md: 100 },
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontWeight: "bold",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
              }}
            >
              {student.fullname.charAt(0).toUpperCase()}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  color: "text.primary",
                  mb: 1,
                  fontSize: { xs: "1.5rem", md: "2rem" },
                }}
              >
                {student.fullname}
              </Typography>
              
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    ID:
                  </Typography>
                  <Chip 
                    label={student.id.slice(-8)} 
                    size="small"
                    sx={{ 
                      bgcolor: "primary.50",
                      color: "primary.main",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                    }}
                  />
                </Box>
                
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Tuổi:
                  </Typography>
                  <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
                    {getAge(student.dateOfBirth)}
                  </Typography>
                </Box>
                
                <Chip
                  label="Đang hoạt động"
                  size="small"
                  sx={{
                    bgcolor: "success.50",
                    color: "success.main",
                    fontWeight: 600,
                    border: "1px solid",
                    borderColor: "success.200",
                  }}
                />
              </Box>
              
              {/* Contact info */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {student.phoneNumber && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        bgcolor: "primary.50",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography sx={{ fontSize: "1.1rem" }}>📞</Typography>
                    </Box>
                    <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                      {student.phoneNumber}
                    </Typography>
                  </Box>
                )}
                
                {(student.city || student.state) && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        bgcolor: "error.50",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography sx={{ fontSize: "1.1rem" }}>📍</Typography>
                    </Box>
                    <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                      {[student.city, student.state].filter(Boolean).join(", ")}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
          
          {/* Right side - Edit button */}
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={onEdit}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
              textTransform: "none",
              minWidth: { xs: "100%", sm: "auto" },
              "&:hover": {
                background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                boxShadow: "0 6px 16px rgba(102, 126, 234, 0.4)",
              },
            }}
          >
            Chỉnh sửa hồ sơ
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
