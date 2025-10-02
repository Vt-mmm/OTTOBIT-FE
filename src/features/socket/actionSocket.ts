import { ACTIONS_SERVER_CONFIG } from "../../config/actionsServerConfig";
import { io, Socket } from "socket.io-client";

export type ActionSocketMessage = {
  type?: string;
  id?: string;
  actions?: string[];
  [key: string]: any;
};

export function connectActionSocket(
  roomId: string,
  onMessage?: (msg: ActionSocketMessage) => void,
  options?: { host?: string; port?: number; protocol?: "ws" | "wss" }
) {
  const host = options?.host || ACTIONS_SERVER_CONFIG.HOST || "localhost";
  const port = options?.port ?? parseInt(ACTIONS_SERVER_CONFIG.PORT || "3000");
  const protocol =
    options?.protocol ||
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
      socket?.emit("join", { id: roomId });
    });

    socket.on("connect_error", () => {});

    socket.on("disconnect", () => {});

    socket.on("actions", (data: any) => {
      console.log("📥 Actions event (socket.io):", data);
      onMessage && onMessage({ ...(data || {}), type: "actions" });
    });

    // Optional: handle error channel from server
    socket.on("error", () => {});
  };

  connect();

  return () => {
    try {
      socket?.disconnect();
    } catch {}
    socket = null;
  };
}
