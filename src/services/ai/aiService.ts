/**
 * AI Service - Main service for AI operations
 * Uses Google Gemini API for AI-powered features
 */

import { GoogleGenAI } from "@google/genai";

interface AIResponse {
  content: string;
  recommendations?: any[];
  hints?: any[];
}

interface GeminiMessage {
  role: "user" | "model";
  parts: string;
}

class AIService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    // Initialize Gemini API
    // Uses GOOGLE_API_KEY environment variable or explicit apiKey
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    } else {
      // Try without explicit key (will use GOOGLE_API_KEY env var if available)
      this.ai = new GoogleGenAI({});
    }
  }

  /**
   * Send message to Gemini AI and get response
   */
  async sendMessage(
    systemPrompt: string,
    userMessage: string,
    _context: any,
    type: "course-recommendation" | "solution-hint"
  ): Promise<AIResponse> {
    try {
      if (!this.ai) {
        throw new Error(
          "Gemini API not configured. Please set VITE_GOOGLE_API_KEY in .env file"
        );
      }

      // Build prompt with system instructions + user message
      const fullPrompt = `${systemPrompt}\n\n---\n\n${userMessage}`;

      console.log("🤖 Sending to Gemini:", {
        type,
        promptLength: fullPrompt.length,
      });

      // Generate content using gemini-2.5-flash model
      // Switched from gemini-2.0-flash-exp due to rate limits (50 RPD)
      // gemini-2.5-flash has 250 RPD and better quality
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash", // Better limits: 250 RPD, 10 RPM
        contents: fullPrompt,
      });

      const text = response.text || "";

      console.log("✅ Gemini Response:", text);

      // Try to parse JSON if response looks like JSON
      let parsedContent: any = null;
      if (text.trim().startsWith("{") || text.trim().startsWith("[")) {
        try {
          // Remove markdown code blocks if present
          const cleanedText = text
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();
          parsedContent = JSON.parse(cleanedText);
        } catch {
          // Not valid JSON, use as plain text
        }
      }

      return {
        content: text,
        recommendations: parsedContent?.recommendations || [],
        hints: parsedContent?.hints || [],
      };
    } catch (error: any) {
      console.error("AI Service Error:", error);
      throw new Error(
        error?.message || "Failed to communicate with AI service"
      );
    }
  }

  /**
   * Send message with chat history (for multi-turn conversations)
   */
  async sendChatMessage(
    history: GeminiMessage[],
    newMessage: string
  ): Promise<string> {
    try {
      if (!this.ai) {
        throw new Error("Gemini API not configured");
      }

      // Convert history to proper format
      const formattedHistory = history.map((msg) => ({
        role: msg.role === "model" ? "model" : "user",
        parts: msg.parts,
      }));

      // Build conversation context
      const conversationPrompt = [
        ...formattedHistory.map(
          (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.parts}`
        ),
        `User: ${newMessage}`,
      ].join("\n\n");

      // Generate response
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash", // Consistent with main model
        contents: conversationPrompt,
      });

      return response.text || "";
    } catch (error: any) {
      console.error("Chat Error:", error);
      throw new Error(error?.message || "Failed to send chat message");
    }
  }

  /**
   * Check if API is configured
   */
  isConfigured(): boolean {
    return this.ai !== null;
  }
}

export const aiService = new AIService();
