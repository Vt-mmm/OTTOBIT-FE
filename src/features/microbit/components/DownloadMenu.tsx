import { useState } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import {
  Memory as HexIcon,
  BluetoothRounded as BluetoothIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useNotification } from "../../../hooks/useNotification";
import { useMicrobitContext } from "../context/MicrobitContext";
import { MicrobitConnectionDialog } from "./MicrobitConnectionDialog";

interface DownloadMenuProps {
  trigger: React.ReactElement;
}

export default function DownloadMenu({ trigger }: DownloadMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showConnectionCheckDialog, setShowConnectionCheckDialog] = useState(false);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const open = Boolean(anchorEl);
  const { showNotification, NotificationComponent } = useNotification();
  const { isConnected } = useMicrobitContext();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    // Kiểm tra connection status trước
    if (!isConnected) {
      setShowConnectionCheckDialog(true);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Direct upload to MICROBIT drive (most reliable)
  const uploadHexToMicrobitDrive = async (
    hexContent: string,
    originalName: string
  ) => {
    try {
      if (!("showDirectoryPicker" in window)) {
        throw new Error(
          "Your browser doesn't support direct file upload. Please use Chrome/Edge."
        );
      }

      // FIXED: Store directory handle for reuse (avoid user gesture error)
      let directoryHandle;

      // Try to reuse stored handle first
      if ((window as any).__microbitDriveHandle) {
        try {
          directoryHandle = (window as any).__microbitDriveHandle;
          // Test if handle is still valid
          await directoryHandle.requestPermission({ mode: "readwrite" });
        } catch {
          // Handle expired, need new one
          directoryHandle = null;
        }
      }

      // Get new handle if needed
      if (!directoryHandle) {
        directoryHandle = await (window as any).showDirectoryPicker({
          mode: "readwrite",
          startIn: "desktop",
        });
        // Store for reuse
        (window as any).__microbitDriveHandle = directoryHandle;
      }

      // Create HEX file name
      const hexFileName = originalName.replace(/\.(hex|py)$/i, ".hex");

      // Write HEX file directly to MICROBIT drive
      const fileHandle = await directoryHandle.getFileHandle(hexFileName, {
        create: true,
      });
      const writable = await fileHandle.createWritable();

      await writable.write(hexContent);
      await writable.close();

      // FIXED: Force micro:bit restart by writing special sync.txt file
      try {
        const syncFileHandle = await directoryHandle.getFileHandle("sync.txt", {
          create: true,
        });
        const syncWritable = await syncFileHandle.createWritable();
        await syncWritable.write(
          `Upload completed at ${new Date().toISOString()}`
        );
        await syncWritable.close();

        // Delete sync file after a moment to trigger restart
        setTimeout(async () => {
          try {
            await directoryHandle.removeEntry("sync.txt");
          } catch (e) {
            console.log("Sync file cleanup (normal)");
          }
        }, 500);
      } catch (e) {
        console.log("Sync file operation (optional)");
      }

      console.log(
        `✅ HEX file "${hexFileName}" written to MICROBIT drive successfully!`
      );
    } catch (error: any) {
      console.error("Direct upload failed:", error);
      if (error.name === "AbortError") {
        throw new Error("Upload cancelled by user");
      }
      throw new Error(`Failed to upload to MICROBIT drive: ${error.message}`);
    }
  };

  const handleUploadHexFile = async () => {
    try {
      showNotification("📁 Please select your HEX file...", "info");

      // Create file input element
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".hex";

      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        try {
          showNotification("📄 Reading HEX file...", "info");
          const hexContent = await file.text();

          // Validate HEX file format
          if (
            !hexContent.includes(":") ||
            hexContent.trim().split("\n").length < 2
          ) {
            throw new Error(
              "Invalid HEX file format. Please select a valid .hex file."
            );
          }

          // Validate if HEX contains LED/display code
          const hasDisplayCode =
            hexContent.includes("display") ||
            hexContent.includes("LED") ||
            hexContent.includes("show") ||
            hexContent.includes("scroll");

          if (!hasDisplayCode) {
            showNotification(
              "⚠️ This HEX file may not contain LED display code. Continue anyway?",
              "warning"
            );
          }

          showNotification("🔄 Preparing HEX file for micro:bit...", "info");

          // Direct upload to MICROBIT drive (most reliable approach)
          showNotification("📁 Please select MICROBIT drive folder...", "info");

          await uploadHexToMicrobitDrive(hexContent, file.name);

          showNotification(
            "✅ HEX uploaded successfully!\n\n" +
              "🎯 micro:bit will auto-restart and show your program!\n\n" +
              "💡 Folder permission saved for next uploads!\n" +
              "📁 Direct upload to MICROBIT drive!",
            "success"
          );

          handleClose();
        } catch (error: any) {
          console.error("HEX processing failed:", error);
          showNotification(
            `Failed to process HEX file: ${error.message}`,
            "error"
          );
        }
      };

      // Trigger file picker
      input.click();
    } catch (error: any) {
      showNotification(`Failed to open file picker: ${error.message}`, "error");
    }
  };

  return (
    <>
      {/* Trigger element */}
      <div onClick={handleClick}>{trigger}</div>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        {/* Upload HEX File to micro:bit */}
        <MenuItem onClick={handleUploadHexFile}>
          <ListItemIcon>
            <HexIcon sx={{ color: "#ff6b35" }} />
          </ListItemIcon>
          <ListItemText
            primary="Upload HEX to micro:bit"
            secondary="Select and upload .hex file directly"
          />
        </MenuItem>
      </Menu>

      {/* Connection Check Dialog */}
      <Dialog 
        open={showConnectionCheckDialog}
        onClose={() => setShowConnectionCheckDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <WarningIcon sx={{ color: "#ff9800", mr: 1 }} />
            <Typography variant="h6">micro:bit Not Connected</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            You need to connect your micro:bit before uploading code.
          </Alert>
          <Typography variant="body1" gutterBottom>
            To upload your code to the micro:bit, you must first establish a connection.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Click "Connect to micro:bit" to open the connection dialog.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowConnectionCheckDialog(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setShowConnectionCheckDialog(false);
              setShowConnectionDialog(true);
            }}
            variant="contained"
            startIcon={<BluetoothIcon />}
            sx={{
              bgcolor: "#1976d2",
              "&:hover": { bgcolor: "#1565c0" }
            }}
          >
            Connect to micro:bit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Microbit Connection Dialog */}
      <MicrobitConnectionDialog
        open={showConnectionDialog}
        onClose={() => setShowConnectionDialog(false)}
      />

      {/* Notification component */}
      <NotificationComponent />
    </>
  );
}
