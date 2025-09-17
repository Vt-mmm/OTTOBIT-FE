import {
  Box,
  Typography,
  Button,
  Rating,
} from "@mui/material";
import {
  Lock as LockIcon,
} from "@mui/icons-material";

interface CourseCertificatesSectionProps {
  course: {
    id: string;
    title: string;
  };
  lessons: any[];
  isUserEnrolled: boolean;
  isEnrolling: boolean;
  onEnrollCourse: () => void;
  courseRating: number;
  totalRatings: number;
}

export default function CourseCertificatesSection({
  course,
  lessons,
  isUserEnrolled,
  isEnrolling,
  onEnrollCourse,
  courseRating,
  totalRatings,
}: CourseCertificatesSectionProps) {
  return (
    <Box sx={{ bgcolor: "white", p: 3, border: "1px solid #e0e0e0", borderRadius: 1 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Chứng chỉ và Kỹ năng nhận được
      </Typography>
      
      {/* Certificate List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Course Completion Certificate */}
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            p: 3, 
            border: "1px solid #e0e0e0", 
            borderRadius: 1,
            bgcolor: "white",
            position: "relative",
            opacity: !isUserEnrolled ? 0.7 : 1
          }}
        >
          <Box sx={{ mr: 3, flexShrink: 0 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                bgcolor: "#f0f7ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #4caf50"
              }}
            >
              <Box
                component="img"
                src="/asset/LogoOttobit.png"
                alt="Certificate"
                sx={{
                  width: 36,
                  height: 36,
                  objectFit: "contain"
                }}
              />
            </Box>
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "#333" }}>
              Chứng chỉ hoàn thành - {course.title}
            </Typography>
            
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Khóa học 1
              </Typography>
              <Typography variant="body2" color="text.secondary">
                •
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.ceil((lessons.length * 45) / 60)} giờ
              </Typography>
              <Typography variant="body2" color="text.secondary">
                •
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Rating value={courseRating} readOnly size="small" precision={0.1} />
                <Typography variant="body2" color="text.secondary">
                  {courseRating} ({totalRatings} đánh giá)
                </Typography>
              </Box>
            </Box>
            
            <Button 
              variant="text" 
              size="small" 
              sx={{ 
                color: "#1976d2", 
                textTransform: "none", 
                p: 0, 
                minWidth: "auto",
                "&:hover": { bgcolor: "transparent", textDecoration: "underline" }
              }}
            >
              Xem chứng chỉ
            </Button>
          </Box>
          
          <Box sx={{ ml: 2 }}>
            <Button 
              variant="outlined"
              size="small"
              onClick={() => !isUserEnrolled && onEnrollCourse()}
              disabled={isUserEnrolled || isEnrolling}
              sx={{
                textTransform: "none",
                minWidth: 100
              }}
            >
              {isUserEnrolled ? "Hoàn thành" : "Bắt đầu"}
            </Button>
          </Box>
          
          {!isUserEnrolled && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: "rgba(255, 255, 255, 0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <LockIcon sx={{ fontSize: 24, color: "text.secondary", mb: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Tham gia để mở khóa
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
        
        {/* Skills Specialization Certificate */}
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            p: 3, 
            border: "1px solid #e0e0e0", 
            borderRadius: 1,
            bgcolor: "white",
            position: "relative",
            opacity: !isUserEnrolled ? 0.7 : 1
          }}
        >
          <Box sx={{ mr: 3, flexShrink: 0 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                bgcolor: "#f0f7ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #2196f3"
              }}
            >
              <Box
                component="img"
                src="/OttoDIY/code-photo-2.png"
                alt="Specialization"
                sx={{
                  width: 36,
                  height: 36,
                  objectFit: "contain"
                }}
              />
            </Box>
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "#333" }}>
              Chuyên môn Lập trình Robot và STEM
            </Typography>
            
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Chuyên môn 1
              </Typography>
              <Typography variant="body2" color="text.secondary">
                •
              </Typography>
              <Typography variant="body2" color="text.secondary">
                6-8 giờ
              </Typography>
              <Typography variant="body2" color="text.secondary">
                •
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Rating value={4.5} readOnly size="small" precision={0.1} />
                <Typography variant="body2" color="text.secondary">
                  4.5 (890 đánh giá)
                </Typography>
              </Box>
            </Box>
            
            <Button 
              variant="text" 
              size="small" 
              sx={{ 
                color: "#1976d2", 
                textTransform: "none", 
                p: 0, 
                minWidth: "auto",
                "&:hover": { bgcolor: "transparent", textDecoration: "underline" }
              }}
            >
              Xem chuyên môn
            </Button>
          </Box>
          
          <Box sx={{ ml: 2 }}>
            <Button 
              variant="outlined"
              size="small"
              disabled={!isUserEnrolled}
              sx={{
                textTransform: "none",
                minWidth: 100
              }}
            >
              {isUserEnrolled ? "Tiếp tục" : "Khóa"}
            </Button>
          </Box>
          
          {!isUserEnrolled && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: "rgba(255, 255, 255, 0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <LockIcon sx={{ fontSize: 24, color: "text.secondary", mb: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Hoàn thành khóa học trước
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
        
        {/* Professional Certificate */}
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            p: 3, 
            border: "1px solid #e0e0e0", 
            borderRadius: 1,
            bgcolor: "white",
            position: "relative",
            opacity: 0.7
          }}
        >
          <Box sx={{ mr: 3, flexShrink: 0 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                bgcolor: "#fff3e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #ff9800"
              }}
            >
              <Box
                component="img"
                src="/OttoDIY/create-photo-2.png"
                alt="Professional Certificate"
                sx={{
                  width: 36,
                  height: 36,
                  objectFit: "contain"
                }}
              />
            </Box>
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "#333" }}>
              Chứng chỉ Chuyên gia Robot và IoT
            </Typography>
            
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Chứng chỉ chuyên nghiệp
              </Typography>
              <Typography variant="body2" color="text.secondary">
                •
              </Typography>
              <Typography variant="body2" color="text.secondary">
                15-20 giờ
              </Typography>
              <Typography variant="body2" color="text.secondary">
                •
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Rating value={4.8} readOnly size="small" precision={0.1} />
                <Typography variant="body2" color="text.secondary">
                  4.8 (1.2k đánh giá)
                </Typography>
              </Box>
            </Box>
            
            <Button 
              variant="text" 
              size="small" 
              sx={{ 
                color: "#1976d2", 
                textTransform: "none", 
                p: 0, 
                minWidth: "auto",
                "&:hover": { bgcolor: "transparent", textDecoration: "underline" }
              }}
            >
              Xem chứng chỉ
            </Button>
          </Box>
          
          <Box sx={{ ml: 2 }}>
            <Button 
              variant="outlined"
              size="small"
              disabled
              sx={{
                textTransform: "none",
                minWidth: 100
              }}
            >
              Khóa
            </Button>
          </Box>
          
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: "rgba(255, 255, 255, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 1
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <LockIcon sx={{ fontSize: 24, color: "text.secondary", mb: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Cần hoàn thành chuyên môn
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}