/**
 * Solution Hint AI Service
 * Provides progressive hints for students stuck on challenges
 */

import { aiService } from "./aiService";

export interface SolutionHintContext {
  challenge: {
    id: string;
    title: string;
    description: string;
    objectives?: string;
    difficulty?: string;
    solutionJson?: any; // Expected solution from challenge designer
  };
  submission: {
    id: string;
    blocklyWorkspace?: any;
    generatedCode?: string;
    testResults?: any[];
    errorMessage?: string;
    status: string;
  };
  attemptCount: number;
  previousHints?: string[];
}

export interface SolutionHint {
  hintLevel: "conceptual" | "algorithmic" | "detailed";
  hint: string;
  relatedConcepts?: string[];
  suggestedBlocks?: string[];
  encouragement: string;
}

class SolutionHintService {
  /**
   * Generate AI-powered hint for student's submission
   */
  async generateHint(context: SolutionHintContext): Promise<SolutionHint> {
    try {
      // Debug: Log challenge info
      console.log("🔍 AI Hint - Challenge:", context.challenge.title);
      console.log("🔍 AI Hint - Attempt Count:", context.attemptCount);

      // Send simple user message - backend handles all logic
      const userMessage = `Tôi đang gặp khó khăn với thử thách "${context.challenge.title}". Đây là lần thử thứ ${context.attemptCount}. Bạn có thể cho tôi gợi ý không?`;
      
      console.log("📝 AI Hint - User message:", userMessage);

      // Call AI service - backend Otto prompt will handle hint logic
      const response = await aiService.sendMessage(
        "", // No system prompt - backend handles it
        userMessage, // Send only simple user message
        context,
        "solution-hint"
      );

      // Parse response
      const hintLevel = this.determineHintLevel(context.attemptCount);

      // Extract structured data if available
      let hint = response.content;
      let encouragement = "Bạn đang làm tốt! Tiếp tục cố gắng!";
      let suggestedBlocks: string[] = [];

      // Try to parse if response is JSON
      try {
        const parsed = JSON.parse(response.content);
        hint = parsed.hint || response.content;
        encouragement = parsed.encouragement || encouragement;
        suggestedBlocks = parsed.suggestedBlocks || [];
      } catch {
        // Plain text response, use as is
      }

      return {
        hintLevel,
        hint,
        encouragement,
        suggestedBlocks,
      };
    } catch (error) {
      console.error("Solution Hint Error:", error);
      throw error;
    }
  }

  /**
   * Build system prompt based on attempt count (DEPRECATED - backend handles system prompt)
   * Kept for reference only
   */
  private buildSystemPrompt(attemptCount: number): string {
    const hintLevel = this.determineHintLevel(attemptCount);

    let promptAddition = "";
    if (hintLevel === "conceptual") {
      promptAddition =
        "Lần đầu gợi ý: Hỏi câu hỏi hướng dẫn về hướng giải quyết tổng thể, nhưng VẪN CHỈ RA cụ thể robot cần làm gì (ví dụ: 'Robot cần di chuyển bao nhiêu bước? Cần thu thập bao nhiêu vật phẩm?')";
    } else if (hintLevel === "algorithmic") {
      promptAddition =
        "Lần 2-5: CHỈ RA CỤ THỂ các bước robot cần thực hiện, nhưng để học sinh tự tìm cách sắp xếp blocks. Ví dụ: 'Bạn cần dùng block di chuyển 3 bước, sau đó thu thập 3 vật phẩm màu vàng'";
    } else {
      promptAddition =
        "Sau lần thứ 5: CHỈ RA CHÍNH XÁC từng bước robot cần làm theo đúng thứ tự. Ví dụ: '1. Di chuyển forward 3 bước\n2. Thu thập collect 3 vật màu vàng\n3. Rẽ trái turnLeft 1 lần'";
    }

    return `You are a patient coding tutor helping students learn robotics programming with Blockly.
Your goal is to guide students to discover the solution using SPECIFIC, CONCRETE hints.

🎯 CRITICAL RULES:
1. YOU MUST be SPECIFIC about actions needed - NO vague hints like "hãy suy nghĩ" or "thử điều chỉnh"
2. ALWAYS analyze the expected solution JSON and TELL the student exactly what actions robot needs
3. Compare student's code with expected solution and POINT OUT specific differences
4. Use action names like: "forward", "collect", "turnLeft", "turnRight"
5. Specify counts: "di chuyển 3 bước", "thu thập 3 vật phẩm màu vàng"
6. For arithmetic expressions: "plus" (cộng), "minus" (trừ), "multiply" (nhân), "divide" (chia)
7. Respond in Vietnamese
8. Be encouraging but CONCRETE

${promptAddition}

📋 HOW TO USE EXPECTED SOLUTION:
When you receive solution JSON with "actions" array:
- READ each action: {type: "forward", count: 3} means "di chuyển forward 3 bước"
- READ {type: "collect", count: 3, color: "yellow"} means "thu thập 3 vật phẩm màu vàng"
- COMPARE with student's code to find what's missing or wrong
- TELL the student EXACTLY what actions are missing

✅ GOOD EXAMPLES:
"Bạn cần thêm block di chuyển forward 3 bước"
"Bạn thiếu block thu thập collect 3 vật phẩm màu vàng (yellow)"
"Sau khi thu thập xong, robot cần rẽ trái turnLeft 1 lần"

❌ BAD EXAMPLES (NEVER USE):
"Hãy suy nghĩ xem robot cần làm gì"
"Thử điều chỉnh chương trình của bạn"
"Bạn cần thêm một số blocks"`;
  }

  /**
   * Build user prompt with submission context
   */
  private buildUserPrompt(context: SolutionHintContext): string {
    // Format solution actions in a clear, readable way
    let solutionSection = "";
    if (context.challenge.solutionJson?.actions) {
      const actions = context.challenge.solutionJson.actions;
      solutionSection = `
🎯 === EXPECTED SOLUTION ===
The student needs to program robot to do these actions IN ORDER:

${actions
  .map((action: any, idx: number) => {
    let actionDesc = `${idx + 1}. Action: ${action.type}`;
    if (action.count) actionDesc += ` | Count: ${action.count}`;
    if (action.color) actionDesc += ` | Color: ${action.color}`;
    if (action.direction) actionDesc += ` | Direction: ${action.direction}`;
    
    // Add Vietnamese translation for clarity
    const translations: Record<string, string> = {
      forward: "di chuyển thẳng",
      collect: "thu thập vật phẩm",
      turnLeft: "rẽ trái",
      turnRight: "rẽ phải",
      yellow: "màu vàng",
      green: "màu xanh lá",
      blue: "màu xanh dương",
      red: "màu đỏ",
      plus: "cộng (+)",
      add: "cộng (+)",
      minus: "trừ (-)",
      subtract: "trừ (-)",
      multiply: "nhân (×)",
      times: "nhân (×)",
      divide: "chia (÷)"
    };
    
    const typeVN = translations[action.type] || action.type;
    const colorVN = action.color ? translations[action.color] || action.color : "";
    
    actionDesc += ` → (${typeVN}${action.count ? ` ${action.count} lần` : ""}${colorVN ? ` ${colorVN}` : ""})`;
    return actionDesc;
  })
  .join("\n")}

Total actions needed: ${actions.length}
================================
`;
    } else if (context.challenge.solutionJson) {
      solutionSection = `
⚠️ Expected solution exists but has no "actions" array.
Full solution JSON:
${JSON.stringify(context.challenge.solutionJson, null, 2)}
`;
    } else {
      solutionSection = `
⚠️ No expected solution available. Provide general guidance based on challenge description only.
`;
    }

    return `
📝 === CHALLENGE INFO ===
Title: ${context.challenge.title}
Description: ${context.challenge.description}
Difficulty: ${context.challenge.difficulty || "Unknown"}
========================
${solutionSection}
👤 === STUDENT'S ATTEMPT ===
- Attempt Number: ${context.attemptCount}
- Status: ${context.submission.status}
${context.submission.errorMessage ? `- Error: ${context.submission.errorMessage}` : ""}

${context.submission.generatedCode ? `📄 Student's Code:
${context.submission.generatedCode}
` : "⚠️ No code submitted yet"}

${context.submission.testResults && context.submission.testResults.length > 0 ? `🧪 Test Results:
${JSON.stringify(context.submission.testResults, null, 2)}
` : ""}

${context.previousHints && context.previousHints.length > 0 ? `💡 Previous Hints Given:
${context.previousHints.map((h, i) => `${i + 1}. ${h}`).join("\n")}
` : ""}
==============================

🎓 YOUR TASK:
1. COMPARE the expected solution actions with student's code
2. IDENTIFY what specific actions are missing or incorrect
3. GIVE a CONCRETE hint about what action(s) to add/fix
4. Use Vietnamese and be encouraging
5. DO NOT reveal the complete solution, but BE SPECIFIC about next steps
`;
  }

  /**
   * Determine hint level based on attempt count
   */
  private determineHintLevel(
    attemptCount: number
  ): "conceptual" | "algorithmic" | "detailed" {
    if (attemptCount <= 2) {
      return "conceptual";
    } else if (attemptCount <= 5) {
      return "algorithmic";
    } else {
      return "detailed";
    }
  }
}

export const solutionHintService = new SolutionHintService();
