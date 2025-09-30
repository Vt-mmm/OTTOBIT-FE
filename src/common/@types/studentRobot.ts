// StudentRobot entity interfaces - Student's owned/activated robots
export interface StudentRobot {
  id: string;
  studentId: string;
  robotId: string;
  activationDate: string;
  serialNumber?: string;
  activationCodeId?: string;
  customSettings?: {
    name?: string;
    color?: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;

  // Navigation properties (if populated by BE)
  student?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  robot?: {
    id: string;
    name: string;
    model: string;
    brand: string;
    imageUrl?: string;
    description?: string;
  };
}

// Request types
export interface UpdateStudentRobotSettingsRequest {
  customSettings?: {
    name?: string;
    color?: string;
    avatar?: string;
  };
}

// Response types
export interface StudentRobotResult extends StudentRobot {}

export interface MyRobotsResponse {
  items: StudentRobotResult[];
  total: number;
}

// Helper type for robot status in course context
export interface RobotOwnershipStatus {
  robotId: string;
  isOwned: boolean;
  studentRobotId?: string;
  activationDate?: string;
}