import { useState } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { Memory as HexIcon, Usb as UsbIcon } from "@mui/icons-material";
import { useMicrobitContext } from "../context/MicrobitContext.js";
import { useNotification } from "../../../hooks/useNotification";

interface DownloadMenuProps {
  trigger: React.ReactElement;
}

export default function DownloadMenu({ trigger }: DownloadMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { showNotification, NotificationComponent } = useNotification();
  const { isConnected } = useMicrobitContext();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
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
        {/* Upload HEX File */}
        <MenuItem onClick={handleUploadHexFile}>
          <ListItemIcon>
            <HexIcon sx={{ color: "#ff6b35" }} />
          </ListItemIcon>
          <ListItemText
            primary="📁 Upload HEX File"
            secondary="Direct upload to micro:bit"
          />
        </MenuItem>

        <Divider />

        {/* Connection Status */}
        <MenuItem onClick={handleClose} disabled>
          <ListItemIcon>
            <UsbIcon sx={{ color: isConnected ? "#2196f3" : "#9e9e9e" }} />
          </ListItemIcon>
          <ListItemText
            primary={isConnected ? "🟢 Connected" : "🔴 Disconnected"}
            secondary="micro:bit connection status"
          />
        </MenuItem>
      </Menu>

      {/* Notification component */}
      <NotificationComponent />
    </>
  );
}
