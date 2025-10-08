/**
 * Lesson Hero Section - Contains hero banner with dynamic terminal preview
 * Shows lesson information in terminal format with code examples
 */

import React from "react";
import { Box, Grid, Typography, Button, Container } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useLocales } from "../../../hooks";

interface LessonInfo {
  id: string;
  title: string;
  content?: string;
  order: number;
}

interface LessonHeroSectionProps {
  currentLessonInfo: LessonInfo | null;
  onBackToCourse?: () => void;
}

const LessonHeroSection: React.FC<LessonHeroSectionProps> = ({
  currentLessonInfo,
  onBackToCourse,
}) => {
  const { translate } = useLocales();
  // Generate dynamic terminal content based on current lesson
  const getTerminalContentForLesson = (lessonInfo: LessonInfo | null) => {
    if (!lessonInfo) {
      return {
        title: translate("lessons.LoadingLesson"),
        description: translate("lessons.PleaseWait"),
        code: [
          translate("lessons.LoadingCode"),
          'console.log("Loading lesson data...");',
        ],
      };
    }

    const lessonTitle =
      lessonInfo.title || translate("lessons.DefaultLessonTitle");
    const lessonContent =
      lessonInfo.content || translate("lessons.DefaultLessonContent");

    // Split lesson content into sentences for terminal display
    const contentLines = lessonContent
      .split(/[.!?]\s+/) // Split by sentence endings
      .filter((line) => line.trim().length > 0)
      .slice(0, 5) // Take first 5 sentences
      .map((line) => line.trim());

    // Generate code with actual lesson information
    const generateLessonCode = (title: string, lines: string[]) => {
      const code = [
        translate("lessons.LessonTitle", { title }),
        translate("lessons.WelcomeToLesson", { title }),
        "",
        translate("lessons.LessonContent"),
      ];

      // Add lesson content as comments and console.log statements
      lines.forEach((line, index) => {
        code.push(`// ${line}`);
        if (index < 3) {
          // Only add console.log for first 3 lines to avoid too long
          code.push(
            `console.log("${index + 1}. ${line.substring(0, 50)}${
              line.length > 50 ? "..." : ""
            }");`
          );
        }
        if (index < lines.length - 1) {
          code.push("");
        }
      });

      // Add some interactive code based on lesson type
      code.push(
        "",
        translate("lessons.LearningGoals"),
        "function startLesson() {",
        '  console.log("Robot sẵn sàng học bài mới!");',
        `  console.log("Đang học: ${title}");`,
        "  robot.initialize();",
        '  console.log("Sẵn sàng bắt đầu thử thách!");',
        "}",
        "",
        "startLesson();"
      );

      return code;
    };

    // Return the actual lesson content in terminal format
    return {
      title: lessonTitle,
      description:
        lessonContent.substring(0, 120) +
        (lessonContent.length > 120 ? "..." : ""),
      code: generateLessonCode(lessonTitle, contentLines),
    };
  };

  const terminalContent = getTerminalContentForLesson(currentLessonInfo);

  return (
    <Box sx={{ background: "#f8f9fa", borderBottom: "1px solid #e0e0e0" }}>
      <Container maxWidth="xl">
        <Grid
          container
          spacing={4}
          sx={{
            minHeight: "70vh",
            alignItems: "center",
            py: { xs: 6, md: 8 },
            px: { xs: 2, md: 4 },
          }}
        >
          {/* Back button at top */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
              }}
            >
              {onBackToCourse && (
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={onBackToCourse}
                  variant="text"
                  size="small"
                  sx={{
                    color: "#6b7280",
                    fontSize: "0.875rem",
                    py: 1,
                    px: 1.5,
                    textTransform: "none",
                    borderRadius: "8px",
                    "&:hover": {
                      color: "#22c55e",
                      backgroundColor: "rgba(34, 197, 94, 0.05)",
                    },
                  }}
                >
                  {translate("lessons.BackToCourse")}
                </Button>
              )}
            </Box>
          </Grid>

          {/* Terminal Preview - Full Width */}
          <Grid item xs={12}>
            <Box>
              <Box
                sx={{
                  background: "#1e1e1e", // Darker background for better contrast
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                  border: "1px solid #3a3a3a",
                  maxWidth: "100%",
                  minHeight: "500px",
                }}
              >
                {/* Terminal Header */}
                <Box
                  sx={{
                    background: "#181818", // Darker header
                    p: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    borderBottom: "1px solid #333",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: "#ff5f57",
                      }}
                    />
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: "#ffbd2e",
                      }}
                    />
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: "#28ca42",
                      }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.6)",
                      ml: 1,
                      fontFamily: "'SF Mono', 'Monaco', 'Fira Code', monospace",
                      fontSize: "0.75rem",
                    }}
                  >
                    {currentLessonInfo?.title || "lesson"}.js
                  </Typography>
                </Box>

                {/* Terminal Content */}
                <Box
                  sx={{
                    p: 4,
                    fontFamily:
                      "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                    fontSize: { xs: "13px", md: "15px" },
                    lineHeight: 1.7,
                    minHeight: "400px",
                    color: "#F8F8F2", // Brighter base text color
                    backgroundColor: "#282A36", // Dracula theme background
                  }}
                >
                  {terminalContent.code.map((line, index) => (
                    <Box key={index} sx={{ mb: line === "" ? 1 : 0.5 }}>
                      {line === "" ? (
                        <Box sx={{ height: "1em" }} />
                      ) : line.startsWith("//") ? (
                        <span style={{ color: "#6A9955" }}>{line}</span> // Brighter green for comments
                      ) : (
                        <Box component="span">
                          {/* Parse and style the JavaScript code */}
                          {line.split(/\b/).map((part, partIndex) => {
                            const jsKeywords = [
                              "const",
                              "let",
                              "var",
                              "function",
                              "if",
                              "else",
                              "for",
                              "while",
                              "switch",
                              "case",
                              "break",
                              "return",
                              "repeat",
                              "class",
                              "import",
                              "export",
                              "extends",
                              "new",
                              "try",
                              "catch",
                              "finally",
                              "throw",
                              "await",
                              "async",
                            ];
                            const jsMethods = [
                              "console.log",
                              "moveForward",
                              "turnLeft",
                              "turnRight",
                              "collect",
                              "initialize",
                              "setTimeout",
                              "setInterval",
                              "forEach",
                              "map",
                              "filter",
                              "reduce",
                              "push",
                              "pop",
                            ];
                            const jsObjects = [
                              "console",
                              "robot",
                              "Math",
                              "Array",
                              "Object",
                              "String",
                              "Number",
                              "Boolean",
                              "Date",
                            ];

                            if (jsKeywords.includes(part)) {
                              // Keywords - bright pink/purple
                              return (
                                <span
                                  key={partIndex}
                                  style={{ color: "#FF79C6" }}
                                >
                                  {part}
                                </span>
                              );
                            } else if (jsObjects.includes(part)) {
                              // Objects - coral red
                              return (
                                <span
                                  key={partIndex}
                                  style={{ color: "#FF5555" }}
                                >
                                  {part}
                                </span>
                              );
                            } else if (
                              jsMethods.some((method) => part.includes(method))
                            ) {
                              // Methods - cyan blue
                              return (
                                <span
                                  key={partIndex}
                                  style={{ color: "#8BE9FD" }}
                                >
                                  {part}
                                </span>
                              );
                            } else if (part.match(/^["'].*["']$/)) {
                              // Strings - bright green
                              return (
                                <span
                                  key={partIndex}
                                  style={{ color: "#50FA7B" }}
                                >
                                  {part}
                                </span>
                              );
                            } else if (part.match(/^\d+$/)) {
                              // Numbers - orange
                              return (
                                <span
                                  key={partIndex}
                                  style={{ color: "#FFB86C" }}
                                >
                                  {part}
                                </span>
                              );
                            } else if (
                              [
                                "=",
                                "==",
                                "===",
                                "!",
                                "&&",
                                "||",
                                "+",
                                "-",
                                "*",
                                "/",
                                "%",
                                ">",
                                "<",
                                ">=",
                                "<=",
                                "?",
                                ":",
                              ].includes(part)
                            ) {
                              // Operators - bright purple
                              return (
                                <span
                                  key={partIndex}
                                  style={{ color: "#BD93F9" }}
                                >
                                  {part}
                                </span>
                              );
                            } else if (
                              [
                                "true",
                                "false",
                                "null",
                                "undefined",
                                "NaN",
                              ].includes(part)
                            ) {
                              // Literals - coral red
                              return (
                                <span
                                  key={partIndex}
                                  style={{ color: "#FF5555" }}
                                >
                                  {part}
                                </span>
                              );
                            } else {
                              // Default text - off white
                              return (
                                <span
                                  key={partIndex}
                                  style={{ color: "#F8F8F2" }}
                                >
                                  {part}
                                </span>
                              );
                            }
                          })}
                        </Box>
                      )}
                    </Box>
                  ))}

                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 18,
                        bgcolor: "#8BE9FD", // Bright cyan cursor
                        animation: "blink 1s infinite",
                        "@keyframes blink": {
                          "0%, 50%": { opacity: 1 },
                          "51%, 100%": { opacity: 0 },
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LessonHeroSection;
export type { LessonInfo };
