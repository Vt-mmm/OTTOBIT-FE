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
        fontSize: "16px", // Tăng từ 13px lên 16px
        bgcolor: "#ffffff", // Đổi từ tối sang trắng
        color: "#1e293b", // Chữ màu tối cho background trắng
        p: 3,
        overflow: "auto",
        whiteSpace: "pre-wrap" as const,
        lineHeight: 1.8, // Tăng line height cho dễ đọc
        border: "1px solid #e2e8f0", // Thêm border nhẹ
        "& .keyword": { color: "#7c3aed" }, // Tím đậm cho keyword
        "& .string": { color: "#059669" }, // Xanh lá đậm cho string
        "& .comment": { color: "#64748b" }, // Xám cho comment
        "& .function": { color: "#2563eb" }, // Xanh dương đậm cho function
      };
    } else {
      // Markdown, text content
      return {
        height: "100%",
        p: 3,
        overflow: "auto",
        whiteSpace: "pre-wrap" as const,
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "16px", // Tăng từ 13px lên 16px
        lineHeight: 1.8,
        color: "#334155",
        bgcolor: "#ffffff",
      };
    }
  };

  return <Box sx={getCodeStyles()}>{code}</Box>;
}


