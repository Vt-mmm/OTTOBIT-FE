import { Box, Paper, Typography } from "@mui/material";

export default function SimpleIsometricTest() {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        🎯 Simple Isometric Test
      </Typography>

      <Box
        sx={{
          position: "relative",
          width: "400px",
          height: "300px",
          border: "2px solid #ddd",
          borderRadius: 1,
          overflow: "hidden",
          bgcolor: "#f9f9f9",
          mx: "auto",
        }}
      >
        {/* Simple isometric diamond */}
        <svg
          width="400"
          height="300"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {/* 3D Box faces */}
          <g>
            {/* Left face */}
            <polygon
              points="100,50 150,100 150,120 100,70"
              fill="#4CAF50"
              stroke="#333"
              strokeWidth="1"
            />
            {/* Right face */}
            <polygon
              points="150,100 200,50 200,70 150,120"
              fill="#2E7D32"
              stroke="#333"
              strokeWidth="1"
            />
          </g>

          {/* Top face - Diamond shape */}
          <polygon
            points="150,30 200,50 150,100 100,50"
            fill="#66BB6A"
            stroke="#333"
            strokeWidth="2"
          />

          {/* Grid lines */}
          <polygon
            points="150,30 200,50 150,100 100,50"
            fill="none"
            stroke="#666"
            strokeWidth="1"
            opacity="0.7"
          />

          {/* Text */}
          <text
            x="150"
            y="65"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="14"
            fill="#000"
            fontWeight="bold"
          >
            2.5D Test
          </text>
        </svg>
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 2, textAlign: "center" }}
      >
        Nếu bạn thấy hình kim cương 3D ở trên, thì 2.5D isometric đang hoạt
        động!
      </Typography>
    </Paper>
  );
}
