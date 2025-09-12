import { Box } from "@mui/material";

interface CodeContentProps {
  code: string;
  language: "python" | "javascript" | "markdown" | "text";
}

export default function CodeContent({ code, language }: CodeContentProps) {
  const getCodeStyles = () => {
    if (language === "python" || language === "javascript") {
      return {
        height: "100%",
        fontFamily: "'JetBrains Mono', 'Consolas', 'Monaco', monospace",
        fontSize: "13px",
        bgcolor: "#0f172a",
        color: "#e2e8f0",
        p: 3,
        overflow: "auto",
        whiteSpace: "pre-wrap" as const,
        lineHeight: 1.6,
        "& .keyword": { color: "#c084fc" },
        "& .string": { color: "#34d399" },
        "& .comment": { color: "#64748b" },
        "& .function": { color: "#60a5fa" },
      };
    } else {
      // Markdown, text content
      return {
        height: "100%",
        p: 3,
        overflow: "auto",
        whiteSpace: "pre-wrap" as const,
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "13px",
        lineHeight: 1.6,
        color: "#334155",
        bgcolor: "#ffffff",
      };
    }
  };

  return <Box sx={getCodeStyles()}>{code}</Box>;
}


