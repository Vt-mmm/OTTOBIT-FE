import { GameSession } from "../types/game.js";
import { GameState } from "../types/phaser.js";

export class GameStateManager {
  private static instance: GameStateManager;
  private currentState: GameState | null = null;
  private sessionHistory: GameSession[] = [];
  private readonly STORAGE_KEY = "phaser-game-state";
  private readonly SESSION_KEY = "phaser-session-history";

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  /**
   * Get current game state
   */
  getCurrentState(): GameState | null {
    return this.currentState;
  }

  /**
   * Set current game state
   */
  setCurrentState(state: GameState): void {
    this.currentState = state;
    this.saveToStorage();
  }

  /**
   * Update game state
   */
  updateState(updates: Partial<GameState>): void {
    if (this.currentState) {
      this.currentState = { ...this.currentState, ...updates };
      this.saveToStorage();
    }
  }

  /**
   * Reset game state
   */
  resetState(): void {
    this.currentState = null;
    this.saveToStorage();
  }

  /**
   * Start new game session
   */
  startSession(mapKey: string, program: any): string {
    const session: GameSession = {
      id: this.generateSessionId(),
      startTime: Date.now(),
      mapKey,
      program,
    };

    this.sessionHistory.push(session);
    this.saveSessionHistory();
    return session.id;
  }

  /**
   * End game session
   */
  endSession(
    sessionId: string,
    result: "victory" | "defeat" | "error",
    score?: number
  ): void {
    const session = this.sessionHistory.find((s) => s.id === sessionId);
    if (session) {
      session.endTime = Date.now();
      session.result = result;
      session.score = score;
      session.timeSpent = session.endTime - session.startTime;
      this.saveSessionHistory();
    }
  }

  /**
   * Get session history
   */
  getSessionHistory(): GameSession[] {
    return [...this.sessionHistory];
  }

  /**
   * Get best score for a map
   */
  getBestScore(mapKey: string): number {
    const sessions = this.sessionHistory.filter(
      (s) => s.mapKey === mapKey && s.result === "victory" && s.score
    );

    if (sessions.length === 0) return 0;

    return Math.max(...sessions.map((s) => s.score!));
  }

  /**
   * Get completion rate for a map
   */
  getCompletionRate(mapKey: string): number {
    const sessions = this.sessionHistory.filter((s) => s.mapKey === mapKey);
    if (sessions.length === 0) return 0;

    const victories = sessions.filter((s) => s.result === "victory").length;
    return (victories / sessions.length) * 100;
  }

  /**
   * Get total play time
   */
  getTotalPlayTime(): number {
    return this.sessionHistory.reduce((total, session) => {
      return total + (session.timeSpent || 0);
    }, 0);
  }

  /**
   * Clear all data
   */
  clearAllData(): void {
    this.currentState = null;
    this.sessionHistory = [];
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.SESSION_KEY);
  }

  /**
   * Save state to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentState));
    } catch (error) {
      console.error("Failed to save game state:", error);
    }
  }

  /**
   * Load state from localStorage
   */
  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.currentState = JSON.parse(saved);
      }

      const savedSessions = localStorage.getItem(this.SESSION_KEY);
      if (savedSessions) {
        this.sessionHistory = JSON.parse(savedSessions);
      }
    } catch (error) {
      console.error("Failed to load game state:", error);
      this.currentState = null;
      this.sessionHistory = [];
    }
  }

  /**
   * Save session history to localStorage
   */
  private saveSessionHistory(): void {
    try {
      localStorage.setItem(
        this.SESSION_KEY,
        JSON.stringify(this.sessionHistory)
      );
    } catch (error) {
      console.error("Failed to save session history:", error);
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export game data
   */
  exportData(): string {
    const data = {
      currentState: this.currentState,
      sessionHistory: this.sessionHistory,
      exportTime: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import game data
   */
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);

      if (data.currentState) {
        this.currentState = data.currentState;
      }

      if (data.sessionHistory && Array.isArray(data.sessionHistory)) {
        this.sessionHistory = data.sessionHistory;
      }

      this.saveToStorage();
      this.saveSessionHistory();
      return true;
    } catch (error) {
      console.error("Failed to import game data:", error);
      return false;
    }
  }
}
