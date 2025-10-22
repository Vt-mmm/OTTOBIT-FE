/**
 * AI Service - Main service for AI operations
 * Uses Backend ChatBot API (which internally uses Google Gemini)
 */

import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_CHATBOT } from "constants/routesApiKeys";

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
  constructor() {
    // No initialization needed - using backend API
  }

  /**
   * Send message to Backend ChatBot API
   * Backend handles all prompt logic (Otto system prompt)
   */
  async sendMessage(
    _systemPrompt: string, // Ignored - backend handles prompts
    userMessage: string,
    _context: any,
    type: "course-recommendation" | "solution-hint"
  ): Promise<AIResponse> {
    try {
      console.log("🤖 Sending to ChatBot API:", {
        type,
        messageLength: userMessage.length,
      });

      // Send only user message - backend handles Otto prompt
      const response = await axiosClient.post(ROUTES_API_CHATBOT.CHAT, {
        message: userMessage,
      });

      const text = response.data.data?.message || "";

      console.log("✅ ChatBot Response:", text);

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
   * This method is deprecated - use sendChatMessageThunk from redux/ai/aiThunks instead
   */
  async sendChatMessage(
    history: GeminiMessage[],
    newMessage: string
  ): Promise<string> {
    try {
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

      // Call backend ChatBot API with conversation context
      const response = await axiosClient.post(ROUTES_API_CHATBOT.CHAT, {
        message: conversationPrompt,
      });

      return response.data.data?.message || "";
    } catch (error: any) {
      console.error("Chat Error:", error);
      throw new Error(error?.message || "Failed to send chat message");
    }
  }

  /**
   * Check if API is configured (always true for backend API)
   */
  isConfigured(): boolean {
    return true;
  }
}

export const aiService = new AIService();
