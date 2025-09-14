import { Box } from "@mui/material";

interface PhaserControlPanelProps {
  className?: string;
  workspace?: any;
  onMapSelect?: (mapKey: string) => void;
}

export function PhaserControlPanel({ className }: PhaserControlPanelProps) {

  return (
    <Box
      className={className}
      sx={{
        p: 2,
        backgroundColor: "background.paper",
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        textAlign: "center",
      }}
    ></Box>
  );
}
