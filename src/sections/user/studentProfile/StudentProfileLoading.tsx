import { Box, Card, Skeleton, Stack } from "@mui/material";

export default function StudentProfileLoading() {
  return (
    <Box>
      {/* Header Card Skeleton */}
      <Card
        sx={{
          borderRadius: { xs: 3, md: 4 },
          mb: 3,
          bgcolor: "white",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Top accent bar */}
        <Skeleton variant="rectangular" height={6} sx={{ bgcolor: "primary.100" }} />
        
        <Box sx={{ p: { xs: 3, md: 4 } }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3 }}>
            {/* Avatar skeleton */}
            <Skeleton variant="circular" width={100} height={100} />
            
            {/* Info skeleton */}
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" height={40} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Skeleton variant="rounded" width={80} height={24} />
                <Skeleton variant="rounded" width={60} height={24} />
                <Skeleton variant="rounded" width={100} height={24} />
              </Stack>
              <Skeleton variant="text" width="30%" height={20} />
              <Skeleton variant="text" width="40%" height={20} />
            </Box>
            
            {/* Button skeleton */}
            <Skeleton variant="rounded" width={140} height={48} />
          </Box>
        </Box>
      </Card>

      {/* Stats Cards Skeleton */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
          gap: 3,
          mb: 3,
        }}
      >
        {[1, 2, 3].map((i) => (
          <Card key={i} sx={{ p: 3, textAlign: "center" }}>
            <Skeleton variant="circular" width={56} height={56} sx={{ mx: "auto", mb: 2 }} />
            <Skeleton variant="text" width="60%" height={36} sx={{ mx: "auto", mb: 1 }} />
            <Skeleton variant="text" width="80%" height={20} sx={{ mx: "auto" }} />
          </Card>
        ))}
      </Box>

      {/* Progress Card Skeleton */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
        <Stack spacing={2}>
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
        </Stack>
      </Card>
    </Box>
  );
}
