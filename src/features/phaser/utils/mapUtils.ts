/**
 * Map utilities for URL-based map selection
 */

import { MapResult } from "../types/map";

export interface LevelData {
  id: string;
  name: string;
  description: string;
  mapKey: string;
  mapResult: MapResult;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  objectives: string[];
  recommendedBlocks: string[];
  category:
    | "basic"
    | "boolean"
    | "variables"
    | "forloop"
    | "conditionals"
    | "functions"
    | "whileloop"
    | "repeat";
  order: number;
  isUnlocked: boolean;
  isCompleted: boolean;
}

/**
 * Convert mapKey to LevelData
 * Follows same logic as LevelMapSelector.tsx processedLevels
 */
export function mapKeyToLevelData(
  mapKey: string,
  mapResult: MapResult
): LevelData | null {
  // Parse mapKey pattern: "basic1", "boolean3", "forloop2"
  const match = mapKey.match(/^([a-z]+)(\d+)$/i); // Case-insensitive match
  if (!match) {
    return null;
  }

  const [, categoryStr, numberStr] = match;
  const order = parseInt(numberStr);
  
  // Normalize category to lowercase for consistent matching
  const normalizedCategory = categoryStr.toLowerCase();

  // Map category string to our types
  let category: LevelData["category"];
  let name: string;
  let description: string;
  let difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  let objectives: string[];
  let recommendedBlocks: string[];

  switch (normalizedCategory) {
    case "basic":
      category = "basic";
      name = `Basic ${order}`;
      description = `Học cách điều khiển robot cơ bản - Map ${order}`;
      objectives = [
        "Di chuyển robot đến vị trí đích",
        "Sử dụng các khối lệnh cơ bản",
      ];
      recommendedBlocks = ["move_forward", "turn_left", "turn_right"];
      difficulty =
        order <= 3 ? "beginner" : order <= 6 ? "intermediate" : "advanced";
      break;

    case "boolean":
      category = "boolean";
      name = `Boolean ${order}`;
      description = `Học cách sử dụng logic Boolean - Map ${order}`;
      objectives = [
        "Sử dụng điều kiện IF/ELSE",
        "Kiểm tra trạng thái môi trường",
        "Tối ưu hóa logic",
      ];
      recommendedBlocks = ["if", "else", "sensor_check", "move_forward"];
      difficulty =
        order <= 3 ? "intermediate" : order <= 6 ? "advanced" : "expert";
      break;

    case "forloop":
    case "forloops": // Backend might return "forloops"
      category = "forloop";
      name = `For Loop ${order}`;
      description = `Học cách sử dụng vòng lặp For - Map ${order}`;
      objectives = [
        "Sử dụng vòng lặp để lặp lại hành động",
        "Tối ưu hóa code với loops",
        "Kết hợp loops với điều kiện",
      ];
      recommendedBlocks = ["for_loop", "move_forward", "if", "sensor_check"];
      difficulty =
        order <= 3 ? "intermediate" : order <= 6 ? "advanced" : "expert";
      break;

    case "variables":
      category = "variables";
      name = `Variables ${order}`;
      description = `Học cách sử dụng biến số - Map ${order}`;
      objectives = [
        "Tạo và sử dụng biến",
        "Lưu trữ và thay đổi giá trị",
        "Kết hợp biến với logic",
      ];
      recommendedBlocks = ["set_variable", "get_variable", "math", "move_forward"];
      difficulty =
        order <= 3 ? "intermediate" : order <= 6 ? "advanced" : "expert";
      break;

    case "conditionals":
      category = "conditionals";
      name = `Conditionals ${order}`;
      description = `Học cách sử dụng điều kiện - Map ${order}`;
      objectives = [
        "Sử dụng điều kiện phức tạp",
        "Kết hợp nhiều điều kiện",
        "Tối ưu hóa logic điều kiện",
      ];
      recommendedBlocks = ["if", "else", "and", "or", "not", "sensor_check"];
      difficulty =
        order <= 3 ? "intermediate" : order <= 6 ? "advanced" : "expert";
      break;

    case "functions":
      category = "functions";
      name = `Functions ${order}`;
      description = `Học cách tạo và sử dụng hàm - Map ${order}`;
      objectives = [
        "Tạo hàm tùy chỉnh",
        "Sử dụng tham số",
        "Tái sử dụng code",
      ];
      recommendedBlocks = ["function", "call_function", "return", "parameter"];
      difficulty =
        order <= 3 ? "advanced" : order <= 6 ? "expert" : "expert";
      break;

    case "whileloop":
    case "whileloops":
      category = "whileloop";
      name = `While Loop ${order}`;
      description = `Học cách sử dụng vòng lặp While - Map ${order}`;
      objectives = [
        "Sử dụng vòng lặp điều kiện",
        "Kết hợp while với sensor",
        "Tránh vòng lặp vô hạn",
      ];
      recommendedBlocks = ["while", "sensor_check", "move_forward", "if"];
      difficulty =
        order <= 3 ? "advanced" : order <= 6 ? "expert" : "expert";
      break;

    case "repeat":
      category = "repeat";
      name = `Repeat ${order}`;
      description = `Học cách sử dụng lặp lại - Map ${order}`;
      objectives = [
        "Sử dụng khối repeat",
        "Lặp lại hành động cố định",
        "Tối ưu hóa với repeat",
      ];
      recommendedBlocks = ["repeat", "move_forward", "turn_left", "turn_right"];
      difficulty =
        order <= 3 ? "beginner" : order <= 6 ? "intermediate" : "advanced";
      break;

    default:
      return null;
  }

  // Calculate unlock status (simplified logic)
  const isFirstLevel = category === "basic" && order === 1;
  const isUnlocked = isFirstLevel; // TODO: Implement proper unlock logic

  return {
    id: `${category}-${order}`,
    name,
    description,
    mapKey: mapResult.key,
    mapResult,
    difficulty,
    objectives,
    recommendedBlocks,
    category,
    order,
    isUnlocked,
    isCompleted: false, // TODO: Load from progress
  };
}

/**
 * Convert LevelData to URL path
 */
export function levelDataToUrl(level: LevelData): string {
  return `/studio/${level.mapKey}`;
}

/**
 * Save current level to localStorage for persistence
 */
export function saveCurrentLevel(level: LevelData): void {
  try {
    localStorage.setItem(
      "ottobit_current_level",
      JSON.stringify({
        mapKey: level.mapKey,
        id: level.id,
        name: level.name,
      })
    );
  } catch (error) {
    console.warn("Failed to save level to localStorage:", error);
  }
}

/**
 * Load current level from localStorage
 */
export function loadCurrentLevel(): {
  mapKey: string;
  id: string;
  name: string;
} | null {
  try {
    const saved = localStorage.getItem("ottobit_current_level");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn("Failed to load level from localStorage:", error);
  }
  return null;
}

/**
 * Clear saved level from localStorage
 */
export function clearSavedLevel(): void {
  try {
    localStorage.removeItem("ottobit_current_level");
  } catch (error) {
    console.warn("Failed to clear saved level:", error);
  }
}
