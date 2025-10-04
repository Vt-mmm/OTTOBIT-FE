import { ACTIONS_SERVER_CONFIG } from "../../config/actionsServerConfig";
import { io, Socket } from "socket.io-client";

export type ActionSocketMessage = {
  type?: string;
  id?: string;
  actions?: string[];
  [key: string]: any;
};

// Convert string actions to ProgramAction format for Phaser with grouping
function convertStringActionsToProgramActions(actions: string[]): any[] {
  if (actions.length === 0) return [];

  const result: any[] = [];
  let i = 0;

  while (i < actions.length) {
    const currentAction = actions[i];

    // Handle actions that can be grouped (have count)
    if (currentAction === "forward") {
      let count = 1;
      i++; // Move to next action

      // Count consecutive "forward" actions
      while (i < actions.length && actions[i] === "forward") {
        count++;
        i++;
      }

      result.push({ type: "forward", count });
    } else if (currentAction.startsWith("collect")) {
      const color = currentAction.replace("collect", "").toLowerCase();
      let count = 1;
      i++; // Move to next action

      // Count consecutive collect actions with same color
      while (i < actions.length && actions[i] === currentAction) {
        count++;
        i++;
      }

      result.push({ type: "collect", color, count });
    } else {
      // Handle actions that don't need grouping
      switch (currentAction) {
        case "turnRight":
          result.push({ type: "turnRight" });
          break;
        case "turnLeft":
          result.push({ type: "turnLeft" });
          break;
        case "turnBack":
          result.push({ type: "turnBack" });
          break;
        default:
          // Fallback for unknown actions
          result.push({ type: currentAction });
          break;
      }
      i++;
    }
  }

  return result;
}

// Send actions to Phaser game via postMessage
function sendActionsToPhaser(actions: string[]) {
  // Convert string actions to ProgramAction format
  const programActions = convertStringActionsToProgramActions(actions);

  const message = {
    source: "parent-website",
    type: "RUN_PROGRAM_HEADLESS",
    data: {
      actions: programActions,
      version: "1.0.0",
      programName: "microbit_program",
    },
  };

  // Gửi đến iframe game
  const gameIframe = document.getElementById(
    "robot-game-iframe"
  ) as HTMLIFrameElement;
  if (gameIframe && gameIframe.contentWindow) {
    gameIframe.contentWindow.postMessage(message, "*");
    console.log("📤 Sent actions to Phaser:", message);
  } else {
    console.warn("⚠️ Game iframe not found");
  }
}

// Lắng nghe response từ Phaser game
function setupPhaserMessageListener() {
  window.addEventListener("message", (event) => {
    const message = event.data;

    if (message && message.source === "phaser-robot-game") {
      switch (message.type) {
        case "PROGRAM_COMPILED_ACTIONS":
          handleCompiledActions(message.data);
          break;

        case "ERROR":
          handleError(message.data);
          break;
      }
    }
  });
}

function handleCompiledActions(data: any) {
  console.log("✅ Compiled actions from Phaser:", data.actions);
  // Hiển thị kết quả lên UI
  displayActions(data.actions);
}

function handleError(data: any) {
  console.error("❌ Game error:", data);
  // Hiển thị lỗi cho user
  showErrorMessage(data.message);
}

function displayActions(actions: string[]) {
  console.log("🎮 Display actions:", actions);
  // TODO: Hiển thị actions lên UI
}

function showErrorMessage(message: string) {
  console.error("💥 Error message:", message);
  // TODO: Hiển thị lỗi lên UI
}

export function connectActionSocket(
  _roomId: string,
  onMessage?: (msg: ActionSocketMessage) => void,
  options?: { host?: string; port?: number; protocol?: "ws" | "wss" }
) {
  const host = options?.host || ACTIONS_SERVER_CONFIG.HOST || "localhost";
  const port = options?.port ?? parseInt(ACTIONS_SERVER_CONFIG.PORT || "3000");

  // Force WSS for HTTPS pages (production)
  const isHttps =
    typeof window !== "undefined" && window.location.protocol === "https:";
  const protocol = "http";

  // NestJS Socket.IO default path is /socket.io
  const url = `${protocol}://${host}:${port}`;
  let socket: Socket | null = null;

  const connect = () => {
    socket = io(url, {
      path: "/socket.io",
      transports: isHttps ? ["websocket", "polling"] : ["websocket"],
      withCredentials: true,
      timeout: 5000,
      forceNew: true,
    });

    socket.on("connect", () => {
      socket?.emit("join", { id: _roomId });
    });

    socket.on("connect_error", () => {});

    socket.on("disconnect", () => {});

    socket.on("actions", (data: any) => {
      console.log("📥 Actions event (socket.io):", data);

      // Send actions to Phaser game via postMessage
      if (data.actions && Array.isArray(data.actions)) {
        sendActionsToPhaser(data.actions);
      }

      onMessage && onMessage({ ...(data || {}), type: "actions" });
    });

    // Optional: handle error channel from server
    socket.on("error", () => {});
  };

  connect();

  // Setup Phaser message listener
  setupPhaserMessageListener();

  return () => {
    try {
      socket?.disconnect();
    } catch {}
    socket = null;
  };
}
