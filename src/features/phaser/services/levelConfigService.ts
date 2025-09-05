export interface Level {
  id: string;
  name: string;
  description: string;
  mapKey: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  objectives: string[];
  recommendedBlocks: string[];
  isUnlocked: boolean;
  isCompleted: boolean;
  bestScore?: number;
  bestTime?: number;
  stars: number; // 0-3 stars
}

export interface LevelProgress {
  levelId: string;
  completed: boolean;
  bestScore: number;
  bestTime: number;
  stars: number;
  completedAt: Date;
}

class LevelConfigService {
  private readonly STORAGE_KEY = "ottobit_level_progress";

  private readonly levelConfigs: Omit<
    Level,
    "isUnlocked" | "isCompleted" | "bestScore" | "bestTime" | "stars"
  >[] = [
    {
      id: "level-1",
      name: "First Steps",
      description: "Learn basic robot movement and navigation",
      mapKey: "basic1",
      difficulty: "beginner",
      objectives: [
        "Move the robot to the green target",
        "Use forward and turn blocks",
        "Complete in under 10 steps",
      ],
      recommendedBlocks: ["ottobit_move_forward", "ottobit_rotate"],
    },
    {
      id: "level-2",
      name: "Battery Hunter",
      description: "Collect your first battery",
      mapKey: "basic2",
      difficulty: "beginner",
      objectives: [
        "Collect 1 green battery",
        "Reach the target position",
        "Use efficient pathfinding",
      ],
      recommendedBlocks: [
        "ottobit_move_forward",
        "ottobit_rotate",
        "ottobit_collect",
      ],
    },
    {
      id: "level-3",
      name: "Simple Obstacles",
      description: "Navigate around your first obstacles",
      mapKey: "basic3",
      difficulty: "beginner",
      objectives: [
        "Avoid walls and obstacles",
        "Collect 2 batteries",
        "Find the optimal path",
      ],
      recommendedBlocks: [
        "ottobit_move_forward",
        "ottobit_rotate",
        "ottobit_collect",
      ],
    },
    {
      id: "level-4",
      name: "Multiple Targets",
      description: "Collect multiple items efficiently",
      mapKey: "basic4",
      difficulty: "intermediate",
      objectives: [
        "Collect 3 different colored batteries",
        "Plan your route carefully",
        "Complete in under 20 steps",
      ],
      recommendedBlocks: [
        "ottobit_move_forward",
        "ottobit_rotate",
        "ottobit_collect",
        "ottobit_collect_green",
      ],
    },
    {
      id: "level-5",
      name: "Loop Master",
      description: "Use loops to optimize your code",
      mapKey: "basic5",
      difficulty: "intermediate",
      objectives: [
        "Use repeat blocks effectively",
        "Collect all batteries in a pattern",
        "Keep code under 8 blocks",
      ],
      recommendedBlocks: [
        "ottobit_repeat",
        "ottobit_move_forward",
        "ottobit_rotate",
        "ottobit_collect",
      ],
    },
    {
      id: "level-6",
      name: "Conditional Logic",
      description: "Make decisions with if/else blocks",
      mapKey: "basic6",
      difficulty: "intermediate",
      objectives: [
        "Use if/else blocks for decision making",
        "Adapt to different scenarios",
        "Complete all variants",
      ],
      recommendedBlocks: [
        "ottobit_if",
        "ottobit_while",
        "ottobit_comparison",
        "ottobit_move_forward",
      ],
    },
    {
      id: "level-7",
      name: "Complex Maze",
      description: "Navigate through a challenging maze",
      mapKey: "basic7",
      difficulty: "advanced",
      objectives: [
        "Solve the complete maze",
        "Use advanced programming concepts",
        "Optimize for both time and steps",
      ],
      recommendedBlocks: [
        "ottobit_while",
        "ottobit_if",
        "ottobit_comparison",
        "ottobit_variable_i",
      ],
    },
    {
      id: "level-8",
      name: "Master Challenge",
      description: "The ultimate programming challenge",
      mapKey: "basic8",
      difficulty: "expert",
      objectives: [
        "Combine all learned concepts",
        "Achieve perfect efficiency",
        "Earn 3 stars",
      ],
      recommendedBlocks: [
        "ottobit_while",
        "ottobit_if",
        "ottobit_repeat",
        "ottobit_variable_i",
        "ottobit_comparison",
      ],
    },
  ];

  getAllLevels(): Level[] {
    const progress = this.getProgress();

    return this.levelConfigs.map((config, index) => ({
      ...config,
      isUnlocked:
        index === 0 ||
        progress[this.levelConfigs[index - 1].id]?.completed ||
        false,
      isCompleted: progress[config.id]?.completed || false,
      bestScore: progress[config.id]?.bestScore,
      bestTime: progress[config.id]?.bestTime,
      stars: progress[config.id]?.stars || 0,
    }));
  }

  getLevelById(levelId: string): Level | null {
    return this.getAllLevels().find((level) => level.id === levelId) || null;
  }

  getLevelByMapKey(mapKey: string): Level | null {
    return this.getAllLevels().find((level) => level.mapKey === mapKey) || null;
  }

  getUnlockedLevels(): Level[] {
    return this.getAllLevels().filter((level) => level.isUnlocked);
  }

  getCompletedLevels(): Level[] {
    return this.getAllLevels().filter((level) => level.isCompleted);
  }

  completeLevel(
    levelId: string,
    score: number,
    time: number,
    stars: number = 1
  ) {
    const progress = this.getProgress();
    const existingProgress = progress[levelId];

    progress[levelId] = {
      levelId,
      completed: true,
      bestScore: existingProgress
        ? Math.max(score, existingProgress.bestScore)
        : score,
      bestTime: existingProgress
        ? Math.min(time, existingProgress.bestTime)
        : time,
      stars: existingProgress ? Math.max(stars, existingProgress.stars) : stars,
      completedAt: new Date(),
    };

    this.saveProgress(progress);
  }

  resetProgress() {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private getProgress(): Record<string, LevelProgress> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  private saveProgress(progress: Record<string, LevelProgress>) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
  }
}

export const levelConfigService = new LevelConfigService();
