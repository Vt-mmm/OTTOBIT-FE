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
        "http://localhost:5173", // Frontend dev server
        "https://phaser-map-three.vercel.app", // Phaser map dev server
        "https://phaser-map-three.vercel.app", // Phaser production server
        "https://phaser-map-three.vercel.app/", // With trailing slash
        "https://phaser-map-three.vercel.app",
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

    const iframe = document.getElementById(iframeId) as HTMLIFrameElement;

    if (!iframe) {
      if (retryCount < maxRetries) {
        // Retry after a short delay
        setTimeout(() => {
          this.initialize(iframeId, retryCount + 1);
        }, 200);
        return;
      } else {
        throw new Error(
          `Iframe with id "${iframeId}" not found after ${maxRetries} retries`
        );
      }
    }

    this.iframe = iframe;
    this.isConnected = true;
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
    // Update ready state
    if (message.type === "READY") {
      this.isReady = true;
    }

    // Simple logging for key events
    if (message.type === "VICTORY") {
    }

    if (message.type === "LOSE") {
    }

    // Notify handlers
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(message.data);
        } catch (error) {
          // Silently handle error
        }
      });
    }
  }

  /**
   * Send message to Phaser
   */
  async sendMessage(message: PhaserMessage): Promise<void> {
    console.log("📨 [sendMessage] Attempting to send message:", {
      type: message.type,
      source: message.source,
      hasData: !!message.data
    });
    
    // Auto-connect if not connected yet
    if (!this.isConnected) {
      console.log("🔗 [sendMessage] Not connected, attempting auto-connect...");
      try {
        this.initialize("robot-game-iframe"); // Use default iframe ID
        console.log("✅ [sendMessage] Auto-connect successful");
      } catch (error) {
        console.error("❌ [sendMessage] Auto-connect failed:", error);
        throw new Error("Not connected to Phaser");
      }
    }

    console.log("🔍 [sendMessage] Checking iframe contentWindow...");
    
    // Ensure we have a valid iframe with contentWindow
    let attempts = 0;
    const maxAttempts = 3;

    while (!this.iframe?.contentWindow && attempts < maxAttempts) {
      console.log(`⏳ [sendMessage] Attempt ${attempts + 1}/${maxAttempts} to find iframe contentWindow...`);
      
      // Try to find iframe element directly
      const iframeElement = document.getElementById(
        "robot-game-iframe"
      ) as HTMLIFrameElement;

      if (iframeElement && iframeElement.contentWindow) {
        console.log("✅ [sendMessage] Found iframe contentWindow");
        this.iframe = iframeElement;
        break;
      }

      // Wait before next attempt
      await new Promise((resolve) => setTimeout(resolve, 300));
      attempts++;
    }

    // Final check
    if (!this.iframe?.contentWindow) {
      console.error("❌ [sendMessage] Failed to get iframe contentWindow after retries");
      throw new Error("Iframe contentWindow not available after retries");
    }

    console.log("📦 [sendMessage] Ready to send message, iframe contentWindow available");
    console.log("📜 [sendMessage] Complete message being sent:", JSON.stringify(message, null, 2));

    try {
      this.iframe!.contentWindow!.postMessage(message, "*");
      console.log("✅ [sendMessage] Message sent successfully via postMessage");
    } catch (error) {
      console.error("❌ [sendMessage] Error sending message:", error);
      throw error;
    }
  }

  /**
   * Load map in Phaser using START_MAP
   * @param mapKey - Map identifier key
   * @param mapData - Full map JSON object (Tiled format)
   * @param challengeData - Challenge JSON object with robot, batteries, etc.
   */
  async loadMap(
    mapKey: string,
    mapData?: any,
    challengeData?: any
  ): Promise<void> {
    // Ensure mapData is JSON object, not string
    let mapJson = mapData;
    if (typeof mapData === "string") {
      try {
        mapJson = JSON.parse(mapData);
      } catch (e) {
        mapJson = mapData; // Send as-is if parse fails
      }
    }

    // Ensure challengeData is JSON object, not string
    let challengeJson = challengeData;
    if (typeof challengeData === "string") {
      try {
        challengeJson = JSON.parse(challengeData);
      } catch (e) {
        challengeJson = challengeData; // Send as-is if parse fails
      }
    }

    await this.sendMessage({
      source: "parent-website",
      type: "START_MAP",
      data: {
        mapKey,
        mapJson,
        challengeJson,
      },
    });
  }

  /**
   * Load map with full JSON data (without mapKey)
   * This method sends raw JSON data directly to Phaser
   * @param mapJson - Full map JSON object in Tiled format
   * @param challengeJson - Challenge JSON with robot, batteries, victory conditions
   */
  async loadMapWithData(mapJson: any, challengeJson?: any): Promise<void> {
    // Validate mapJson is an object with required fields
    if (!mapJson || typeof mapJson !== "object") {
      throw new Error("mapJson must be a valid JSON object");
    }

    // Check for required Tiled map properties
    const requiredFields = ["width", "height", "layers", "tilesets"];
    const missingFields = requiredFields.filter((field) => !(field in mapJson));
    if (missingFields.length > 0) {
      // Map may be missing some fields but still valid
    }

    await this.sendMessage({
      source: "parent-website",
      type: "LOAD_MAP_AND_CHALLENGE",
      data: {
        mapJson,
        challengeJson,
      },
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
    console.log("📡 [PhaserCommunicationService] Preparing to run program...");
    
    const message = {
      source: "parent-website",
      type: "RUN_PROGRAM",
      data: { program },
    };
    
    console.log("📦 [PhaserCommunicationService] Message structure:");
    console.log("- Source:", message.source);
    console.log("- Type:", message.type);
    console.log("- Program actions count:", program?.actions?.length || 0);
    console.log("- Program functions count:", program?.functions?.length || 0);
    console.log("📜 [PhaserCommunicationService] Complete program data:");
    console.log(JSON.stringify(program, null, 2));
    
    console.log("🚀 [PhaserCommunicationService] Sending RUN_PROGRAM message to Phaser...");
    
    await this.sendMessage(message);
    
    console.log("✅ [PhaserCommunicationService] RUN_PROGRAM message sent successfully");
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
      try {
        this.initialize(this.iframe.id, 0); // Start with fresh retry count
      } catch (error) {
        // Silently handle error
      }
    }
  }

  disconnect(): void {
    this.isConnected = false;
    this.isReady = false;
    this.iframe = null;
    this.messageHandlers.clear();
  }
}
