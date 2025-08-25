import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import {
  ContentCopy as CopyIcon,
  PlayArrow as RunIcon,
} from "@mui/icons-material";
import { useState } from "react";

interface CodeContentProps {
  code: string;
  language: "python" | "javascript" | "markdown" | "text";
}

export default function CodeContent({ code, language }: CodeContentProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  const applyCodeHighlight = (codeText: string, lang: string) => {
    if (!codeText) return codeText;

    // Escape HTML first to prevent XSS
    let highlightedCode = codeText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    if (lang === "python") {
      // Python syntax highlighting
      highlightedCode = highlightedCode
        // Comments
        .replace(
          /(#.*)/g,
          '<span style="color: #64748b; font-style: italic;">$1</span>'
        )
        // Strings (handle both single and double quotes)
        .replace(
          /("(?:[^"\\]|\\.)*")/g,
          '<span style="color: #34d399;">$1</span>'
        )
        .replace(
          /('(?:[^'\\]|\\.)*')/g,
          '<span style="color: #34d399;">$1</span>'
        )
        // Keywords
        .replace(
          /\b(import|from|def|class|if|else|elif|for|while|try|except|with|as|return|yield|break|continue|pass|lambda|and|or|not|in|is|True|False|None|print)\b/g,
          '<span style="color: #c084fc; font-weight: bold;">$1</span>'
        )
        // Functions calls
        .replace(/\b(\w+)(?=\()/g, '<span style="color: #60a5fa;">$1</span>')
        // Numbers
        .replace(/\b(\d+\.?\d*)\b/g, '<span style="color: #f97316;">$1</span>');
    } else if (lang === "javascript") {
      // JavaScript syntax highlighting
      highlightedCode = highlightedCode
        // Comments
        .replace(
          /(\/\/.*)/g,
          '<span style="color: #64748b; font-style: italic;">$1</span>'
        )
        .replace(
          /(\/\*[\s\S]*?\*\/)/g,
          '<span style="color: #64748b; font-style: italic;">$1</span>'
        )
        // Strings
        .replace(
          /("(?:[^"\\]|\\.)*")/g,
          '<span style="color: #34d399;">$1</span>'
        )
        .replace(
          /('(?:[^'\\]|\\.)*')/g,
          '<span style="color: #34d399;">$1</span>'
        )
        .replace(
          /(`(?:[^`\\]|\\.)*`)/g,
          '<span style="color: #34d399;">$1</span>'
        )
        // Keywords
        .replace(
          /\b(const|let|var|function|async|await|return|if|else|for|while|do|try|catch|finally|throw|new|this|class|extends|import|export|from|default|case|switch|break|continue|true|false|null|undefined|console)\b/g,
          '<span style="color: #c084fc; font-weight: bold;">$1</span>'
        )
        // Function calls
        .replace(/\b(\w+)(?=\()/g, '<span style="color: #60a5fa;">$1</span>')
        // Numbers
        .replace(/\b(\d+\.?\d*)\b/g, '<span style="color: #f97316;">$1</span>');
    }

    return highlightedCode;
  };

  const getLanguageColor = () => {
    switch (language) {
      case "python":
        return "#3776ab";
      case "javascript":
        return "#f7df1e";
      default:
        return "#64748b";
    }
  };

  const getLanguageIcon = () => {
    switch (language) {
      case "python":
        return "🐍";
      case "javascript":
        return "🟡";
      default:
        return "📝";
    }
  };

  if (language === "python" || language === "javascript") {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#0f172a",
          position: "relative",
        }}
      >
        {/* Header with language info and actions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 2,
            bgcolor: "#1e293b",
            borderBottom: "1px solid #334155",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: "16px" }}>
              {getLanguageIcon()}
            </Typography>
            <Typography
              sx={{
                color: getLanguageColor(),
                fontWeight: 600,
                fontSize: "14px",
                textTransform: "capitalize",
              }}
            >
              {language} Code
            </Typography>
            <Box
              sx={{
                bgcolor: "rgba(34, 197, 94, 0.1)",
                color: "#22c55e",
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                fontSize: "11px",
                fontWeight: 500,
              }}
            >
              Generated
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title={copied ? "Copied!" : "Copy Code"}>
              <IconButton
                onClick={handleCopy}
                size="small"
                sx={{
                  color: copied ? "#22c55e" : "#94a3b8",
                  "&:hover": {
                    bgcolor: "rgba(148, 163, 184, 0.1)",
                    color: "#22c55e",
                  },
                }}
              >
                <CopyIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Run Code">
              <IconButton
                size="small"
                sx={{
                  color: "#94a3b8",
                  "&:hover": {
                    bgcolor: "rgba(148, 163, 184, 0.1)",
                    color: "#22c55e",
                  },
                }}
              >
                <RunIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Code content with syntax highlighting */}
        <Box
          sx={{
            flex: 1,
            fontFamily:
              "'JetBrains Mono', 'Consolas', 'Monaco', 'Courier New', monospace",
            fontSize: "13px",
            color: "#e2e8f0",
            p: 3,
            overflow: "auto",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            "& span": {
              whiteSpace: "pre-wrap",
            },
          }}
          dangerouslySetInnerHTML={{
            __html: applyCodeHighlight(code, language),
          }}
        />

        {/* Status bar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 1,
            bgcolor: "#1e293b",
            borderTop: "1px solid #334155",
            fontSize: "11px",
            color: "#64748b",
          }}
        >
          <Typography sx={{ fontSize: "11px", color: "#64748b" }}>
            Lines: {code.split("\n").length} | Characters: {code.length}
          </Typography>
          <Typography sx={{ fontSize: "11px", color: "#64748b" }}>
            Encoding: UTF-8
          </Typography>
        </Box>
      </Box>
    );
  }

  // For markdown and text content
  return (
    <Box
      sx={{
        height: "100%",
        p: 3,
        overflow: "auto",
        whiteSpace: "pre-wrap",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "13px",
        lineHeight: 1.6,
        color: "#334155",
        bgcolor: "#ffffff",
      }}
    >
      {code}
    </Box>
  );
}
