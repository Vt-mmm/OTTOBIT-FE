import { Card, Box, Typography, Chip, Rating } from "@mui/material";
import dayjs from "dayjs";

interface ChallengeProcessItem {
  id?: string;
  bestStar?: number;
  updatedAt?: string;
  createdAt?: string;
  completedAt?: string | null;
  challenge?: { title?: string };
}

interface StarBucket { star: number; count: number }

interface Props {
  items: ChallengeProcessItem[];
  starBuckets: StarBucket[];
}

export default function RecentChallengesCard({ items, starBuckets }: Props) {
  return (
    <Card sx={{ borderRadius: { xs: 2.5, md: 3.5 }, p: { xs: 2.5, md: 3 }, boxShadow: "0 6px 25px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.04)", bgcolor: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)", mt: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>⭐ Thử thách gần đây</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 16 }}>
        <Box>
          {items.slice(0,3).map((cp, idx) => (
            <Box key={cp.id || idx} sx={{ display: 'flex', alignItems: 'center', p: 2, mb: 1.5, bgcolor: '#f8f9fa', borderRadius: 2 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '50%', mr: 2, bgcolor: 'rgba(33,150,243,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight: 700, color: '#1976d2' }}>{cp.bestStar || 0}</Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{cp.challenge?.title || 'Thử thách'}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating size="small" value={Math.min(3, cp.bestStar || 0)} readOnly max={3} />
                  <Chip label={cp.completedAt ? 'Đã hoàn thành' : 'Đang luyện tập'} size="small" color={cp.completedAt ? 'success' : 'warning'} />
                </Box>
                <Typography variant="caption" color="text.secondary">Cập nhật: {dayjs(cp.updatedAt || cp.createdAt).format('DD/MM/YYYY')}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Phân bố sao</Typography>
          {starBuckets.map((b) => (
          <Box key={b.star} sx={{ display:'flex', alignItems:'center', mb: 1 }}>
          <Box sx={{ width: 48, mr: 1, textAlign:'right', fontWeight: 600 }}>{b.star}⭐</Box>
          <Box sx={{ flex:1, bgcolor:'#eef2f7', height: 8, borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{ width: `${Math.min(100, b.count / Math.max(1, items.length) * 100)}%`, height: '100%', bgcolor: b.star===3 ? '#43a047' : b.star===2 ? '#ffb300' : '#29b6f6' }} />
          </Box>
          <Box sx={{ width: 40, ml: 1, textAlign:'left', color: 'text.secondary' }}>{b.count}</Box>
          </Box>
          ))}
        </Box>
      </Box>
    </Card>
  );
}
