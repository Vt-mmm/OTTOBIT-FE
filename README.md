# Ottobit — Building a Blended Learning Environment for Programming Ottobit Robots

Abbreviation: Ottobit

---

## Overview

In the era of digital transformation, there is a growing demand for STEM skills, especially programming and robotics. However, traditional text-based programming presents a steep learning curve that can discourage students at a critical stage of career orientation. This reveals a significant gap in the educational market for an integrated platform that bridges intuitive, visual programming with real-world, text-based coding on physical hardware.

This project aims to develop an advanced educational platform that equips students with essential programming and robotics skills. The platform features a visual, block-based coding system and a key innovation: seamless conversion of blocks into Python and JavaScript, deployable to a physical micro:bit-based Ottobit robot. Through structured learning paths, real-time simulations, and gamified modes, the system fosters computational thinking, problem solving, and creativity.

### 2) Objectives

- Lower the entry barrier to programming via visual blocks while ensuring a smooth transition to text-based code (Python/JavaScript).
- Provide a complete learning journey: learn → simulate → deploy to real robot → evaluate.
- Support scalable, secure, and accessible usage across web and mobile.

## 🛠️ Tech Stack

- Frontend (Web): React 18, Vite, TypeScript, Redux Toolkit, React Router v6, MUI v5, Axios
- Mobile: Flutter (cross-platform)
- Backend: .NET (REST APIs), JWT Authentication, Role-Based Authorization
- Realtime & Notifications: Firebase Cloud Messaging (proposed)
- Storage & Media: Firebase Storage (proposed)
- Payments: PayOS (proposed)
- Robotics: BBC micro:bit (USB/Bluetooth), Ottobit robot chassis and sensors
- Simulation: Custom 2D/3D simulator; potential WebGL/Three.js for 3D
- Dev Tooling: ESLint, Prettier, GitHub Actions (CI/CD) [optional]

## Features

- Visual, block-based IDE tailored for beginners
- One-click conversion: Blocks → Python/JavaScript
- Upload generated code to micro:bit-powered Ottobit robots (USB/Bluetooth)
- 2D/3D simulator with maps, obstacles, sensor visualization
- Structured courses by level; guided exercises; auto grading
- Progress tracking, scoring, certificates upon completion
- Robot manager: sensor config, naming, UI customization
- Map & mission builder (drag-and-drop); integrate into lessons or challenges
- Gamification: XP, badges, leaderboards
- AI assistant (extended): code suggestions, instant feedback, chatbot/video advisor
- Commerce (extended): package system (e.g., Unlimited Hearts), pricing, durations
- Third-party integrations: PayOS, Firebase (notifications & media), AI/ML services

### 4) Functional Requirements

#### 4.1. User

- Student login system.
- Track learning progress and scores.
- Automatic assignment grading.

#### 4.2. Online Programming IDE

- Drag-and-drop programming interface (Blockly or MakeCode).
- Integrated Ottobit control command library (move, turn, play sound, sensors, etc.).
- Real-time display of equivalent Python and JavaScript code.
- Syntax checking and error suggestions.

#### 4.3. Ottobit Simulator

- Simulate Ottobit robot movement based on code from the IDE.
- 2D/3D interface with map, obstacles, and sensor visualization.
- Support mission types: reach goal line, avoid obstacles, etc.

#### 4.4. Course & Lesson Manager

- Course system categorized by level: Beginner – Intermediate – Advanced.
- Each lesson includes theory videos, simulation practices, and guided exercises.
- Automatic progress tracking, scoring, and certification upon completion.

#### 4.5. Offline Robot Integration

- Download code from the IDE to real robots (micro:bit).
- Connection guide via Bluetooth/USB.
- Test movement and sensors on physical Ottobit robots.

#### 4.6. Robot Manager

- Manage robots: sensor configuration, robot name, interface customization.
- Customize colors, naming, and simulation features.
- Guides for 3D printing and assembling robot components.

#### 4.7. Map & Mission Engine

- Create virtual maps for robot missions.
- Drag-and-drop goal lines, sensors, obstacles, etc.
- Integrate maps into lessons or standalone challenges.

#### 4.8. Gamification & Certification

- XP system, badges, and student leaderboard.
- Certificates based on skills or course completion.

#### 4.9. AI & Supporter (Extended)

- AI-assisted learning: code suggestions, instant feedback.
- Advisors available via chatbot or video call.
- Support home-based learning models.

#### 4.10. E-commerce & Hardware Integration (Extended)

- Hardware and accessories integration for Ottobit robots.
- (Optional) Commerce module for packages, kits, and learning plans.

#### 4.11. Package System

- Offer packages (e.g., Unlimited Hearts) valid for set durations (7/30 days).
- Display available packages with price, duration, and benefits.
- Users can view active package and expiration date in their profile.

#### 4.12. Third-party Integrations

- Payment gateway (e.g., PayOS): manage transactions.
- Notification services (e.g., Firebase): real-time alerts and in-app notifications.
- Media service (e.g., Firebase Storage): image/file upload and delivery.
- AI services: external AI/ML models/APIs for map generation and recommendations.

### 5) Non-functional Requirements

#### Security

- Data Integrity: ensure accuracy, encryption, and consistency.
- Authentication & Authorization: robust mechanisms for identity and access control.
- Access Control: role- and permission-based access to sensitive data.

#### Performance & Reliability

- Response Time: fast UI interactions and system processes.
- Scalability: handle increasing workloads and user numbers efficiently.
- Reliability: high availability and fault tolerance; proper error handling.

#### Usability

- Consistent UI and intuitive UX across the application.

#### Maintainability

- Code quality with standards and best practices.
- Modular design for maintainability and updates.
- Clear, comprehensive documentation.

## Architecture

```mermaid
flowchart LR
  U[Student/User] -->|Web| FE[React Frontend]
  U2[Student/User] -->|Mobile| FL[Flutter App]
  FE -->|REST APIs| BE[.NET Backend]
  FL -->|REST APIs| BE

  subgraph Frontend
    IDE[Block-based IDE] --> CG[CodeGen Blocks→Python/JS]
    FE --> SIM[Robot Simulator (2D/3D)]
  end

  CG --> UP[Uploader USB/Bluetooth]
  UP --> RB[Ottobit Robot (micro:bit)]

  subgraph Backend
    BE --> DB[(Relational DB)]
    BE --> PAY[PayOS]
    BE --> FCM[Firebase Notifications]
    BE --> FS[Firebase Storage]
    BE --> AI[AI/ML Services]
  end
```

Notes:

- Authentication via JWT; role-based authorization on APIs
- Media assets stored on Firebase Storage (proposed)
- Notifications via FCM; payments via PayOS (proposed)

### Getting Started (Web Frontend — this repo)

Prerequisites: Node.js LTS, npm.

```bash
npm install
npm run dev
```

### Roadmap (High-level)

- MVP: IDE (blocks → Python/JS), simulator, basic courses, upload to micro:bit.
- v1: Gamification, certifications, AI assistant (feedback & hints).
- v2: Advanced simulations (3D), package system, expanded commerce/hardware kits.

### License

TBD.
