/**
 * AI Floating Button Component
 * Floating action button to open AI chat dialog
 * Can be placed globally or on specific pages
 */

import { useState } from "react";
import { Fab, Tooltip, Box } from "@mui/material";
import { AIChatDialog } from "./AIChatDialog";

interface AIFloatingButtonProps {
  // Position on screen
  position?: {
    bottom?: number;
    right?: number;
    left?: number;
    top?: number;
  };
  // Custom tooltip
  tooltip?: string;
}

export const AIFloatingButton = ({
  position = { bottom: 24, right: 24 },
  tooltip = "AI Tư vấn khóa học",
}: AIFloatingButtonProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpen = () => {
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <Tooltip title={tooltip} placement="left">
        <Fab
          aria-label="ai-assistant"
          onClick={handleOpen}
          sx={{
            position: "fixed",
            ...position,
            zIndex: 1000,
            width: 80,
            height: 80,
            bgcolor: "transparent",
            boxShadow: "none",
            "&:hover": {
              bgcolor: "transparent",
              transform: "scale(1.1)",
              transition: "transform 0.2s",
            },
          }}
        >
          <Box
            component="img"
            src="/asset/Logo Popup.png"
            alt="Ottobit AI"
            sx={{
              width: 80,
              height: 80,
              objectFit: "contain",
            }}
          />
        </Fab>
      </Tooltip>

      <AIChatDialog open={dialogOpen} onClose={handleClose} />
    </>
  );
};
