import {
  Box,
  Card,
  CardContent,
  Typography,
  Skeleton,
  LinearProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import EmojiEventsIcon from "@mui/icons-material/EmojiEventsOutlined";

interface StarBucket {
  star: number;
  count: number;
}

interface AchievementsTabProps {
  submissions?: any[]; // Optional for future use
  challengeBestStars: Map<string, number>;
  starBuckets: StarBucket[];
  loading?: boolean;
}

export default function AchievementsTab({
  challengeBestStars,
  starBuckets,
  loading,
}: AchievementsTabProps) {
  const totalChallenges = challengeBestStars.size;
  const totalStars = Array.from(challengeBestStars.values()).reduce(
    (sum, star) => sum + star,
    0
  );
  const maxPossibleStars = totalChallenges * 5;
  const starPercentage =
    maxPossibleStars > 0
      ? Math.round((totalStars / maxPossibleStars) * 100)
      : 0;

  const badges = [
    {
      title: "🥇 Người mới",
      desc: "Hoàn thành bài đầu tiên",
      unlocked: totalChallenges >= 1,
    },
    {
      title: "🚀 Khám phá",
      desc: "Hoàn thành 5 bài thách thức",
      unlocked: totalChallenges >= 5,
    },
    {
      title: "⭐ Sao sáng",
      desc: "Đạt 10 sao vàng",
      unlocked: totalStars >= 10,
    },
    {
      title: "🏆 Chuyên gia",
      desc: "Hoàn thành 20 bài thách thức",
      unlocked: totalChallenges >= 20,
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 3 }} />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
            border: "1px solid",
            borderColor: "divider",
            background: "linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)",
            color: "white",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <EmojiEventsIcon />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Tổng quan thành tích
              </Typography>
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                gap: 3,
              }}
            >
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {totalChallenges}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Thách thức hoàn thành
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {totalStars} ⭐
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Tổng số sao
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {starPercentage}%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Tỷ lệ hoàn hảo
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 3 }}>
              <LinearProgress
                variant="determinate"
                value={starPercentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "rgba(255, 255, 255, 0.3)",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: "white",
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Star Distribution */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            ⭐ Phân bố sao
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {starBuckets.map((bucket) => {
              const maxCount = Math.max(...starBuckets.map((b) => b.count), 1);
              const percentage = (bucket.count / maxCount) * 100;
              return (
                <Box key={bucket.star}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                      alignItems: "center",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {bucket.star} Sao
                      </Typography>
                      <Box sx={{ display: "flex" }}>
                        {[...Array(bucket.star)].map((_, i) => (
                          <Box key={i} sx={{ fontSize: 16, color: "#ffc107" }}>
                            ⭐
                          </Box>
                        ))}
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: "primary.main" }}
                    >
                      {bucket.count} bài
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                      height: 12,
                      borderRadius: 6,
                      bgcolor: "grey.200",
                      "& .MuiLinearProgress-bar": {
                        bgcolor:
                          ["#4caf50", "#2196f3", "#ffc107"][bucket.star - 1] ||
                          "#9e9e9e",
                        borderRadius: 6,
                      },
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            🏅 Huy hiệu
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 3,
            }}
          >
            {badges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: badge.unlocked ? "success.50" : "grey.100",
                    border: "2px solid",
                    borderColor: badge.unlocked ? "success.main" : "grey.300",
                    transition: "all 0.3s ease",
                    opacity: badge.unlocked ? 1 : 0.6,
                    "&:hover": {
                      transform: badge.unlocked ? "scale(1.05)" : "none",
                    },
                  }}
                >
                  <Typography variant="h5" sx={{ mb: 1, fontSize: "2rem" }}>
                    {badge.title.split(" ")[0]}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, mb: 0.5 }}
                  >
                    {badge.title.split(" ").slice(1).join(" ")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {badge.desc}
                  </Typography>
                  {badge.unlocked && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "success.main",
                        fontWeight: 600,
                        mt: 1,
                        display: "block",
                      }}
                    >
                      ✓ Đã mở khóa
                    </Typography>
                  )}
                </Box>
              </motion.div>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
