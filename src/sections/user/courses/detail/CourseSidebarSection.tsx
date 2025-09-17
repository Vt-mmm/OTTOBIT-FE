import {
  Box,
  Typography,
  Chip,
} from "@mui/material";
import {
  School as SchoolIcon,
  AccessTime as AccessTimeIcon,
  WorkspacePremium as CertificateIcon,
} from "@mui/icons-material";

interface CourseSidebarSectionProps {
  course: {
    id: string;
    title: string;
    imageUrl?: string;
  };
  lessons: any[];
}

export default function CourseSidebarSection({
  course,
  lessons,
}: CourseSidebarSectionProps) {
  return (
    <Box sx={{ position: "sticky", top: 100 }}>
      {/* Course Preview Card */}
      <Box sx={{ bgcolor: "white", border: "1px solid #e0e0e0", borderRadius: 1, mb: 3 }}>
        <Box sx={{ position: "relative", height: 200 }}>
          <Box
            component="img"
            src={course.imageUrl || "/asset/OttobitCar.png"}
            alt={course.title}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/asset/BlockLy.png";
            }}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              p: 2,
              bgcolor: "#f8f9fa"
            }}
          />
          
          {/* Free badge */}
          <Chip
            label="Miễn phí"
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              bgcolor: "#4caf50",
              color: "white",
              fontWeight: 600,
              fontSize: "0.75rem"
            }}
          />
        </Box>
        
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Nội dung khóa học
          </Typography>
          
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SchoolIcon fontSize="small" sx={{ color: "#1976d2" }} />
              <Typography variant="body2">
                {lessons.length} bài học
              </Typography>
            </Box>
            
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTimeIcon fontSize="small" sx={{ color: "#1976d2" }} />
              <Typography variant="body2">
                Khoảng 4-6 giờ
              </Typography>
            </Box>
            
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CertificateIcon fontSize="small" sx={{ color: "#1976d2" }} />
              <Typography variant="body2">
                Chứng chỉ hoàn thành
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Skills Card */}
      <Box sx={{ bgcolor: "white", border: "1px solid #e0e0e0", borderRadius: 1 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Kỹ năng bạn sẽ học được
          </Typography>
          
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {["Lập trình Blockly", "Điều khiển Robot", "Tư duy logic", "Giải quyết vấn đề", "STEM"].map((skill) => (
              <Chip
                key={skill}
                label={skill}
                variant="outlined"
                size="small"
                sx={{
                  borderColor: "#1976d2",
                  color: "#1976d2",
                  fontSize: "0.75rem"
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}