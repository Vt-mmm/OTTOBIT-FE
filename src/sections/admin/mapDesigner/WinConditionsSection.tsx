import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip,
  IconButton,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useNotification } from "hooks/useNotification";
import { useRef, useState, useEffect } from "react";
import { MapCell } from "common/models";
import { MAP_ASSETS } from "sections/admin/mapDesigner/mapAssets.config";
import { GRID_CONFIG } from "sections/admin/mapDesigner/theme.config";
import { THEME_COLORS } from "./theme.config";
import {
  gridToIsometric,
  getIsometricGridDimensions,
  ISOMETRIC_CONFIG,
} from "sections/admin/mapDesigner/isometricHelpers";
import BlocksWorkspace from "sections/studio/BlocksWorkspace";
import { axiosClient } from "axiosClient";
import { ROUTES_API_LESSON } from "constants/routesApiKeys";
import { BlocklyToPhaserConverter } from "../../../features/phaser/services/blocklyToPhaserConverter";

interface WinConditionsSectionProps {
  mapName: string;
  onMapNameChange: (name: string) => void;
  mapDescription: string;
  onMapDescriptionChange: (description: string) => void;
  lessonId: string;
  onLessonIdChange: (id: string) => void;
  order: number;
  onOrderChange: (value: number) => void;
  difficulty: number;
  onDifficultyChange: (value: number) => void;
  mapGrid: MapCell[][];
  onSolutionJsonChange?: (json: string) => void;
  solutionJson?: string | null;
  onChallengeJsonChange?: (json: string) => void;
  challengeJson?: string | null;
}

export default function WinConditionsSection({
  mapName,
  onMapNameChange,
  mapDescription,
  onMapDescriptionChange,
  lessonId,
  onLessonIdChange,
  order,
  onOrderChange,
  difficulty,
  onDifficultyChange,
  mapGrid,
  onSolutionJsonChange,
  solutionJson,
  onChallengeJsonChange,
  challengeJson,
}: WinConditionsSectionProps) {
  const [openSolution, setOpenSolution] = useState(false);
  const [openChallenge, setOpenChallenge] = useState(false);
  const solutionWorkspaceRef = useRef<any>(null);
  const [lessonOptions, setLessonOptions] = useState<
    { id: string; title: string }[]
  >([]);
  // Challenge basic fields
  const [robotX, setRobotX] = useState<number>(0);
  const [robotY, setRobotY] = useState<number>(0);
  const [robotDir] = useState<"north" | "east" | "south" | "west">("east");
  const [minCards, setMinCards] = useState<number>(1);
  const [maxCards, setMaxCards] = useState<number>(12);
  const [selectedStatements, setSelectedStatements] = useState<string[]>([]);
  const [robotImagePath, setRobotImagePath] = useState<string | null>(null);
  const [targetOptions, setTargetOptions] = useState<
    { key: string; label: string; type: "box" | "battery" }[]
  >([]);
  const [selectedTargetKey, setSelectedTargetKey] = useState<string>("");
  const { showNotification: showToast, NotificationComponent: Toast } =
    useNotification({
      anchorOrigin: { vertical: "top", horizontal: "right" },
      autoHideDurationMs: 3000,
    });
  // Battery config state (shown when Map = battery)
  const [batteryTiles, setBatteryTiles] = useState<
    {
      x: number;
      y: number;
      count: number | "";
      type: "yellow" | "red" | "green";
      spread: number | "";
      allowedCollect: boolean;
    }[]
  >([]);
  const [victoryYellow, setVictoryYellow] = useState<number>(0);
  const [victoryRed, setVictoryRed] = useState<number>(0);
  const [victoryGreen, setVictoryGreen] = useState<number>(0);
  const [victoryDescription, setVictoryDescription] = useState<string>("");
  // Prefill statements from incoming challengeJson
  useEffect(() => {
    try {
      if (!challengeJson) return;
      const parsed = JSON.parse(challengeJson);
      if (Array.isArray(parsed?.statement)) {
        setSelectedStatements(parsed.statement as string[]);
      }
      if (typeof parsed?.minCards === "number") {
        setMinCards(parsed.minCards as number);
      }
      if (typeof parsed?.maxCards === "number") {
        setMaxCards(parsed.maxCards as number);
      }
    } catch {}
  }, [challengeJson]);

  // Prefill battery tiles and victory counts from challengeJson
  useEffect(() => {
    try {
      if (!challengeJson) return;
      const parsed = JSON.parse(challengeJson);
      // Auto select target type based on available data when editing
      if (!selectedTargetKey) {
        if (Array.isArray(parsed?.batteries) && parsed.batteries.length > 0) {
          setSelectedTargetKey("battery");
        } else if (Array.isArray(parsed?.boxes) && parsed.boxes.length > 0) {
          setSelectedTargetKey("box");
        }
      }

      // Tiles
      const batteries = Array.isArray(parsed?.batteries)
        ? parsed.batteries
        : [];
      const tilesAccum: ({
        x: number;
        y: number;
        count: number | "";
        type: "yellow" | "red" | "green";
        spread: number | "";
        allowedCollect: boolean;
      } | null)[] = [];
      batteries.forEach((b: any) => {
        const tiles = Array.isArray(b?.tiles) ? b.tiles : [];
        tiles.forEach((t: any) => {
          if (
            typeof t?.x === "number" &&
            typeof t?.y === "number" &&
            typeof t?.count === "number"
          ) {
            const type = String(t?.type || "yellow").toLowerCase();
            const spread = typeof t?.spread === "number" ? t.spread : 1;
            const allowedCollect = Boolean(t?.allowedCollect);
            const typ: "yellow" | "red" | "green" =
              type === "red" ? "red" : type === "green" ? "green" : "yellow";
            tilesAccum.push({
              x: t.x,
              y: t.y,
              count: t.count,
              type: typ,
              spread: spread,
              allowedCollect,
            });
          }
        });
      });
      if (tilesAccum.length) {
        setBatteryTiles(tilesAccum.filter(Boolean) as any);
      }

      // Victory counts + description (battery variant)
      const vt = parsed?.victory?.byType?.[0];
      if (vt) {
        if (typeof vt.yellow === "number") setVictoryYellow(vt.yellow);
        if (typeof vt.red === "number") setVictoryRed(vt.red);
        if (typeof vt.green === "number") setVictoryGreen(vt.green);
      }
      if (typeof parsed?.victory?.description === "string") {
        setVictoryDescription(parsed.victory.description);
      }
    } catch {}
  }, [challengeJson]);
  // Box config state (shown when Map = box)
  const [boxTiles, setBoxTiles] = useState<
    {
      x: number;
      y: number;
      count: number | "";
      spread: number | "";
    }[]
  >([]);
  const [boxVictoryTargets, setBoxVictoryTargets] = useState<
    { x: number; y: number; count: number }[]
  >([]);
  const [boxVictoryDescription, setBoxVictoryDescription] =
    useState<string>("");
  const [boxGlobalSpread, setBoxGlobalSpread] = useState<number | "">(1.2);
  const [openTargetPicker, setOpenTargetPicker] = useState<boolean>(false);
  // Shared diagonal lift/spacing ratios for mini maps (tweak here to align with other maps)
  const MINI_LIFT_RATIO = 0.5;
  const MINI_SPACING_RATIO = 0.51;
  const SHOW_PICK_BORDER = false; // hide original pick border frame in mini map
  const [hoverPicker, setHoverPicker] = useState<{
    row: number;
    col: number;
  } | null>(null);

  // Prefill Box victory from challengeJson (byType + description)
  useEffect(() => {
    try {
      if (!challengeJson) return;
      const parsed = JSON.parse(challengeJson);
      const byType = Array.isArray(parsed?.victory?.byType)
        ? parsed.victory.byType
        : [];
      const mapped = byType
        .map((t: any) => {
          if (
            typeof t?.x === "number" &&
            typeof t?.y === "number" &&
            typeof t?.count === "number"
          ) {
            return { x: t.x, y: t.y, count: t.count };
          }
          return null;
        })
        .filter(Boolean) as { x: number; y: number; count: number }[];
      if (mapped.length > 0) setBoxVictoryTargets(mapped);
      if (typeof parsed?.victory?.description === "string") {
        setBoxVictoryDescription(parsed.victory.description);
      }
    } catch {}
  }, [challengeJson]);
  useEffect(() => {
    if (!openChallenge) return;
    let found = false;
    outer: for (const row of mapGrid) {
      for (const cell of row) {
        if (cell.object) {
          const asset = MAP_ASSETS.find((a) => a.id === cell.object);
          if (asset && (asset as any).category === "robot") {
            setRobotX(cell.col);
            setRobotY(cell.row);
            setRobotImagePath((asset as any).imagePath || null);
            found = true;
            break outer;
          }
        }
      }
    }
    if (!found) {
      // keep defaults and set fallback image if exists
      const fallback = MAP_ASSETS.find((a: any) => a.category === "robot");
      setRobotImagePath((fallback as any)?.imagePath || null);
    }

    // Only two choices required: Map Box and Map Battery
    const twoChoices = [
      { key: "box", label: "Map Box", type: "box" as const },
      { key: "battery", label: "Map Battery", type: "battery" as const },
    ];
    setTargetOptions(twoChoices);
    setSelectedTargetKey((prev) =>
      prev === "box" || prev === "battery" ? prev : ""
    );

    // Build battery tiles snapshot from current map when opening
    const batteries: {
      x: number;
      y: number;
      count: number;
      type: "yellow" | "red" | "green";
      spread: number;
      allowedCollect: boolean;
    }[] = [];
    for (const row of mapGrid) {
      for (const cell of row) {
        if (!cell.object) continue;
        const asset = MAP_ASSETS.find((a) => a.id === cell.object) as any;
        if (!asset) continue;
        const idLower = (asset.id || "").toLowerCase();
        // Detect batteries by pin_* ids
        if (idLower.startsWith("pin_")) {
          const type: "yellow" | "red" | "green" = idLower.includes("yellow")
            ? "yellow"
            : idLower.includes("red")
            ? "red"
            : "green";
          const count = Math.max(1, (cell as any).itemCount ?? 1);
          batteries.push({
            x: cell.col,
            y: cell.row,
            count,
            type,
            spread: 1,
            allowedCollect: true,
          });
        }
      }
    }
    setBatteryTiles(batteries);

    // Build box tiles snapshot from current map when opening
    const boxes: { x: number; y: number; count: number; spread: number }[] = [];
    for (const row of mapGrid) {
      for (const cell of row) {
        if (!cell.object) continue;
        if (cell.object === "box") {
          const count = Math.max(1, (cell as any).itemCount ?? 1);
          boxes.push({ x: cell.col, y: cell.row, count, spread: 1.2 });
        }
      }
    }
    setBoxTiles(boxes);
    // No warehouse anymore
  }, [openChallenge, mapGrid]);

  // Fetch lessons for dropdown (value=id, label=title)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axiosClient.get(ROUTES_API_LESSON.GET_ALL);
        const items = res?.data?.data?.items as
          | { id: string; title: string }[]
          | undefined;
        if (!cancelled && Array.isArray(items)) {
          const options = items.map((i) => ({ id: i.id, title: i.title }));
          setLessonOptions(options);
          // Auto-select first lesson if none selected
          if (
            options.length > 0 &&
            (!lessonId || lessonId.trim().length === 0)
          ) {
            onLessonIdChange(options[0].id);
          }
        }
      } catch (e) {
        // Silent fail but notify
        try {
          if ((window as any).Snackbar?.enqueueSnackbar) {
            (window as any).Snackbar.enqueueSnackbar(
              "Failed to load lesson list",
              {
                variant: "error",
                anchorOrigin: { vertical: "top", horizontal: "right" },
              }
            );
          } else {
            showToast("Failed to load lesson list", "error");
          }
        } catch {
          // no-op
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lessonId, onLessonIdChange]);
  return (
    <Paper
      sx={{
        p: 2,
        height: "100%",
        overflow: "auto",
        bgcolor: THEME_COLORS.surface,
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: 600,
          color: THEME_COLORS.text.primary,
        }}
      >
        Map Information
      </Typography>

      {/* Map Name Input */}
      <TextField
        fullWidth
        label="Map Name"
        value={mapName}
        onChange={(e) => onMapNameChange(e.target.value)}
        size="small"
        sx={{
          mb: 1.5,
          "& .MuiOutlinedInput-root": {
            "&.Mui-focused fieldset": {
              borderColor: THEME_COLORS.primary,
            },
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: THEME_COLORS.primary,
          },
        }}
      />

      {/* Map Description Input */}
      <TextField
        fullWidth
        label="Map Description"
        value={mapDescription}
        onChange={(e) => onMapDescriptionChange(e.target.value)}
        size="small"
        multiline
        rows={4}
        sx={{
          "& .MuiOutlinedInput-root": {
            "&.Mui-focused fieldset": {
              borderColor: THEME_COLORS.primary,
            },
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: THEME_COLORS.primary,
          },
        }}
      />

      {/* Lesson, Order, Difficulty */}
      <Box sx={{ mt: 5, display: "flex", flexDirection: "column", gap: 2 }}>
        <FormControl fullWidth size="small" error={!lessonId}>
          <InputLabel>Lesson</InputLabel>
          <Select
            label="Lesson"
            value={lessonId}
            onChange={(e) => onLessonIdChange(e.target.value as string)}
          >
            {lessonOptions.length === 0 ? (
              <MenuItem value="" disabled>
                No data
              </MenuItem>
            ) : (
              lessonOptions.map((opt) => (
                <MenuItem key={opt.id} value={opt.id}>
                  {opt.title}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Order (1-5)</InputLabel>
          <Select
            label="Order (1-5)"
            value={order}
            onChange={(e) => onOrderChange(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Difficulty (1-5)</InputLabel>
          <Select
            label="Difficulty (1-5)"
            value={difficulty}
            onChange={(e) => onDifficultyChange(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Actions under dropdowns */}
      <Box sx={{ mt: 5, display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Button
          variant="contained"
          onClick={() => setOpenSolution(true)}
          disableElevation
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "8px",
            py: 1,
            bgcolor: solutionJson ? "#81D4FA" : "#B3E5FC",
            color: "#0d1b2a",
            "&:hover": { bgcolor: solutionJson ? "#4FC3F7" : "#81D4FA" },
          }}
        >
          {solutionJson ? "Solution (configured)" : "Solution (not configured)"}
        </Button>
        <Button
          variant="contained"
          onClick={() => setOpenChallenge(true)}
          disableElevation
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "8px",
            py: 1,
            bgcolor: challengeJson ? "#81D4FA" : "#B3E5FC",
            color: "#0d1b2a",
            "&:hover": { bgcolor: challengeJson ? "#4FC3F7" : "#81D4FA" },
          }}
        >
          {challengeJson
            ? "Challenge (configured)"
            : "Challenge (not configured)"}
        </Button>
      </Box>

      {/* Solution Popup (with Blockly) */}
      <Dialog
        open={openSolution}
        onClose={() => setOpenSolution(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Solution Editor</DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <Box sx={{ display: "flex", height: "70vh" }}>
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                borderRight: `1px solid ${THEME_COLORS.border}`,
              }}
            >
              <BlocksWorkspace
                onWorkspaceChange={(ws) => {
                  solutionWorkspaceRef.current = ws;
                }}
                initialProgramActionsJson={(() => {
                  try {
                    if (!solutionJson) return undefined;
                    const parsed = JSON.parse(solutionJson);
                    const program = parsed?.data?.program;
                    return program;
                  } catch {
                    return undefined;
                  }
                })()}
              />
            </Box>
            {/* Right: Isometric mini map preview */}
            <Box
              sx={{
                width: 560,
                p: 2,
                overflow: "auto",
                display: "flex",
                justifyContent: "center",
              }}
            >
              {(() => {
                const MINI = {
                  ...ISOMETRIC_CONFIG,
                  // Scale tiles bigger for mini preview
                  tileWidth: Math.max(
                    32,
                    Math.floor(ISOMETRIC_CONFIG.tileWidth * 0.75)
                  ),
                  tileHeight: Math.max(
                    16,
                    Math.floor(ISOMETRIC_CONFIG.tileHeight * 0.75)
                  ),
                  tileDepth: Math.max(
                    10,
                    Math.floor((ISOMETRIC_CONFIG.tileDepth || 16) * 0.75)
                  ),
                } as typeof ISOMETRIC_CONFIG;
                const dims = getIsometricGridDimensions(
                  GRID_CONFIG.rows,
                  GRID_CONFIG.cols,
                  MINI
                );
                const w = dims.width + dims.offsetX;
                const h = dims.height + dims.offsetY;
                return (
                  <Box
                    sx={{
                      position: "relative",
                      width: w,
                      height: h,
                      border: `1px solid ${THEME_COLORS.border}`,
                      bgcolor: THEME_COLORS.background,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        position: "absolute",
                        top: 6,
                        left: 8,
                        zIndex: 2,
                        m: 0,
                        px: 0.5,
                        py: 0.25,
                        fontWeight: 600,
                        bgcolor: "#00000066",
                        color: "#fff",
                        borderRadius: 1,
                        pointerEvents: "none",
                      }}
                    >
                      Map Preview (Isometric Mini)
                    </Typography>
                    {mapGrid.flat().map((cell) => {
                      const terrain = cell.terrain
                        ? MAP_ASSETS.find((a) => a.id === cell.terrain)
                        : null;
                      const object = cell.object
                        ? MAP_ASSETS.find((a) => a.id === cell.object)
                        : null;
                      if (!terrain && !object) return null;
                      const pos = gridToIsometric(cell.row, cell.col, MINI);
                      const left = pos.x + dims.offsetX;
                      // Apply diagonal lift and spacing similar to main isometric map
                      const MINI_LIFT_PER_DIAGONAL = Math.round(
                        MINI.tileHeight * 0.7
                      );
                      const MINI_DIAGONAL_SPACING = Math.round(
                        MINI.tileHeight * 0.51
                      );
                      const diagonalIndex = cell.row + cell.col;
                      const top =
                        pos.y +
                        dims.offsetY -
                        diagonalIndex * MINI_LIFT_PER_DIAGONAL +
                        diagonalIndex * MINI_DIAGONAL_SPACING;
                      const tw = MINI.tileWidth;
                      const th = MINI.tileHeight;
                      return (
                        <svg
                          key={`mini-${cell.row}-${cell.col}`}
                          style={{
                            position: "absolute",
                            left,
                            top,
                            width: tw,
                            height: th,
                            overflow: "visible",
                          }}
                        >
                          <polygon
                            points={`${tw / 2},0 ${tw},${th / 2} ${
                              tw / 2
                            },${th} 0,${th / 2}`}
                            fill="#ffffff"
                            stroke="#e5e5e5"
                            strokeWidth="0.5"
                            opacity="0.5"
                          />
                          {terrain?.imagePath && (
                            <image
                              href={terrain.imagePath}
                              x={0}
                              y={0}
                              width={tw}
                              height={th}
                              preserveAspectRatio="none"
                            />
                          )}
                          {object?.imagePath &&
                            (() => {
                              const scaleY = ISOMETRIC_CONFIG.tileHeight
                                ? MINI.tileHeight / ISOMETRIC_CONFIG.tileHeight
                                : 1;
                              const ITEM_STEP = Math.round(20 * scaleY);
                              const ROBOT_BASE_LIFT = Math.round(20 * scaleY);
                              // Adjustable base lift height for items in Solution mini-map (no stacking)
                              const ITEM_BASE_LIFT = Math.round(15 * scaleY);
                              const isRobot =
                                (object as any)?.category === "robot" ||
                                (object?.id?.startsWith &&
                                  object.id.startsWith("robot_"));

                              // Elevation: robots have base lift; items have constant adjustable lift
                              let stackShift = 0;
                              if (isRobot) {
                                stackShift = ROBOT_BASE_LIFT;
                              } else {
                                stackShift = ITEM_BASE_LIFT; // tweak ITEM_BASE_LIFT to adjust item height
                              }
                              // Scale object similar to main map: robot ~0.85, item ~0.5
                              const SCALE = isRobot ? 0.85 : 0.5;
                              const ow = tw * SCALE;
                              const oh = th * SCALE;
                              const ox = (tw - ow) / 2;
                              const oy = (th - oh) / 2 - stackShift;
                              return (
                                <>
                                  <image
                                    href={object.imagePath}
                                    x={ox}
                                    y={oy}
                                    width={ow}
                                    height={oh}
                                    preserveAspectRatio="xMidYMid meet"
                                  />
                                  {/* Visible count badge for items > 1 */}
                                  {!isRobot && (cell.itemCount ?? 0) > 1 && (
                                    <text
                                      x={ox + ow - 2}
                                      y={oy + 12}
                                      textAnchor="end"
                                      fontSize="11"
                                      fontWeight="700"
                                      fill="#ffffff"
                                      stroke="#000000"
                                      strokeWidth="0.8"
                                      style={{ pointerEvents: "none" }}
                                    >
                                      {`x${cell.itemCount ?? 0}`}
                                    </text>
                                  )}
                                </>
                              );
                            })()}
                        </svg>
                      );
                    })}
                  </Box>
                );
              })()}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              try {
                if (!solutionWorkspaceRef.current) return;
                const program = BlocklyToPhaserConverter.convertWorkspace(
                  solutionWorkspaceRef.current
                );
                const message = {
                  source: "parent-website",
                  type: "RUN_PROGRAM",
                  data: { program },
                };
                // Do not console unrelated logs here; only parent save will log final result
                // Pass back to parent to store in solutionJson
                onSolutionJsonChange?.(JSON.stringify(message));
                // Feedback: toast and close
                // Using native alert as placeholder toast if no hook available here
                // You can replace with your notification system
                // e.g., enqueueSnackbar("Solution saved successfully", { variant: "success" })
                try {
                  (window as any).Snackbar?.enqueueSnackbar &&
                    (window as any).Snackbar.enqueueSnackbar(
                      "Solution saved successfully",
                      { variant: "success" }
                    );
                } catch {}
                setOpenSolution(false);
              } catch (err) {}
            }}
            sx={{ mr: 1 }}
          >
            Save
          </Button>
          <Button onClick={() => setOpenSolution(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Challenge Popup (basic fields first) */}
      <Dialog
        open={openChallenge}
        onClose={() => setOpenChallenge(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Challenge Editor
          <Tooltip
            title={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Spread Guide:
                </Typography>
                <Typography variant="body2">
                  • Distance between items in the same tile
                </Typography>
                <Typography variant="body2">• 1 item: spread = 1</Typography>
                <Typography variant="body2">
                  • More than 2: spread = 1.2
                </Typography>
              </Box>
            }
            placement="left"
            arrow
          >
            <IconButton
              size="small"
              aria-label="spread-help"
              sx={{ color: THEME_COLORS.text.secondary }}
            >
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                p: 2,
                border: `1px solid ${THEME_COLORS.border}`,
                borderRadius: 1.5,
                bgcolor: THEME_COLORS.background,
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Robot
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: THEME_COLORS.text.secondary }}
                  >
                    Tile X
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {robotX}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: THEME_COLORS.text.secondary }}
                  >
                    Tile Y
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {robotY}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: THEME_COLORS.text.secondary }}
                  >
                    Direction
                  </Typography>
                  <Chip
                    size="small"
                    label={robotDir}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                {robotImagePath && (
                  <Box
                    component="img"
                    src={robotImagePath}
                    alt="robot"
                    sx={{ width: 56, height: 56, objectFit: "contain", ml: 1 }}
                  />
                )}
              </Box>
            </Box>

            {/* Map target (Box or Battery) */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Map
              </Typography>
              <FormControl size="small" sx={{ minWidth: 240 }}>
                <InputLabel>Map</InputLabel>
                <Select
                  label="Map"
                  value={selectedTargetKey}
                  onChange={(e) => {
                    const next = e.target.value as string;
                    if (next === "battery") {
                      const hasAnyBattery = batteryTiles.length > 0;
                      if (!hasAnyBattery) {
                        const msg = "Map Battery: no batteries on the map";
                        try {
                          if ((window as any).Snackbar?.enqueueSnackbar) {
                            (window as any).Snackbar.enqueueSnackbar(msg, {
                              variant: "error",
                              anchorOrigin: {
                                vertical: "top",
                                horizontal: "right",
                              },
                            });
                          } else {
                            showToast(msg, "error");
                          }
                        } catch {
                          showToast(msg, "error");
                        }
                        return; // block switching
                      }
                    } else if (next === "box") {
                      const hasAnyBox = boxTiles.length > 0;
                      if (!hasAnyBox) {
                        const msg = "Map Box: no boxes on the map";
                        try {
                          if ((window as any).Snackbar?.enqueueSnackbar) {
                            (window as any).Snackbar.enqueueSnackbar(msg, {
                              variant: "error",
                              anchorOrigin: {
                                vertical: "top",
                                horizontal: "right",
                              },
                            });
                          } else {
                            showToast(msg, "error");
                          }
                        } catch {
                          showToast(msg, "error");
                        }
                        return; // block switching
                      }
                    }
                    setSelectedTargetKey(next);
                  }}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {targetOptions.map((opt) => (
                    <MenuItem key={opt.key} value={opt.key}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Battery list and victory settings (only when Map = battery) */}
            {selectedTargetKey === "battery" && (
              <Box
                sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}
              >
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    Batteries on Map
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {batteryTiles.length === 0 && (
                      <Typography
                        variant="body2"
                        sx={{ color: THEME_COLORS.text.secondary }}
                      >
                        No batteries found on map.
                      </Typography>
                    )}
                    {batteryTiles.map((bt, idx) => (
                      <Box
                        key={`${bt.x},${bt.y},${idx}`}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          p: 1,
                          border: `1px solid ${THEME_COLORS.border}`,
                          borderRadius: 1,
                        }}
                      >
                        {(() => {
                          const asset = MAP_ASSETS.find(
                            (a) => a.id === `pin_${bt.type}`
                          );
                          const src = (asset as any)?.imagePath || "";
                          return src ? (
                            <Box
                              component="img"
                              src={src}
                              alt={`pin_${bt.type}`}
                              sx={{
                                width: 28,
                                height: 28,
                                objectFit: "contain",
                              }}
                            />
                          ) : null;
                        })()}
                        <Typography
                          variant="body2"
                          sx={{ minWidth: 110 }}
                        >{`Cell [${bt.y}, ${bt.x}]`}</Typography>
                        <TextField
                          label="Count"
                          type="number"
                          size="small"
                          value={bt.count}
                          error={bt.count === "" || Number(bt.count) < 1}
                          onChange={(e) => {
                            const val = e.target.value;
                            const v = val === "" ? "" : Number(val);
                            setBatteryTiles((prev) =>
                              prev.map((b, i) =>
                                i === idx ? { ...b, count: v } : b
                              )
                            );
                          }}
                          inputProps={{ inputMode: "numeric" }}
                          sx={{ width: 100 }}
                        />
                        <TextField
                          label="Type"
                          size="small"
                          value={bt.type}
                          InputProps={{ readOnly: true }}
                          sx={{ width: 120 }}
                        />
                        <TextField
                          label="Spread"
                          type="number"
                          size="small"
                          value={bt.spread}
                          error={bt.spread === "" || Number(bt.spread) < 1}
                          onChange={(e) => {
                            const val = e.target.value;
                            const v = val === "" ? "" : Number(val);
                            setBatteryTiles((prev) =>
                              prev.map((b, i) =>
                                i === idx ? { ...b, spread: v } : b
                              )
                            );
                          }}
                          inputProps={{ inputMode: "decimal" }}
                          sx={{ width: 110 }}
                        />
                        <FormControl
                          size="small"
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography variant="caption">
                            Allowed Collect
                          </Typography>
                          <input
                            type="checkbox"
                            checked={bt.allowedCollect}
                            onChange={(e) =>
                              setBatteryTiles((prev) =>
                                prev.map((b, i) =>
                                  i === idx
                                    ? { ...b, allowedCollect: e.target.checked }
                                    : b
                                )
                              )
                            }
                          />
                        </FormControl>
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Victory
                    </Typography>
                    <Tooltip
                      title="Enter the number of batteries to collect for victory. Note: total required must be less than or equal to the number of batteries available on the map."
                      placement="right"
                    >
                      <IconButton
                        size="small"
                        aria-label="battery-victory-help"
                        sx={{ color: THEME_COLORS.text.secondary }}
                      >
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      flexWrap: "wrap",
                    }}
                  >
                    {(() => {
                      const yellowSrc =
                        (MAP_ASSETS.find((a) => a.id === "pin_yellow") as any)
                          ?.imagePath || "";
                      const redSrc =
                        (MAP_ASSETS.find((a) => a.id === "pin_red") as any)
                          ?.imagePath || "";
                      const greenSrc =
                        (MAP_ASSETS.find((a) => a.id === "pin_green") as any)
                          ?.imagePath || "";
                      return (
                        <>
                          {yellowSrc && (
                            <Box
                              component="img"
                              src={yellowSrc}
                              alt="yellow"
                              sx={{
                                width: 20,
                                height: 20,
                                objectFit: "contain",
                              }}
                            />
                          )}
                          <TextField
                            label="Yellow"
                            type="number"
                            size="small"
                            value={victoryYellow}
                            onChange={(e) =>
                              setVictoryYellow(
                                Math.max(0, Number(e.target.value))
                              )
                            }
                            inputProps={{ min: 0 }}
                            sx={{ width: 110 }}
                          />
                          {redSrc && (
                            <Box
                              component="img"
                              src={redSrc}
                              alt="red"
                              sx={{
                                width: 20,
                                height: 20,
                                objectFit: "contain",
                              }}
                            />
                          )}
                          <TextField
                            label="Red"
                            type="number"
                            size="small"
                            value={victoryRed}
                            onChange={(e) =>
                              setVictoryRed(Math.max(0, Number(e.target.value)))
                            }
                            inputProps={{ min: 0 }}
                            sx={{ width: 110 }}
                          />
                          {greenSrc && (
                            <Box
                              component="img"
                              src={greenSrc}
                              alt="green"
                              sx={{
                                width: 20,
                                height: 20,
                                objectFit: "contain",
                              }}
                            />
                          )}
                          <TextField
                            label="Green"
                            type="number"
                            size="small"
                            value={victoryGreen}
                            onChange={(e) =>
                              setVictoryGreen(
                                Math.max(0, Number(e.target.value))
                              )
                            }
                            inputProps={{ min: 0 }}
                            sx={{ width: 110 }}
                          />
                        </>
                      );
                    })()}
                  </Box>
                  <TextField
                    fullWidth
                    label="Hint"
                    placeholder="Describe the victory condition. Example: Collect all yellow batteries using if statements."
                    size="small"
                    value={victoryDescription}
                    error={!victoryDescription.trim()}
                    onChange={(e) => setVictoryDescription(e.target.value)}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>
            )}

            {/* Box settings and victory (only when Map = box) */}
            {selectedTargetKey === "box" && (
              <Box
                sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}
              >
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    Boxes on Map
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {boxTiles.length === 0 && (
                      <Typography
                        variant="body2"
                        sx={{ color: THEME_COLORS.text.secondary }}
                      >
                        No boxes found on map.
                      </Typography>
                    )}
                    {boxTiles.map((bx, idx) => (
                      <Box
                        key={`${bx.x},${bx.y},${idx}`}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          p: 1,
                          border: `1px solid ${THEME_COLORS.border}`,
                          borderRadius: 1,
                        }}
                      >
                        {(() => {
                          const asset = MAP_ASSETS.find((a) => a.id === "box");
                          const src = (asset as any)?.imagePath || "";
                          return src ? (
                            <Box
                              component="img"
                              src={src}
                              alt="box"
                              sx={{
                                width: 28,
                                height: 28,
                                objectFit: "contain",
                              }}
                            />
                          ) : null;
                        })()}
                        <Typography
                          variant="body2"
                          sx={{ minWidth: 110 }}
                        >{`Cell [${bx.y}, ${bx.x}]`}</Typography>
                        <TextField
                          label="Count"
                          type="number"
                          size="small"
                          value={bx.count}
                          error={bx.count === "" || Number(bx.count) < 1}
                          onChange={(e) => {
                            const val = e.target.value;
                            const v = val === "" ? "" : Number(val);
                            setBoxTiles((prev) =>
                              prev.map((t, i) =>
                                i === idx ? { ...t, count: v } : t
                              )
                            );
                          }}
                          inputProps={{ inputMode: "numeric" }}
                          sx={{ width: 110 }}
                        />
                        <TextField
                          label="Spread"
                          type="number"
                          size="small"
                          value={boxGlobalSpread}
                          onChange={(e) =>
                            setBoxGlobalSpread(Number(e.target.value))
                          }
                          sx={{ display: "none" }}
                        />
                      </Box>
                    ))}
                  </Box>
                  <Box
                    sx={{
                      mt: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <TextField
                      label="Spread"
                      type="number"
                      size="small"
                      value={boxGlobalSpread}
                      error={
                        boxGlobalSpread === "" || Number(boxGlobalSpread) < 1
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        setBoxGlobalSpread(val === "" ? "" : Number(val));
                      }}
                      inputProps={{ inputMode: "decimal" }}
                      sx={{ width: 140 }}
                    />
                  </Box>
                </Box>
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Victory
                    </Typography>
                    <Tooltip
                      title="Add position and number of boxes to place for victory. Note: total number of boxes to place must be less than or equal to the available quantity."
                      placement="right"
                    >
                      <IconButton
                        size="small"
                        aria-label="victory-help"
                        sx={{ color: THEME_COLORS.text.secondary }}
                      >
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {boxVictoryTargets.map((t, idx) => (
                      <Box
                        key={`${t.x},${t.y},${idx}`}
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {(() => {
                          const src =
                            (MAP_ASSETS.find((a) => a.id === "box") as any)
                              ?.imagePath || "";
                          return src ? (
                            <Box
                              component="img"
                              src={src}
                              alt="box"
                              sx={{
                                width: 20,
                                height: 20,
                                objectFit: "contain",
                              }}
                            />
                          ) : null;
                        })()}
                        <TextField
                          label="X"
                          type="number"
                          size="small"
                          value={t.x}
                          InputProps={{
                            readOnly: true,
                          }}
                          sx={{ width: 100 }}
                        />
                        <TextField
                          label="Y"
                          type="number"
                          size="small"
                          value={t.y}
                          InputProps={{
                            readOnly: true,
                          }}
                          sx={{ width: 100 }}
                        />
                        <TextField
                          label="Count"
                          type="number"
                          size="small"
                          value={t.count}
                          error={Number(t.count) < 1}
                          onChange={(e) =>
                            setBoxVictoryTargets((arr) =>
                              arr.map((it, i) =>
                                i === idx
                                  ? {
                                      ...it,
                                      count: Math.max(
                                        0,
                                        Number(e.target.value)
                                      ),
                                    }
                                  : it
                              )
                            )
                          }
                          inputProps={{ min: 0 }}
                          sx={{ width: 120 }}
                        />
                        <Button
                          onClick={() =>
                            setBoxVictoryTargets((arr) =>
                              arr.filter((_, i) => i !== idx)
                            )
                          }
                        >
                          Remove
                        </Button>
                      </Box>
                    ))}
                    <Button
                      variant="outlined"
                      onClick={() => setOpenTargetPicker(true)}
                    >
                      + Add target
                    </Button>
                    <TextField
                      fullWidth
                      label="Hint"
                      placeholder="Describe the victory condition. Example: Take 2 from the warehouse and place 2 at target locations."
                      size="small"
                      value={boxVictoryDescription}
                      error={!boxVictoryDescription.trim()}
                      onChange={(e) => setBoxVictoryDescription(e.target.value)}
                    />
                  </Box>
                </Box>
              </Box>
            )}

            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Constraints
                </Typography>
                <Tooltip
                  title={
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        Constraints Guide:
                      </Typography>
                      <Typography variant="body2">
                        • Select the cards that players must use to complete the
                        level
                      </Typography>
                      <Typography variant="body2">
                        • And the minimum number of cards players must use
                      </Typography>
                    </Box>
                  }
                  placement="top"
                  arrow
                >
                  <IconButton
                    size="small"
                    aria-label="constraints-help"
                    sx={{ color: THEME_COLORS.text.secondary }}
                  >
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, color: THEME_COLORS.text.secondary }}
                >
                  Required blocks that players must use:
                </Typography>
                <FormGroup>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: 1,
                    }}
                  >
                    {[
                      { value: "forward", label: "Forward Movement" },
                      { value: "turnRight", label: "Turn Right" },
                      { value: "turnLeft", label: "Turn Left" },
                      { value: "turnBack", label: "Turn Back" },
                      { value: "collect", label: "Collect Items" },
                      { value: "repeat", label: "Repeat Loop" },
                      { value: "repeatRange", label: "For Loop" },
                      { value: "if", label: "If Condition" },
                      { value: "while", label: "While Loop" },
                      { value: "takeBox", label: "Take Box" },
                      { value: "putBox", label: "Put Box" },
                    ].map((statement) => (
                      <FormControlLabel
                        key={statement.value}
                        control={
                          <Checkbox
                            checked={selectedStatements.includes(
                              statement.value
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStatements((prev) => [
                                  ...prev,
                                  statement.value,
                                ]);
                              } else {
                                setSelectedStatements((prev) =>
                                  prev.filter((s) => s !== statement.value)
                                );
                              }
                            }}
                            size="small"
                          />
                        }
                        label={statement.label}
                        sx={{ fontSize: "0.875rem" }}
                      />
                    ))}
                  </Box>
                </FormGroup>
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Min cards"
                  type="number"
                  size="small"
                  value={minCards}
                  onChange={(e) => setMinCards(Number(e.target.value))}
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="Max cards"
                  type="number"
                  size="small"
                  value={maxCards}
                  onChange={(e) => setMaxCards(Number(e.target.value))}
                  inputProps={{ min: 0 }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              // Require selecting a target map (box or battery) before saving
              if (
                selectedTargetKey !== "box" &&
                selectedTargetKey !== "battery"
              ) {
                const msg = "Please select Map (Box or Battery) before saving";
                try {
                  if ((window as any).Snackbar?.enqueueSnackbar) {
                    (window as any).Snackbar.enqueueSnackbar(msg, {
                      variant: "error",
                      anchorOrigin: { vertical: "top", horizontal: "right" },
                    });
                  } else {
                    showToast(msg, "error");
                  }
                } catch {
                  showToast(msg, "error");
                }
                return;
              }
              // Validate Map Box numbers: block save if empty or < 1
              if (selectedTargetKey === "box") {
                const invalidTile = boxTiles.some(
                  (t) => t.count === "" || Number(t.count) < 1
                );
                const invalidSpread =
                  boxGlobalSpread === "" || Number(boxGlobalSpread) < 1;
                const missingTargets = boxVictoryTargets.length === 0;
                const invalidTargetCounts = boxVictoryTargets.some(
                  (t) => Number(t.count) < 1
                );
                const missingDescription = !boxVictoryDescription.trim();
                if (invalidTile || invalidSpread) {
                  const msg =
                    invalidTile && invalidSpread
                      ? "Box count and spread values must be 1 or higher"
                      : invalidTile
                      ? "Each box must have Count of at least 1"
                      : "Spread must be 1 or higher";
                  try {
                    if ((window as any).Snackbar?.enqueueSnackbar) {
                      (window as any).Snackbar.enqueueSnackbar(msg, {
                        variant: "error",
                        anchorOrigin: { vertical: "top", horizontal: "right" },
                      });
                    } else {
                      showToast(msg, "error");
                    }
                  } catch {
                    showToast(msg, "error");
                  }
                  return;
                }
                if (missingTargets) {
                  const msg =
                    "Victory must have at least 1 target (x, y, count)";
                  try {
                    if ((window as any).Snackbar?.enqueueSnackbar) {
                      (window as any).Snackbar.enqueueSnackbar(msg, {
                        variant: "error",
                        anchorOrigin: { vertical: "top", horizontal: "right" },
                      });
                    } else {
                      showToast(msg, "error");
                    }
                  } catch {
                    showToast(msg, "error");
                  }
                  return;
                }
                if (invalidTargetCounts) {
                  const msg =
                    "Each target in Victory must have Count of at least 1";
                  try {
                    if ((window as any).Snackbar?.enqueueSnackbar) {
                      (window as any).Snackbar.enqueueSnackbar(msg, {
                        variant: "error",
                        anchorOrigin: { vertical: "top", horizontal: "right" },
                      });
                    } else {
                      showToast(msg, "error");
                    }
                  } catch {
                    showToast(msg, "error");
                  }
                  return;
                }
                if (missingDescription) {
                  const msg = "Victory description cannot be empty";
                  try {
                    if ((window as any).Snackbar?.enqueueSnackbar) {
                      (window as any).Snackbar.enqueueSnackbar(msg, {
                        variant: "error",
                        anchorOrigin: { vertical: "top", horizontal: "right" },
                      });
                    } else {
                      showToast(msg, "error");
                    }
                  } catch {
                    showToast(msg, "error");
                  }
                  return;
                }
              }
              if (selectedTargetKey === "battery") {
                const invalidBattery = batteryTiles.some(
                  (b) => Number(b.count) < 1 || Number(b.spread) < 1
                );
                const missingBatteryDescription = !victoryDescription.trim();
                const allVictoryCountsZero =
                  Number(victoryYellow) < 1 &&
                  Number(victoryRed) < 1 &&
                  Number(victoryGreen) < 1;
                if (invalidBattery) {
                  const msg =
                    "Batteries on Map: Count and Spread must be 1 or higher";
                  try {
                    if ((window as any).Snackbar?.enqueueSnackbar) {
                      (window as any).Snackbar.enqueueSnackbar(msg, {
                        variant: "error",
                        anchorOrigin: { vertical: "top", horizontal: "right" },
                      });
                    } else {
                      showToast(msg, "error");
                    }
                  } catch {
                    showToast(msg, "error");
                  }
                  return;
                }
                if (missingBatteryDescription) {
                  const msg = "Victory description cannot be empty";
                  try {
                    if ((window as any).Snackbar?.enqueueSnackbar) {
                      (window as any).Snackbar.enqueueSnackbar(msg, {
                        variant: "error",
                        anchorOrigin: { vertical: "top", horizontal: "right" },
                      });
                    } else {
                      showToast(msg, "error");
                    }
                  } catch {
                    showToast(msg, "error");
                  }
                  return;
                }
                if (allVictoryCountsZero) {
                  const msg =
                    "Victory: at least one of the three battery types (Yellow/Red/Green) must have quantity of 1 or higher";
                  try {
                    if ((window as any).Snackbar?.enqueueSnackbar) {
                      (window as any).Snackbar.enqueueSnackbar(msg, {
                        variant: "error",
                        anchorOrigin: { vertical: "top", horizontal: "right" },
                      });
                    } else {
                      showToast(msg, "error");
                    }
                  } catch {
                    showToast(msg, "error");
                  }
                  return;
                }
              }
              // Validate min/max cards coherence
              if (Number(minCards) < 1) {
                const msg = "Min cards must be 1 or higher";
                try {
                  if ((window as any).Snackbar?.enqueueSnackbar) {
                    (window as any).Snackbar.enqueueSnackbar(msg, {
                      variant: "error",
                      anchorOrigin: { vertical: "top", horizontal: "right" },
                    });
                  } else {
                    showToast(msg, "error");
                  }
                } catch {
                  showToast(msg, "error");
                }
                return;
              }
              if (Number(maxCards) < 1) {
                const msg = "Max cards must be 1 or higher";
                try {
                  if ((window as any).Snackbar?.enqueueSnackbar) {
                    (window as any).Snackbar.enqueueSnackbar(msg, {
                      variant: "error",
                      anchorOrigin: { vertical: "top", horizontal: "right" },
                    });
                  } else {
                    showToast(msg, "error");
                  }
                } catch {
                  showToast(msg, "error");
                }
                return;
              }
              if (Number(maxCards) < Number(minCards)) {
                const msg =
                  "Max cards must be greater than or equal to Min cards";
                try {
                  if ((window as any).Snackbar?.enqueueSnackbar) {
                    (window as any).Snackbar.enqueueSnackbar(msg, {
                      variant: "error",
                      anchorOrigin: { vertical: "top", horizontal: "right" },
                    });
                  } else {
                    showToast(msg, "error");
                  }
                } catch {
                  showToast(msg, "error");
                }
                return;
              }
              // Prefer robot position from placed robot on the map, fallback to inputs
              // Prefer robot position from placed robot on the map, fallback to inputs
              let placedRobot: { x: number; y: number } | null = null;
              outer: for (const row of mapGrid) {
                for (const cell of row) {
                  if (cell.object) {
                    const asset = MAP_ASSETS.find((a) => a.id === cell.object);
                    if (asset && (asset as any).category === "robot") {
                      placedRobot = { x: cell.col, y: cell.row };
                      break outer;
                    }
                  }
                }
              }

              const statements = selectedStatements;

              // Validate Box victory: total required count must not exceed total boxes configured in inputs
              if (selectedTargetKey === "box") {
                try {
                  const boxesOnMap = (boxTiles || []).reduce(
                    (sum, t) => sum + Math.max(1, Number(t?.count) || 0),
                    0
                  );
                  const victoryTotal = (boxVictoryTargets || []).reduce(
                    (sum: number, t: any) =>
                      sum + (typeof t?.count === "number" ? t.count : 1),
                    0
                  );
                  if (victoryTotal > boxesOnMap) {
                    const msg = `Box victory total (${victoryTotal}) exceeds boxes configured (${boxesOnMap}).`;
                    if ((window as any).Snackbar?.enqueueSnackbar) {
                      (window as any).Snackbar.enqueueSnackbar(msg, {
                        variant: "error",
                        anchorOrigin: { vertical: "top", horizontal: "right" },
                      });
                    } else {
                      showToast(msg, "error");
                    }
                    return;
                  }
                } catch {}
              }

              // Validate Battery victory: per-color counts must not exceed configured pins by color
              if (selectedTargetKey === "battery") {
                try {
                  const have = { yellow: 0, red: 0, green: 0 } as Record<
                    string,
                    number
                  >;
                  for (const b of batteryTiles || []) {
                    const c = Math.max(1, Number(b?.count) || 0);
                    const type = String(b?.type || "yellow").toLowerCase();
                    if (type === "red") have.red += c;
                    else if (type === "green") have.green += c;
                    else have.yellow += c;
                  }
                  const need = {
                    yellow: Math.max(0, Number(victoryYellow) || 0),
                    red: Math.max(0, Number(victoryRed) || 0),
                    green: Math.max(0, Number(victoryGreen) || 0),
                  };
                  const exceededColor =
                    need.yellow > have.yellow
                      ? "yellow"
                      : need.red > have.red
                      ? "red"
                      : need.green > have.green
                      ? "green"
                      : null;
                  if (exceededColor) {
                    const msg = `Battery victory for ${exceededColor} requires ${need[exceededColor]} but only ${have[exceededColor]} configured.`;
                    if ((window as any).Snackbar?.enqueueSnackbar) {
                      (window as any).Snackbar.enqueueSnackbar(msg, {
                        variant: "error",
                        anchorOrigin: { vertical: "top", horizontal: "right" },
                      });
                    } else {
                      showToast(msg, "error");
                    }
                    return;
                  }
                } catch {}
              }
              const payload = {
                robot: {
                  tile: placedRobot ?? { x: robotX, y: robotY },
                  direction: robotDir,
                },
                batteries:
                  selectedTargetKey === "battery"
                    ? [
                        {
                          tiles: batteryTiles.map((b) => ({
                            x: b.x,
                            y: b.y,
                            count: b.count,
                            type: b.type,
                            spread: b.spread,
                            allowedCollect: b.allowedCollect,
                          })),
                        },
                      ]
                    : undefined,
                victory:
                  selectedTargetKey === "battery"
                    ? {
                        byType: [
                          {
                            yellow: victoryYellow,
                            red: victoryRed,
                            green: victoryGreen,
                          },
                        ],
                        description: victoryDescription,
                      }
                    : selectedTargetKey === "box"
                    ? {
                        byType: boxVictoryTargets,
                        description: boxVictoryDescription,
                      }
                    : undefined,
                boxes:
                  selectedTargetKey === "box"
                    ? [
                        {
                          tiles: boxTiles.map((t) => ({
                            x: t.x,
                            y: t.y,
                            count: t.count === "" ? 0 : t.count,
                          })),
                          warehouse:
                            boxTiles.length > 0
                              ? {
                                  x: boxTiles[0].x,
                                  y: boxTiles[0].y,
                                  count:
                                    boxTiles[0].count === ""
                                      ? 0
                                      : boxTiles[0].count,
                                }
                              : { x: 0, y: 0, count: 0 },
                          spread: boxGlobalSpread === "" ? 0 : boxGlobalSpread,
                        },
                      ]
                    : undefined,
                statement: statements,
                minCards,
                maxCards,
              };
              console.log("[Challenge Save] payload:", JSON.stringify(payload));
              // Pass to parent state
              onChallengeJsonChange?.(JSON.stringify(payload));
              try {
                (window as any).Snackbar?.enqueueSnackbar &&
                  (window as any).Snackbar.enqueueSnackbar(
                    "Challenge saved successfully",
                    { variant: "success" }
                  );
              } catch {}
              setOpenChallenge(false);
            }}
          >
            Save
          </Button>
          <Button onClick={() => setOpenChallenge(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Target Picker Mini Map */}
      <Dialog
        open={openTargetPicker}
        onClose={() => setOpenTargetPicker(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Pick a target cell</DialogTitle>
        <DialogContent dividers>
          <Box
            sx={{
              position: "relative",
              height: 420,
              bgcolor: THEME_COLORS.background,
              borderRadius: 1,
              p: 2,
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "auto",
                border: `1px solid ${THEME_COLORS.border}`,
                borderRadius: 1,
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: (() => {
                    const MINI = {
                      ...ISOMETRIC_CONFIG,
                      tileWidth: 64,
                      tileHeight: 40,
                    } as typeof ISOMETRIC_CONFIG;
                    const dims = getIsometricGridDimensions(
                      GRID_CONFIG.rows,
                      GRID_CONFIG.cols,
                      MINI
                    );
                    const PAD = 64;
                    return dims.width + dims.offsetX + PAD * 2;
                  })(),
                  height: (() => {
                    const MINI = {
                      ...ISOMETRIC_CONFIG,
                      tileWidth: 64,
                      tileHeight: 40,
                    } as typeof ISOMETRIC_CONFIG;
                    const dims = getIsometricGridDimensions(
                      GRID_CONFIG.rows,
                      GRID_CONFIG.cols,
                      MINI
                    );
                    const PAD = 64;
                    return dims.height + dims.offsetY + PAD * 2;
                  })(),
                }}
              >
                {(() => {
                  const MINI = {
                    ...ISOMETRIC_CONFIG,
                    tileWidth: 64,
                    tileHeight: 64,
                  };
                  const dims = getIsometricGridDimensions(
                    GRID_CONFIG.rows,
                    GRID_CONFIG.cols,
                    MINI
                  );
                  // Add padding margin to avoid edge clipping
                  const PAD = 64;
                  return (
                    <Box
                      sx={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: dims.width + dims.offsetX + PAD * 2,
                        height: dims.height + dims.offsetY + PAD * 2,
                      }}
                    >
                      {mapGrid.flat().map((cell) => {
                        const pos = gridToIsometric(cell.row, cell.col, MINI);
                        const left = pos.x + dims.offsetX + PAD;
                        // Apply diagonal lift and spacing similar to Solution mini map
                        const MINI_LIFT_PER_DIAGONAL = Math.round(
                          MINI.tileHeight * MINI_LIFT_RATIO * 1.4
                        );
                        const MINI_DIAGONAL_SPACING = Math.round(
                          MINI.tileHeight * MINI_SPACING_RATIO
                        );
                        const diagonalIndex = cell.row + cell.col;
                        const top =
                          pos.y +
                          dims.offsetY -
                          diagonalIndex * MINI_LIFT_PER_DIAGONAL +
                          diagonalIndex * MINI_DIAGONAL_SPACING +
                          PAD;
                        const tw = MINI.tileWidth;
                        const th = MINI.tileHeight;
                        const terrainAsset = cell.terrain
                          ? MAP_ASSETS.find((a) => a.id === cell.terrain)
                          : null;
                        const objectAsset = cell.object
                          ? MAP_ASSETS.find((a) => a.id === cell.object)
                          : null;
                        const fallbackFill =
                          terrainAsset?.id === "water"
                            ? "#90CAF9"
                            : terrainAsset?.id === "grass"
                            ? "#A5D6A7"
                            : terrainAsset?.id === "wood"
                            ? "#BCAAA4"
                            : "#E0E0E0";
                        return (
                          <Box
                            key={`${cell.row}-${cell.col}`}
                            onClick={() => {
                              setBoxVictoryTargets((arr) => [
                                ...arr,
                                { x: cell.col, y: cell.row, count: 1 },
                              ]);
                              setOpenTargetPicker(false);
                            }}
                            onMouseEnter={() =>
                              setHoverPicker({ row: cell.row, col: cell.col })
                            }
                            onMouseLeave={() => setHoverPicker(null)}
                            sx={{
                              position: "absolute",
                              left,
                              top,
                              width: tw,
                              height: th,
                              cursor: "pointer",
                              pointerEvents: "auto",
                            }}
                          >
                            <svg
                              width={tw}
                              height={th}
                              style={{
                                display: "block",
                                overflow: "visible",
                                pointerEvents: "auto",
                              }}
                              onMouseEnter={() =>
                                setHoverPicker({ row: cell.row, col: cell.col })
                              }
                              onMouseMove={() =>
                                setHoverPicker({ row: cell.row, col: cell.col })
                              }
                              onMouseLeave={() => setHoverPicker(null)}
                            >
                              {/* Terrain */}
                              {terrainAsset?.imagePath ? (
                                <image
                                  href={terrainAsset.imagePath}
                                  x={0}
                                  y={0}
                                  width={tw}
                                  height={th}
                                  preserveAspectRatio="xMidYMid slice"
                                />
                              ) : (
                                (() => {
                                  const dxTop = 0,
                                    dyTop = 0;
                                  const dxRight = 0,
                                    dyRight = -12;
                                  const dxBottom = 0,
                                    dyBottom = -22;
                                  const dxLeft = 0,
                                    dyLeft = -12;
                                  const pTop = {
                                    x: tw / 2 + dxTop,
                                    y: 0 + dyTop,
                                  };
                                  const pRight = {
                                    x: tw + dxRight,
                                    y: th / 2 + dyRight,
                                  };
                                  const pBottom = {
                                    x: tw / 2 + dxBottom,
                                    y: th + dyBottom,
                                  };
                                  const pLeft = {
                                    x: 0 + dxLeft,
                                    y: th / 2 + dyLeft,
                                  };
                                  return (
                                    <polygon
                                      points={`${pTop.x},${pTop.y} ${pRight.x},${pRight.y} ${pBottom.x},${pBottom.y} ${pLeft.x},${pLeft.y}`}
                                      fill={fallbackFill}
                                      stroke="#9E9E9E"
                                      strokeWidth={1}
                                      strokeLinejoin="round"
                                    />
                                  );
                                })()
                              )}
                              {/* Object thumbnail */}
                              {objectAsset?.imagePath &&
                                (() => {
                                  // Match object stacking and sizing like Solution mini map
                                  const scaleY = ISOMETRIC_CONFIG.tileHeight
                                    ? MINI.tileHeight /
                                      ISOMETRIC_CONFIG.tileHeight
                                    : 1;
                                  const ITEM_STEP = Math.round(20 * scaleY);
                                  const ROBOT_BASE_LIFT = Math.round(
                                    20 * scaleY
                                  );
                                  const isRobot =
                                    (objectAsset as any)?.category ===
                                      "robot" ||
                                    (objectAsset?.id?.startsWith &&
                                      objectAsset.id.startsWith("robot_"));
                                  let stackShift = 0;
                                  if (isRobot) {
                                    stackShift = ROBOT_BASE_LIFT;
                                  } else {
                                    const stackLevel = Math.max(
                                      (cell as any).itemCount ?? 0,
                                      Array.isArray((cell as any).items)
                                        ? (cell as any).items.length
                                        : 0
                                    );
                                    stackShift =
                                      stackLevel > 0
                                        ? stackLevel * ITEM_STEP
                                        : 0;
                                  }
                                  const SCALE = isRobot ? 0.85 : 0.5;
                                  const ow = tw * SCALE;
                                  const oh = th * SCALE;
                                  const ox = (tw - ow) / 2;
                                  const oy = (th - oh) / 2 - stackShift;
                                  return (
                                    <image
                                      href={objectAsset.imagePath}
                                      x={ox}
                                      y={oy}
                                      width={ow}
                                      height={oh}
                                      preserveAspectRatio="xMidYMid meet"
                                    />
                                  );
                                })()}
                              {/* Cell highlight + border on hover */}
                              {(SHOW_PICK_BORDER ||
                                (hoverPicker &&
                                  hoverPicker.row === cell.row &&
                                  hoverPicker.col === cell.col)) &&
                                (() => {
                                  // Match the adjusted tile corners used for terrain polygon
                                  const dxTop = 0,
                                    dyTop = 0;
                                  const dxRight = 0,
                                    dyRight = -12;
                                  const dxBottom = 0,
                                    dyBottom = -22;
                                  const dxLeft = 0,
                                    dyLeft = -12;
                                  const pTop = {
                                    x: tw / 2 + dxTop,
                                    y: 0 + dyTop,
                                  };
                                  const pRight = {
                                    x: tw + dxRight,
                                    y: th / 2 + dyRight,
                                  };
                                  const pBottom = {
                                    x: tw / 2 + dxBottom,
                                    y: th + dyBottom,
                                  };
                                  const pLeft = {
                                    x: 0 + dxLeft,
                                    y: th / 2 + dyLeft,
                                  };
                                  const points = `${pTop.x},${pTop.y} ${pRight.x},${pRight.y} ${pBottom.x},${pBottom.y} ${pLeft.x},${pLeft.y}`;
                                  return (
                                    <>
                                      {/* Filled overlay to brighten the adjusted tile itself */}
                                      <polygon
                                        points={points}
                                        fill="#42A5F5"
                                        fillOpacity={0.18}
                                        stroke="none"
                                      />
                                      {/* Border for extra clarity */}
                                      <polygon
                                        points={points}
                                        fill="transparent"
                                        stroke="#42A5F5"
                                        strokeOpacity={0.9}
                                        strokeWidth={2}
                                        strokeLinejoin="round"
                                      />
                                    </>
                                  );
                                })()}
                            </svg>
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })()}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTargetPicker(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Local notification container for this section */}
      <Toast />
    </Paper>
  );
}
