import { ACTIONS_SERVER_CONFIG } from "../../config/actionsServerConfig";
import { io, Socket } from "socket.io-client";

export type ActionSocketMessage = {
  type?: string;
  id?: string;
  actions?: string[];
  [key: string]: any;
};

// Send actions to Phaser game via postMessage
function sendActionsToPhaser(actions: string[]) {
  const message = {
    source: "parent-website",
    type: "RUN_PROGRAM_HEADLESS",
    data: {
      actions: actions,
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
    console.log("📤 Sent actions to Phaser:", actions);
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
  const protocol = isHttps
    ? "wss"
    : options?.protocol ||
      (ACTIONS_SERVER_CONFIG.PROTOCOL as "ws" | "wss") ||
      "ws";

  // NestJS Socket.IO default path is /socket.io
  const url = `${protocol}://${host}:${port}`;
  let socket: Socket | null = null;

  const connect = () => {
    socket = io(url, {
      path: "/socket.io",
      transports: ["websocket"],
      withCredentials: true,
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
