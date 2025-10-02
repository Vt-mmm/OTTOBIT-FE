import { ACTIONS_SERVER_CONFIG } from "../../config/actionsServerConfig";

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

  let ws: WebSocket | null = null;
  let stopped = false;
  let reconnectTimer: any = null;

  const url = `${protocol}://${host}:${port}/`;

  const connect = () => {
    if (stopped) return;
    try {
      ws = new WebSocket(url);
    } catch (e) {
      scheduleReconnect();
      return;
    }

    ws.onopen = () => {
      console.log("✅ WebSocket connected to:", url);
      // Send a subscription payload so the server associates this socket with roomId
      try {
        const subscribeMsg = { type: "subscribe", id: roomId };
        ws?.send(JSON.stringify(subscribeMsg));
        console.log("📤 Sent subscription:", subscribeMsg);
      } catch (e) {
        console.error("❌ Failed to send subscription:", e);
      }
    };

    ws.onmessage = (evt) => {
      console.log("🔌 WebSocket received data:", evt.data);
      try {
        const data =
          typeof evt.data === "string" ? JSON.parse(evt.data) : evt.data;
        console.log("📦 Parsed WebSocket message:", data);
        onMessage && onMessage(data as ActionSocketMessage);
      } catch {
        // Non-JSON message
        console.log("⚠️ Non-JSON WebSocket message:", evt.data);
        onMessage && onMessage({ raw: evt.data } as any);
      }
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
      // wait for close to reconnect
    };

    ws.onclose = (event) => {
      console.log("🔌 WebSocket closed:", event.code, event.reason);
      scheduleReconnect();
    };
  };

  const scheduleReconnect = () => {
    if (stopped) return;
    if (reconnectTimer) return;
    console.log("🔄 Scheduling WebSocket reconnect in 1.5s...");
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      console.log("🔄 Attempting WebSocket reconnect...");
      connect();
    }, 1500);
  };

  connect();

  return () => {
    stopped = true;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    try {
      ws?.close();
    } catch {}
    ws = null;
  };
}
