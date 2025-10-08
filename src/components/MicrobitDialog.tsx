import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
  createWebUSBConnection,
  BoardId,
  type BoardVersion,
} from "@microbit/microbit-connection";
import { microbitBoardId } from "@microbit/microbit-universal-hex";
import { MicropythonFsHex } from "@microbit/microbit-fs";
import MicrobitConnectionGuide from "./MicrobitConnectionGuide";
import { useAppSelector } from "../redux/config";
import { generatePythonCode } from "../components/block/generators/python";

interface MicrobitDialogProps {
  open: boolean;
  onClose: () => void;
  workspace?: any;
  roomId?: string;
}

const V1_URL = "/microbit-micropython-v1.hex";
const V2_URL = "/microbit-micropython-v2.hex";

export default function MicrobitDialog({
  open,
  onClose,
  workspace,
  roomId,
}: MicrobitDialogProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [pythonCode, setPythonCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showConnectionGuide, setShowConnectionGuide] = useState(false);
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPass, setWifiPass] = useState("");

  const deviceRef = useRef(createWebUSBConnection());
  const flashingRef = useRef(false);
  const templateRef = useRef<string>("");

  // Current challenge from Redux (for challengeJson)
  const currentChallenge = useAppSelector(
    (s) => (s as any)?.challenge?.currentChallenge?.data
  );

  const jsonToPythonLiteral = (value: any): string => {
    if (value === null || value === undefined) return "None";
    const t = typeof value;
    if (t === "number") return String(value);
    if (t === "boolean") return value ? "True" : "False";
    if (t === "string")
      return `"${String(value).replace(/\\/g, "\\\\").replace(/\"/g, '\\"')}"`;
    if (Array.isArray(value)) {
      return `[${value.map(jsonToPythonLiteral).join(",")}]`;
    }
    if (t === "object") {
      return `{${Object.keys(value)
        .map(
          (k) =>
            `${jsonToPythonLiteral(k)}:${jsonToPythonLiteral(
              (value as any)[k]
            )}`
        )
        .join(",")}}`;
    }
    return "None";
  };

  const buildUserRoute = (userBody: string) => {
    // Ensure proper indentation for body lines
    const lines = (userBody || "")
      .split("\n")
      .filter((l) => l.trim().length > 0);
    const indented = lines
      .map((l) => (l.endsWith("\n") ? `    ${l}` : `    ${l}\n`))
      .join("");
    return (
      `def user_route(forward, turnLeft, turnRight, turnBack, collect, startSound, finishSound):\n` +
      `    startSound()\n` +
      indented +
      `    if _check_victory():\n` +
      `        display.show(Image.YES)\n` +
      `    else:\n` +
      `        display.show(Image.NO)\n` +
      `    finishSound()\n`
    );
  };

  const buildPythonBundle = (): string => {
    // User code from workspace using Blockly python generator
    const userPy = workspace ? generatePythonCode(workspace) : "";
    const userRoute = buildUserRoute(userPy);

    // Challenge JSON from current challenge (string) -> object -> python literal
    let challengePy = "{}";
    try {
      const raw = currentChallenge?.challengeJson;
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw || {};
      challengePy = jsonToPythonLiteral(parsed);
    } catch {}

    // Full bundle: take ottobit_full.py and replace challengeJson and user_route sections
    let code = String(templateRef.current || "");
    try {
      code = code.replace(
        /(challengeJson\s*=)[\s\S]*?(\nrobot_state\s*=)/,
        (_m, p1, p2) => `${p1} ${challengePy}\n\n${p2}`
      );
    } catch {}
    try {
      // Replace only the user_route block up to the next top-level (non-indented) line
      code = code.replace(
        new RegExp("(def\\s+user_route[\\s\\S]*?)(?=^\\S)", "m"),
        (_m) => userRoute
      );
    } catch {}

    // Inject WiFi, Room ID, and Actions Server config
    try {
      if (wifiSsid) {
        code = code.replace(/(WIFI_SSID\s*=\s*")[^"]*(")/, `$1${wifiSsid}$2`);
      }
      if (wifiPass) {
        code = code.replace(/(WIFI_PASS\s*=\s*")[^"]*(")/, `$1${wifiPass}$2`);
      }
      if (roomId) {
        code = code.replace(
          /(ACTIONS_ROOM_ID\s*=\s*")[^"]*(")/,
          `$1${roomId}$2`
        );
      }
      // Inject Actions Server config from environment
      const actionsHost = import.meta.env.VITE_ACTIONS_SERVER_HOST_PY;
      const actionsPort = import.meta.env.VITE_ACTIONS_SERVER_PORT;
      if (actionsHost) {
        code = code.replace(
          /(ACTIONS_API_HOST\s*=\s*")[^"]*(")/,
          `$1${actionsHost}$2`
        );
      }
      if (actionsPort) {
        code = code.replace(/(ACTIONS_API_PORT\s*=\s*)\d+/, `$1${actionsPort}`);
      }
    } catch {}
    return code;
  };

  // Initialize with basic Python code when dialog opens (without WiFi injection)
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        if (!templateRef.current) {
          const resp = await fetch("/ottobit_full.py", { cache: "no-store" });
          templateRef.current = await resp.text();
        }

        // Build basic code without WiFi injection
        const userPy = workspace ? generatePythonCode(workspace) : "";
        const userRoute = buildUserRoute(userPy);

        let challengePy = "{}";
        try {
          const raw = currentChallenge?.challengeJson;
          const parsed = typeof raw === "string" ? JSON.parse(raw) : raw || {};
          challengePy = jsonToPythonLiteral(parsed);
        } catch {}

        let code = String(templateRef.current || "");
        try {
          code = code.replace(
            /(challengeJson\s*=)[\s\S]*?(\nrobot_state\s*=)/,
            (_m, p1, p2) => `${p1} ${challengePy}\n\n${p2}`
          );
        } catch {}
        try {
          // Replace only the user_route block up to the next top-level (non-indented) line
          code = code.replace(
            new RegExp("(def\\s+user_route[\\s\\S]*?)(?=^\\S)", "m"),
            (_m) => userRoute
          );
        } catch {}

        setPythonCode(code);
        addLog(
          "Prepared basic MicroPython code bundle (WiFi will be injected on flash)"
        );
      } catch {
        setPythonCode("");
      }
    })();
  }, [open]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLog((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const setStatusMessage = (message: string) => {
    setStatus(message);
    addLog(message);
  };

  const setProgressValue = (value?: number) => {
    const progressValue = Math.max(
      0,
      Math.min(100, Math.round((value ?? 0) * 100))
    );
    setProgress(progressValue);
  };

  // Smooth progress animation
  const animateProgress = (targetValue: number, duration: number = 300) => {
    const startValue = progress;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = startValue + (targetValue - startValue) * progress;

      setProgress(Math.round(currentValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  // Build per-board HEX from Python
  const buildHexFromPython = async (code: string) => {
    setStatusMessage("Loading MicroPython HEX...");
    addLog("Loading MicroPython HEX files...");
    animateProgress(10);

    const mp = await Promise.all(
      [
        { boardId: microbitBoardId.V1, url: V1_URL },
        { boardId: microbitBoardId.V2, url: V2_URL },
      ].map(async (x) => {
        addLog(`Loading ${x.url}...`);
        const hex = await (await fetch(x.url, { cache: "no-store" })).text();
        animateProgress(30);
        return {
          boardId: x.boardId,
          hex: hex,
        };
      })
    );

    setStatusMessage("Building filesystem...");
    addLog("Building MicroPython filesystem...");
    animateProgress(50);

    const fs = new MicropythonFsHex(mp, { maxFsSize: 20 * 1024 });
    fs.write("main.py", new TextEncoder().encode(code));

    addLog("Filesystem built successfully");
    animateProgress(70);

    return async (v?: BoardVersion) => {
      addLog(`Generating HEX for board version: ${v ?? "V2"}`);
      const boardId = BoardId.forVersion(v ?? "V2").id;
      const hex = fs.getIntelHex(boardId);
      addLog("HEX generation complete");
      animateProgress(90);
      return hex;
    };
  };

  const handleConnect = async () => {
    try {
      setStatusMessage("Connecting...");
      setError(null);
      await deviceRef.current.connect();
      setIsConnected(true);
      setStatusMessage("Connected to micro:bit");
    } catch (err: any) {
      setStatusMessage("Connect failed");
      setError(`Connect error: ${err?.message || err}`);
      addLog(`Connect error: ${err?.message || err}`);
    }
  };

  const handleConnectClick = () => {
    // Check if user has dismissed the guide before
    const guideDismissed = localStorage.getItem(
      "microbit-connection-guide-dismissed"
    );

    if (guideDismissed === "true") {
      // Skip guide and connect directly
      handleConnect();
    } else {
      // Show connection guide first
      setShowConnectionGuide(true);
    }
  };

  const handleGuideConnect = () => {
    setShowConnectionGuide(false);
    handleConnect();
  };

  const handleDisconnect = async () => {
    try {
      await deviceRef.current.disconnect();
      setIsConnected(false);
      setStatusMessage("Disconnected");
      addLog("Disconnected");
    } catch (err: any) {
      addLog(`Disconnect error: ${err?.message || err}`);
    }
  };

  const handleFlash = async () => {
    if (flashingRef.current) return;

    // Validate WiFi fields before flashing
    if (!wifiSsid || !wifiPass) {
      setError("Vui lòng nhập đầy đủ WiFi SSID và Password trước khi flash!");
      addLog("❌ Error: WiFi credentials required");
      return;
    }

    flashingRef.current = true;
    setIsFlashing(true);
    setError(null); // Clear any previous errors

    const doFlash = async (
      dataSource: (_?: BoardVersion) => Promise<string>
    ) => {
      setProgressValue(0);
      setStatusMessage("Flashing...");
      addLog("Starting flash process...");

      // Simulate progress steps for better UX
      const progressSteps = [15, 30, 45, 60, 75, 85, 95];
      let stepIndex = 0;
      let lastRealProgress = 0;

      const progressInterval = setInterval(() => {
        if (stepIndex < progressSteps.length) {
          const simulatedProgress = progressSteps[stepIndex] / 100;
          // Only update if real progress hasn't exceeded simulated progress
          if (simulatedProgress > lastRealProgress) {
            animateProgress(progressSteps[stepIndex]);
            addLog(`Flash progress: ${progressSteps[stepIndex]}%`);
          }
          stepIndex++;
        }
      }, 1000);

      try {
        await deviceRef.current.flash(dataSource, (v: number) => {
          // Real progress from device
          const realProgress = Math.max(0, Math.min(1, v || 0));
          lastRealProgress = realProgress;
          const progressPercent = Math.round(realProgress * 100);
          animateProgress(progressPercent);
          addLog(`Device progress: ${progressPercent}%`);
        });

        clearInterval(progressInterval);
        animateProgress(100);
        setStatusMessage("Flashed successfully!");
        addLog("Flashed successfully!");
      } catch (flashError) {
        clearInterval(progressInterval);
        throw flashError;
      }
    };

    try {
      // Build final code with WiFi injection when flashing
      const finalCode = buildPythonBundle();
      const code =
        finalCode ||
        pythonCode ||
        `from microbit import *
while True:
    display.show(Image.HEART)
    sleep(500)`;

      const dataSource = await buildHexFromPython(code);

      try {
        await deviceRef.current.connect();
      } catch {}

      await doFlash(dataSource);
    } catch (err: any) {
      const msg = `${err?.name || ""} ${err?.code || ""} ${
        err?.message || ""
      }`.toLowerCase();

      if (
        msg.includes("reconnect-microbit") ||
        msg.includes("transferout") ||
        msg.includes("device must be opened first")
      ) {
        addLog("Reconnecting after flash error...");
        try {
          await deviceRef.current.disconnect();
        } catch {}
        await deviceRef.current.connect();
        try {
          const retryCode = buildPythonBundle();
          const dataSource = await buildHexFromPython(retryCode);
          await doFlash(dataSource);
        } catch (err2: any) {
          setStatusMessage("Flash failed after reconnect");
          setError(`Flash retry error: ${err2?.message || err2}`);
          addLog(`Flash retry error: ${err2?.message || err2}`);
        }
      } else {
        setStatusMessage("Flash failed");
        setError(`Flash error: ${err?.message || err}`);
        addLog(`Flash error: ${err?.message || err}`);
      }
    } finally {
      flashingRef.current = false;
      setIsFlashing(false);
    }
  };

  const handleClose = () => {
    if (!isFlashing) {
      onClose();
    }
  };

  const clearLog = () => {
    setLog([]);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={isFlashing}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Send to micro:bit</Typography>
          <IconButton onClick={handleClose} disabled={isFlashing}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Box display="flex" gap={1} sx={{ mb: 2 }}>
            <TextField
              label="WiFi SSID"
              size="small"
              value={wifiSsid}
              onChange={(e) => setWifiSsid(e.target.value)}
              sx={{ minWidth: 160 }}
            />
            <TextField
              label="WiFi Password"
              size="small"
              type="password"
              value={wifiPass}
              onChange={(e) => setWifiPass(e.target.value)}
              sx={{ minWidth: 160 }}
            />
            {roomId ? (
              <TextField
                label="Room ID"
                size="small"
                value={roomId}
                disabled
                sx={{ minWidth: 160 }}
              />
            ) : null}
          </Box>
          <Box display="flex" gap={1} sx={{ mb: 2 }}>
            <Button
              variant="contained"
              onClick={handleConnectClick}
              disabled={isConnected || isFlashing}
              startIcon={<PlayIcon />}
            >
              Connect
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleFlash}
              disabled={!isConnected || isFlashing}
              startIcon={<PlayIcon />}
            >
              Build & Flash
            </Button>
            <Button
              variant="outlined"
              onClick={handleDisconnect}
              disabled={!isConnected || isFlashing}
              startIcon={<StopIcon />}
            >
              Disconnect
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Python Code (Edit manually):
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Enter your Python code for micro:bit. The code will be compiled
              and uploaded to your device.
            </Typography>
            <TextField
              multiline
              rows={12}
              fullWidth
              value={pythonCode}
              onChange={(e) => setPythonCode(e.target.value)}
              variant="outlined"
              placeholder="Enter your Python code here..."
              disabled={isFlashing}
              sx={{
                fontFamily: "monospace",
                fontSize: "0.875rem",
                "& .MuiInputBase-input": {
                  fontFamily: "monospace",
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle2">Progress:</Typography>
              <Typography variant="body2" color="text.secondary">
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {status}
            </Typography>
          </Box>

          <Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle2">Log:</Typography>
              <Tooltip title="Clear log">
                <IconButton size="small" onClick={clearLog}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Box
              sx={{
                bgcolor: "#fafafa",
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                p: 1,
                maxHeight: 200,
                overflow: "auto",
                fontFamily: "monospace",
                fontSize: "0.875rem",
              }}
            >
              {log.map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isFlashing}>
          Close
        </Button>
      </DialogActions>

      {/* Connection Guide Dialog */}
      <MicrobitConnectionGuide
        open={showConnectionGuide}
        onClose={() => setShowConnectionGuide(false)}
        onConnect={handleGuideConnect}
      />
    </Dialog>
  );
}
