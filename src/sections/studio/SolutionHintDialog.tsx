import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";
import BlocksWorkspace from "./BlocksWorkspace";
import { axiosClient } from "axiosClient";
import { ROUTES_API_CHALLENGE } from "constants/routesApiKeys";

interface SolutionHintDialogProps {
  open: boolean;
  onClose: () => void;
  challengeId?: string | null;
}

export default function SolutionHintDialog({
  open,
  onClose,
  challengeId,
}: SolutionHintDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [program, setProgram] = useState<any | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchSolution() {
      if (!open) return;
      if (!challengeId) {
        setError("Không xác định được challenge hiện tại.");
        setProgram(null);
        return;
      }
      setLoading(true);
      setError(null);
      setProgram(null);
      try {
        const url = ROUTES_API_CHALLENGE.SOLUTION(challengeId);
        const res = await axiosClient.get(url);

        // 🔍 Debug: Log full response
        console.log("🔍 [SolutionHintDialog] Full API Response:", res);
        console.log("🔍 [SolutionHintDialog] res.data:", res.data);
        console.log("🔍 [SolutionHintDialog] res.data.data:", res.data?.data);

        const raw: string | undefined = res?.data?.data;
        if (!raw || typeof raw !== "string") {
          console.error("❌ [SolutionHintDialog] Invalid raw data:", {
            raw,
            type: typeof raw,
          });
          throw new Error("Solution trống hoặc không đúng định dạng");
        }

        console.log("📝 [SolutionHintDialog] Raw JSON string:", raw);

        // Try parse various shapes:
        // 1) Envelope { data: { program } }
        // 2) Direct program { actions: [...] }
        // 3) Array of actions [...]
        // 4) Single action object {type:..., ...}
        let parsed: any = null;
        try {
          parsed = JSON.parse(raw);
          console.log("✅ [SolutionHintDialog] Parsed JSON:", parsed);
        } catch (e) {
          console.warn(
            "⚠️ [SolutionHintDialog] First parse failed, trying wrapped array..."
          );
          // Fallback: BE có thể trả chuỗi nhiều object JSON ngăn cách bằng dấu phẩy (không bọc [])
          // Ví dụ: {..},{..}
          // Thử bọc thành mảng và parse lại
          try {
            const wrapped = `[${raw}]`;
            parsed = JSON.parse(wrapped);
            console.log(
              "✅ [SolutionHintDialog] Parsed as wrapped array:",
              parsed
            );
          } catch (e2) {
            console.error("❌ [SolutionHintDialog] All parse attempts failed");
            throw new Error("Solution JSON không hợp lệ");
          }
        }

        let detectedProgram: any | null = null;
        if (parsed && typeof parsed === "object") {
          console.log("🔍 [SolutionHintDialog] Detecting program structure...");
          console.log("  - Has data.program?", !!parsed?.data?.program);
          console.log("  - Has program?", !!parsed?.program);
          console.log("  - Has actions array?", Array.isArray(parsed?.actions));
          console.log("  - Is array?", Array.isArray(parsed));
          console.log("  - Has type field?", !!parsed?.type);

          if (parsed?.data?.program) {
            console.log("  → Using data.program");
            detectedProgram = parsed.data.program;
          } else if (parsed?.program) {
            console.log("  → Using program");
            detectedProgram = parsed.program;
          } else if (Array.isArray(parsed?.actions)) {
            console.log("  → Using parsed as program (has actions)");
            detectedProgram = parsed;
          } else if (Array.isArray(parsed)) {
            console.log("  → Wrapping array as actions");
            detectedProgram = { actions: parsed };
          } else if (parsed?.type) {
            console.log("  → Wrapping single action");
            // Single action object -> wrap to actions
            detectedProgram = { actions: [parsed] };
          }
        }

        console.log(
          "🎯 [SolutionHintDialog] Detected program:",
          detectedProgram
        );

        if (!cancelled) {
          if (detectedProgram && Array.isArray(detectedProgram.actions)) {
            // ✅ Normalize program structure - add missing fields if needed
            const normalizedProgram = {
              version: detectedProgram.version || "1.0.0",
              programName: detectedProgram.programName || "solution_program",
              actions: detectedProgram.actions,
              functions: detectedProgram.functions || [],
            };
            console.log(
              "✅ [SolutionHintDialog] Normalized program:",
              normalizedProgram
            );
            console.log("📊 [SolutionHintDialog] Program stats:", {
              version: normalizedProgram.version,
              programName: normalizedProgram.programName,
              actionsCount: normalizedProgram.actions.length,
              functionsCount: normalizedProgram.functions.length,
            });
            setProgram(normalizedProgram);
          } else {
            console.error(
              "❌ [SolutionHintDialog] Failed to detect valid program structure"
            );
            setError(
              "Không thể chuyển đổi Solution thành chương trình khối hiển thị."
            );
          }
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Tải solution thất bại");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchSolution();
    return () => {
      cancelled = true;
    };
  }, [open, challengeId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Gợi ý lời giải</DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {loading && (
          <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
            <CircularProgress size={24} />
            <Typography>Đang tải gợi ý...</Typography>
          </Box>
        )}
        {!loading && error && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
        {!loading && !error && program && (
          <Box sx={{ height: 500 }}>
            <BlocksWorkspace
              key={`hint-${challengeId}-${program?.actions?.length || 0}`}
              initialProgramActionsJson={program}
              readOnly={true}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
