// Actions Server Configuration
// These values must be set in Vercel environment variables
export const ACTIONS_SERVER_CONFIG = {
  HOST: import.meta.env.VITE_ACTIONS_SERVER_HOST,
  PORT: import.meta.env.VITE_ACTIONS_SERVER_PORT,
  PROTOCOL: import.meta.env.VITE_ACTIONS_SERVER_PROTOCOL,
} as const;

// Helper to get WebSocket URL
export const getActionsWebSocketUrl = () => {
  return `${ACTIONS_SERVER_CONFIG.PROTOCOL}://${ACTIONS_SERVER_CONFIG.HOST}:${ACTIONS_SERVER_CONFIG.PORT}/`;
};

// Helper to get HTTP API URL
export const getActionsHttpUrl = () => {
  return `http://${ACTIONS_SERVER_CONFIG.HOST}:${ACTIONS_SERVER_CONFIG.PORT}`;
};
