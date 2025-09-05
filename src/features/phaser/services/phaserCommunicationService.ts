/**
 * Phaser Communication Service
 * Handles all communication between Frontend and Phaser iframe
 */

import { PhaserMessage, PhaserResponse } from "../types/phaser.js";
import { CommunicationConfig, MessageHandler } from "../types/communication.js";

export class PhaserCommunicationService {
  private iframe: HTMLIFrameElement | null = null;
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private config: CommunicationConfig;
  private isConnected = false;
  private isReady = false;

  constructor(config: Partial<CommunicationConfig> = {}) {
    this.config = {
      allowedOrigins: [
        "http://localhost:5173",
        "http://localhost:5174", // Phaser dev server
        "https://phaser-map-three.vercel.app",
        "https://your-domain.com",
      ],
      timeout: 5000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };

    this.setupMessageListener();
  }

  /**
   * Initialize iframe connection
   */
  initialize(iframeId: string, retryCount: number = 0): void {
    const maxRetries = 10; // Limit retries to prevent infinite loop

    console.log(
      `🔍 Looking for iframe with id: "${iframeId}" (attempt ${
        retryCount + 1
      }/${maxRetries + 1})`
    );
    const iframe = document.getElementById(iframeId) as HTMLIFrameElement;

    if (!iframe) {
      if (retryCount < maxRetries) {
        console.warn(
          `⏳ Iframe with id "${iframeId}" not found, retrying... (${
            retryCount + 1
          }/${maxRetries})`
        );
        // Retry after a short delay
        setTimeout(() => {
          this.initialize(iframeId, retryCount + 1);
        }, 200);
        return;
      } else {
        console.error(
          `❌ Iframe with id "${iframeId}" not found after ${maxRetries} retries`
        );
        throw new Error(
          `Iframe with id "${iframeId}" not found after ${maxRetries} retries`
        );
      }
    }

    console.log("✅ Iframe found:", {
      id: iframe.id,
      src: iframe.src,
      contentWindow: !!iframe.contentWindow,
    });

    this.iframe = iframe;
    this.isConnected = true;
    console.log("🔄 Phaser Communication Service initialized");
  }

  /**
   * Setup message listener for responses from Phaser
   */
  private setupMessageListener(): void {
    window.addEventListener("message", (event) => {
      if (this.isValidMessage(event)) {
        this.handleMessage(event.data);
      }
    });
  }

  /**
   * Validate incoming message
   */
  private isValidMessage(event: MessageEvent): boolean {
    // Check origin
    if (!this.config.allowedOrigins.includes(event.origin)) {
      console.warn("🚫 Message from unauthorized origin:", event.origin);
      return false;
    }

    // Check message structure
    const message = event.data;
    if (!message || message.source !== "phaser-robot-game") {
      return false;
    }

    return true;
  }

  /**
   * Handle incoming message from Phaser
   */
  private handleMessage(message: PhaserResponse): void {
    console.log(
      `📥 Received message from Phaser: ${message.type}`,
      message.data
    );

    // Update ready state
    if (message.type === "READY") {
      this.isReady = true;
      console.log("✅ Phaser is now ready for communication");
    }

    // Log important program messages
    if (message.type === "PROGRAM_STARTED") {
      console.log("🎯 Program execution started in Phaser");
    }

    if (message.type === "PROGRAM_STOPPED") {
      console.log("🏁 Program execution stopped in Phaser");
    }

    if (message.type === "VICTORY") {
      console.log("🎉 Victory achieved in Phaser!");
    }

    // Notify handlers
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(message.data);
        } catch (error) {
          console.error("❌ Error in message handler:", error);
        }
      });
    }
  }

  /**
   * Send message to Phaser
   */
  async sendMessage(message: PhaserMessage): Promise<void> {
    console.log("🔍 Debug iframe:", {
      iframe: !!this.iframe,
      contentWindow: !!this.iframe?.contentWindow,
      isConnected: this.isConnected,
    });

    // Check connection first
    if (!this.isConnected) {
      throw new Error("Not connected to Phaser");
    }

    // Ensure we have a valid iframe with contentWindow
    let attempts = 0;
    const maxAttempts = 3;

    while (!this.iframe?.contentWindow && attempts < maxAttempts) {
      console.warn(
        `⚠️ Iframe contentWindow not available, attempt ${
          attempts + 1
        }/${maxAttempts}`
      );

      // Try to find iframe element directly
      const iframeElement = document.getElementById(
        "robot-game-iframe"
      ) as HTMLIFrameElement;

      if (iframeElement && iframeElement.contentWindow) {
        this.iframe = iframeElement;
        console.log("✅ Found iframe with contentWindow");
        break;
      }

      // Wait before next attempt
      await new Promise((resolve) => setTimeout(resolve, 300));
      attempts++;
    }

    // Final check
    if (!this.iframe?.contentWindow) {
      throw new Error("Iframe contentWindow not available after retries");
    }

    try {
      console.log("🔍 About to send message:", message);
      console.log("🔍 Iframe contentWindow:", this.iframe?.contentWindow);
      this.iframe!.contentWindow!.postMessage(message, "*");
      console.log(`📤 Sent message to Phaser: ${message.type}`, message.data);
    } catch (error) {
      console.error("❌ Error sending message to Phaser:", error);
      throw error;
    }
  }

  /**
   * Load map in Phaser
   */
  async loadMap(mapKey: string): Promise<void> {
    await this.sendMessage({
      source: "parent-website",
      type: "LOAD_MAP",
      data: { mapKey },
    });
  }

  /**
   * Load level with map and metadata
   */
  async loadLevel(
    levelId: string,
    mapKey: string,
    metadata?: any
  ): Promise<void> {
    await this.sendMessage({
      source: "parent-website",
      type: "LOAD_LEVEL",
      data: {
        levelId,
        mapKey,
        metadata: {
          levelName: metadata?.name,
          objectives: metadata?.objectives,
          difficulty: metadata?.difficulty,
          ...metadata,
        },
      },
    });
  }

  /**
   * Run program in Phaser
   */
  async runProgram(program: any): Promise<void> {
    await this.sendMessage({
      source: "parent-website",
      type: "RUN_PROGRAM",
      data: { program },
    });
  }

  /**
   * Pause current program
   */
  async pauseProgram(): Promise<void> {
    await this.sendMessage({
      source: "parent-website",
      type: "PAUSE_PROGRAM",
      data: {},
    });
  }

  /**
   * Stop current program
   */
  async stopProgram(): Promise<void> {
    await this.sendMessage({
      source: "parent-website",
      type: "STOP_PROGRAM",
      data: {},
    });
  }

  /**
   * Get current status from Phaser
   */
  async getStatus(): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Timeout waiting for status response"));
      }, this.config.timeout);

      const handler = (data: any) => {
        clearTimeout(timeout);
        this.offMessage("STATUS", handler);
        resolve(data);
      };

      this.onMessage("STATUS", handler);
      this.sendMessage({
        source: "parent-website",
        type: "GET_STATUS",
        data: {},
      });
    });
  }

  /**
   * Register message handler
   */
  onMessage(type: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler);
  }

  /**
   * Unregister message handler
   */
  offMessage(type: string, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.messageHandlers.delete(type);
      }
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): { isConnected: boolean; isReady: boolean } {
    return {
      isConnected: this.isConnected,
      isReady: this.isReady,
    };
  }

  /**
   * Disconnect and cleanup
   */
  /**
   * Refresh iframe connection
   */
  refreshConnection(): void {
    if (this.iframe?.id) {
      console.log("🔄 Refreshing iframe connection...");
      try {
        this.initialize(this.iframe.id, 0); // Start with fresh retry count
      } catch (error) {
        console.warn(`⚠️ Failed to refresh iframe connection: ${error}`);
      }
    }
  }

  disconnect(): void {
    this.isConnected = false;
    this.isReady = false;
    this.iframe = null;
    this.messageHandlers.clear();
    console.log("🔌 Phaser Communication Service disconnected");
  }
}
