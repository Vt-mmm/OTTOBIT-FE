import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import {
  UsbRounded as UsbIcon,
  BluetoothRounded as BluetoothIcon,
  CheckCircleRounded as CheckIcon,
} from "@mui/icons-material";
import { useMicrobitContext } from "../context/MicrobitContext.js";
import { ConnectionType } from "../types/connection.js";

interface MicrobitConnectionDialogProps {
  open: boolean;
  onClose: () => void;
}

export function MicrobitConnectionDialog({
  open,
  onClose,
}: MicrobitConnectionDialogProps) {
  const {
    device,
    isConnected,
    isConnecting,
    error,
    connectionType,
    capabilities,
    connect,
    connectUSB,
    connectBluetooth,
    disconnect,
    clearError,
    getAvailableConnectionTypes,
  } = useMicrobitContext();

  const [selectedConnectionType, setSelectedConnectionType] =
    React.useState<ConnectionType>(
      capabilities.supportsUSB ? ConnectionType.USB : ConnectionType.BLUETOOTH
    );

  const availableTypes = getAvailableConnectionTypes();

  const handleConnect = async () => {
    try {
      clearError();

      switch (selectedConnectionType) {
        case ConnectionType.USB:
          await connectUSB();
          break;
        case ConnectionType.BLUETOOTH:
          await connectBluetooth();
          break;
        default:
          await connect();
      }
    } catch (err) {
      console.error("Connection failed:", err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (err) {
      console.error("Disconnect failed:", err);
    }
  };

  const handleClose = () => {
    if (!isConnecting) {
      clearError();
      onClose();
    }
  };

  const getConnectionTypeIcon = (type: ConnectionType) => {
    switch (type) {
      case ConnectionType.USB:
        return <UsbIcon sx={{ mr: 1 }} />;
      case ConnectionType.BLUETOOTH:
        return <BluetoothIcon sx={{ mr: 1 }} />;
      default:
        return null;
    }
  };

  const getConnectionTypeLabel = (type: ConnectionType) => {
    switch (type) {
      case ConnectionType.USB:
        return "USB";
      case ConnectionType.BLUETOOTH:
        return "Bluetooth";
      default:
        return "Unknown";
    }
  };

  const getStatusChip = () => {
    if (isConnected && device) {
      return (
        <Chip
          icon={<CheckIcon />}
          label={`Connected via ${getConnectionTypeLabel(connectionType!)}`}
          color="success"
          variant="outlined"
          sx={{ mt: 1 }}
        />
      );
    }
    return null;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={isConnecting}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">micro:bit Connection</Typography>
          {getStatusChip()}
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={clearError}>
                Clear
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {isConnected && device ? (
          <Box>
            <Typography variant="body1" gutterBottom>
              Successfully connected to your micro:bit device.
            </Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Device: {device.name || "micro:bit"}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Connection: {getConnectionTypeLabel(connectionType!)}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="body1" gutterBottom>
              Choose how to connect to your micro:bit:
            </Typography>

            <FormControl component="fieldset" sx={{ mt: 2, width: "100%" }}>
              <FormLabel component="legend">Connection Method</FormLabel>
              <RadioGroup
                value={selectedConnectionType}
                onChange={(e) =>
                  setSelectedConnectionType(e.target.value as ConnectionType)
                }
              >
                {availableTypes.map((type) => (
                  <FormControlLabel
                    key={type}
                    value={type}
                    control={<Radio />}
                    label={
                      <Box display="flex" alignItems="center">
                        {getConnectionTypeIcon(type)}
                        <Box>
                          <Typography variant="body2">
                            {getConnectionTypeLabel(type)}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {type === ConnectionType.USB
                              ? "Connect via USB cable (recommended)"
                              : "Connect wirelessly via Bluetooth"}
                          </Typography>
                        </Box>
                      </Box>
                    }
                    sx={{ mt: 1, alignItems: "flex-start" }}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            {availableTypes.length === 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                No connection methods are available. Please check your browser
                and device support.
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isConnecting}>
          Cancel
        </Button>

        {isConnected ? (
          <Button
            onClick={handleDisconnect}
            color="error"
            variant="outlined"
            disabled={isConnecting}
          >
            Disconnect
          </Button>
        ) : (
          <Button
            onClick={handleConnect}
            variant="contained"
            disabled={isConnecting || availableTypes.length === 0}
            startIcon={isConnecting && <CircularProgress size={20} />}
          >
            {isConnecting ? "Connecting..." : "Connect"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default MicrobitConnectionDialog;
