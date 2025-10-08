/**
 * TabletDevice - Reusable tablet UI wrapper component
 * Provides realistic tablet frame with hardware details (home button, volume, camera, etc.)
 */

import React from "react";
import { Box, Typography } from "@mui/material";

interface TabletDeviceProps {
  children: React.ReactNode;
  minHeight?: { xs: string; sm: string; md: string; lg: string };
  maxHeight?: { xs: string; sm: string; md: string; lg: string };
}

const TabletDevice: React.FC<TabletDeviceProps> = ({
  children,
  minHeight = { xs: "500px", sm: "600px", md: "650px", lg: "700px" },
  maxHeight = { xs: "70vh", sm: "75vh", md: "80vh", lg: "85vh" },
}) => {
  return (
    <Box
      sx={{
        maxWidth: 1400,
        margin: "0 auto",
        background: "linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)",
        borderRadius: "28px",
        p: 2.5,
        boxShadow:
          "0 30px 80px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.3), 0 0 100px rgba(34,197,94,0.1)",
        position: "relative",
        border: "1px solid rgba(255,255,255,0.05)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow:
            "0 35px 90px rgba(0,0,0,0.45), inset 0 2px 4px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.3), 0 0 120px rgba(34,197,94,0.15)",
          transform: "translateY(-2px)",
        },
        // Top speaker grill
        "&::before": {
          content: '""',
          position: "absolute",
          top: "14px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80px",
          height: "5px",
          background:
            "linear-gradient(90deg, transparent, #444, #555, #444, transparent)",
          borderRadius: "3px",
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
        },
        // Front camera
        "&::after": {
          content: '""',
          position: "absolute",
          top: "13px",
          right: "24px",
          width: "8px",
          height: "8px",
          background: "radial-gradient(circle, #222 30%, #000 100%)",
          borderRadius: "50%",
          boxShadow:
            "0 0 3px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.1), 0 0 0 1px rgba(255,255,255,0.05)",
          border: "0.5px solid #333",
        },
      }}
    >
      {/* Ambient Glow Effect */}
      <Box
        sx={{
          position: "absolute",
          top: "-15px",
          left: "-15px",
          right: "-15px",
          bottom: "-15px",
          background:
            "linear-gradient(45deg, rgba(34,197,94,0.15) 0%, transparent 30%, rgba(34,197,94,0.08) 70%, transparent 100%)",
          borderRadius: "43px",
          zIndex: -1,
          opacity: 0,
          animation: "ambientGlow 6s ease-in-out infinite",
          "@keyframes ambientGlow": {
            "0%, 100%": {
              opacity: 0.4,
              transform: "scale(1)",
            },
            "50%": {
              opacity: 0.7,
              transform: "scale(1.02)",
            },
          },
          filter: "blur(20px)",
        }}
      />

      {/* Home Button */}
      <Box
        sx={{
          position: "absolute",
          bottom: "12px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #333 0%, #111 100%)",
          border: "2px solid #444",
          boxShadow:
            "inset 0 2px 4px rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateX(-50%) scale(0.95)",
            background: "linear-gradient(135deg, #444 0%, #222 100%)",
          },
          "&:active": {
            transform: "translateX(-50%) scale(0.90)",
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.4)",
          },
          "&::after": {
            content: '""',
            width: "24px",
            height: "24px",
            borderRadius: "4px",
            border: "2px solid #666",
            background: "transparent",
          },
        }}
      />

      {/* Volume Buttons */}
      <Box
        sx={{
          position: "absolute",
          right: "-4px",
          top: "80px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {/* Volume Up */}
        <Box
          sx={{
            width: "8px",
            height: "50px",
            background: "linear-gradient(90deg, #333 0%, #555 50%, #333 100%)",
            borderRadius: "4px 0 0 4px",
            boxShadow:
              "inset 0 1px 2px rgba(0,0,0,0.5), 1px 0 3px rgba(0,0,0,0.3)",
          }}
        />
        {/* Volume Down */}
        <Box
          sx={{
            width: "8px",
            height: "50px",
            background: "linear-gradient(90deg, #333 0%, #555 50%, #333 100%)",
            borderRadius: "4px 0 0 4px",
            boxShadow:
              "inset 0 1px 2px rgba(0,0,0,0.5), 1px 0 3px rgba(0,0,0,0.3)",
          }}
        />
      </Box>

      {/* Power Button */}
      <Box
        sx={{
          position: "absolute",
          left: "-4px",
          top: "60px",
          width: "8px",
          height: "80px",
          background: "linear-gradient(90deg, #333 0%, #555 50%, #333 100%)",
          borderRadius: "0 4px 4px 0",
          boxShadow:
            "inset 0 1px 2px rgba(0,0,0,0.5), -1px 0 3px rgba(0,0,0,0.3)",
        }}
      />

      {/* Charging Port */}
      <Box
        sx={{
          position: "absolute",
          bottom: "-2px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "24px",
          height: "4px",
          background: "#111",
          borderRadius: "2px 2px 0 0",
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.8)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: "1px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "16px",
            height: "1px",
            background: "#333",
            borderRadius: "1px",
          },
        }}
      />

      {/* Tablet Screen */}
      <Box
        sx={{
          background: "white",
          borderRadius: "18px",
          overflow: "hidden", // Hide screen edges
          display: "flex",
          flexDirection: "column", // Critical for flex children
          minHeight,
          height: maxHeight, // Use maxHeight as fixed height
          maxHeight,
          boxShadow:
            "inset 0 0 30px rgba(0,0,0,0.15), inset 0 4px 20px rgba(0,0,0,0.08)",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 30%, rgba(255,255,255,0.05) 60%, transparent 100%)",
            pointerEvents: "none",
            zIndex: 10,
            borderRadius: "18px",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            top: "10%",
            left: "60%",
            width: "40%",
            height: "30%",
            background:
              "linear-gradient(45deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
            borderRadius: "50%",
            filter: "blur(20px)",
            pointerEvents: "none",
            zIndex: 9,
            animation: "screenGlare 8s ease-in-out infinite",
            "@keyframes screenGlare": {
              "0%, 100%": {
                opacity: 0.3,
                transform: "scale(1) rotate(0deg)",
              },
              "50%": {
                opacity: 0.6,
                transform: "scale(1.2) rotate(2deg)",
              },
            },
          },
        }}
      >
        {/* Status Bar Simulation */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "28px",
            background: "rgba(0,0,0,0.02)",
            backdropFilter: "blur(10px)",
            borderRadius: "18px 18px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            zIndex: 8,
            borderBottom: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          {/* Time */}
          <Typography
            sx={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#2e3440",
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            }}
          >
            {new Date().toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>

          {/* Status Icons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {/* WiFi */}
            <Box
              sx={{
                width: "15px",
                height: "10px",
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "4px",
                  height: "3px",
                  background: "#2e3440",
                  borderRadius: "1px",
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "0",
                  height: "0",
                  borderLeft: "7px solid transparent",
                  borderRight: "7px solid transparent",
                  borderBottom: "10px solid #2e3440",
                  borderRadius: "2px",
                  opacity: 0.7,
                },
              }}
            />

            {/* Battery */}
            <Box
              sx={{
                width: "22px",
                height: "11px",
                border: "1.5px solid #2e3440",
                borderRadius: "2px",
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  right: "-4px",
                  top: "2px",
                  width: "2px",
                  height: "5px",
                  background: "#2e3440",
                  borderRadius: "0 1px 1px 0",
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  left: "1px",
                  top: "1px",
                  width: "80%",
                  height: "calc(100% - 2px)",
                  background:
                    "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)",
                  borderRadius: "1px",
                },
              }}
            />
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0, // Critical: allows flex child to shrink
            p: 0,
            pt: 5,
            overflow: "hidden", // Container không scroll
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default TabletDevice;
