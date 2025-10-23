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
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import Pagination from "@mui/material/Pagination";
import { createPortal } from "react-dom";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useNotification } from "hooks/useNotification";
import useLocales from "hooks/useLocales";
import PopupSelect from "components/common/PopupSelect";
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
import { axiosClient } from "axiosClient";
import { ROUTES_API_CHALLENGE } from "constants/routesApiKeys";
// (use existing imports at top of file)

interface WinConditionsSectionProps {
  mapName: string;
  onMapNameChange: (name: string) => void;
  mapDescription: string;
  onMapDescriptionChange: (description: string) => void;
  courseId: string;
  onCourseIdChange: (id: string) => void;
  lessonId: string;
  onLessonIdChange: (id: string) => void;
  order: number;
  onOrderChange: (value: number) => void;
  difficulty: number;
  onDifficultyChange: (value: number) => void;
  challengeMode: number;
  onChallengeModeChange: (value: number) => void;
  mapGrid: MapCell[][];
  onChallengeJsonChange?: (json: string) => void;
  challengeJson?: string | null;
  onSaveMap?: () => void;
  onOpenMapPicker?: () => void;
  onSolutionDialogToggle?: (open: boolean) => void;
  registerOpenChallengeTrigger?: (fn: () => void) => void;
  courses?: any[];
  lessons?: any[];
  hasTriedSave?: boolean;
  coursePage?: number;
  onCoursePageChange?: (page: number) => void;
  lessonPage?: number;
  onLessonPageChange?: (page: number) => void;
  courseLoading?: boolean;
  lessonLoading?: boolean;
  courseTotalPages?: number;
  lessonTotalPages?: number;
  isEditMode?: boolean;
}

export default function WinConditionsSection({
  mapName,
  onMapNameChange,
  mapDescription,
  onMapDescriptionChange,
  courseId,
  onCourseIdChange,
  lessonId,
  onLessonIdChange,
  order,
  onOrderChange,
  difficulty,
  onDifficultyChange,
  challengeMode,
  onChallengeModeChange,
  mapGrid,
  onChallengeJsonChange,
  challengeJson,
  onSaveMap,
  onSolutionDialogToggle,
  registerOpenChallengeTrigger,
  courses = [],
  lessons = [],
  hasTriedSave = false,
  coursePage = 1,
  onCoursePageChange,
  lessonPage = 1,
  onLessonPageChange,
  courseLoading = false,
  lessonLoading = false,
  courseTotalPages = 1,
  lessonTotalPages = 1,
  isEditMode = false,
}: WinConditionsSectionProps) {
  const { translate } = useLocales();
  const [openSolution] = useState(false);

  // Notify parent when Solution dialog open/close toggles (to stabilize isometric grid)
  useEffect(() => {
    try {
      onSolutionDialogToggle?.(openSolution);
    } catch {}
    // Intentionally only depend on openSolution to avoid parent inline-callback
    // causing unnecessary re-invocations and render loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSolution]);
  const [openChallenge, setOpenChallenge] = useState(false);
  // const solutionWorkspaceRef = useRef<any>(null);
  // Expose a trigger to open Challenge dialog from parent
  useEffect(() => {
    if (registerOpenChallengeTrigger) {
      registerOpenChallengeTrigger(() => setOpenChallenge(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Mini-map temporarily disabled for testing

  // Mini-map temporarily disabled for testing
  // duplicate declarations removed
  // Challenge basic fields
  const [robotX, setRobotX] = useState<number>(0);
  const [robotY, setRobotY] = useState<number>(0);
  const [robotDir, setRobotDir] = useState<"north" | "east" | "south" | "west">(
    "east"
  );
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
            // Parse spread - handle both number and string
            const spread =
              typeof t?.spread === "number"
                ? t.spread
                : typeof t?.spread === "string"
                ? parseFloat(t.spread) || 1
                : 1;
            // Parse allowedCollect - handle both boolean and string
            const allowedCollect =
              typeof t?.allowedCollect === "boolean"
                ? t.allowedCollect
                : typeof t?.allowedCollect === "string"
                ? t.allowedCollect === "true"
                : Boolean(t?.allowedCollect);

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

  // Custom tooltip state
  const [tooltipState, setTooltipState] = useState<{
    open: boolean;
    content: string;
    x: number;
    y: number;
  }>({
    open: false,
    content: "",
    x: 0,
    y: 0,
  });

  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

      // Load box tiles from challengeJson
      const boxes = Array.isArray(parsed?.boxes) ? parsed.boxes : [];
      const boxTilesAccum: {
        x: number;
        y: number;
        count: number;
        spread: number;
      }[] = [];
      boxes.forEach((b: any) => {
        const tiles = Array.isArray(b?.tiles) ? b.tiles : [];
        // Parse spread from box level, not tile level
        const spread =
          typeof b?.spread === "number"
            ? b.spread
            : typeof b?.spread === "string"
            ? parseFloat(b.spread) || 1.2
            : 1.2;

        tiles.forEach((t: any) => {
          if (
            typeof t?.x === "number" &&
            typeof t?.y === "number" &&
            typeof t?.count === "number"
          ) {
            boxTilesAccum.push({
              x: t.x,
              y: t.y,
              count: t.count,
              spread: spread, // Use spread from box level
            });
          }
        });
      });
      if (boxTilesAccum.length) {
        setBoxTiles(boxTilesAccum);
        // Set global spread from first box
        if (boxTilesAccum[0]?.spread) {
          setBoxGlobalSpread(boxTilesAccum[0].spread);
        }
      }
    } catch {}
  }, [challengeJson]);

  // Update robot direction when mapGrid changes (not just when dialog opens)
  useEffect(() => {
    let found = false;
    outer: for (const row of mapGrid) {
      for (const cell of row) {
        if (cell.object) {
          const asset = MAP_ASSETS.find((a) => a.id === cell.object);
          if (asset && (asset as any).category === "robot") {
            // Extract direction from asset ID (e.g., "robot_east" -> "east")
            const assetId = asset.id || "";
            if (assetId.startsWith("robot_")) {
              const direction = assetId.replace("robot_", "") as
                | "north"
                | "east"
                | "south"
                | "west";
              if (["north", "east", "south", "west"].includes(direction)) {
                setRobotDir(direction);
                console.log(
                  "🤖 [WinConditions] Updated robot direction to:",
                  direction,
                  "from asset:",
                  assetId
                );
              }
            }
            found = true;
            break outer;
          }
        }
      }
    }
    if (!found) {
      // Reset to default if no robot found
      setRobotDir("east");
    }
  }, [mapGrid]); // Watch mapGrid changes

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

            // Extract direction from asset ID (e.g., "robot_east" -> "east")
            const assetId = asset.id || "";
            if (assetId.startsWith("robot_")) {
              const direction = assetId.replace("robot_", "") as
                | "north"
                | "east"
                | "south"
                | "west";
              if (["north", "east", "south", "west"].includes(direction)) {
                setRobotDir(direction);
              }
            }

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
      { key: "box", label: "Bản đồ Box", type: "box" as const },
      { key: "battery", label: "Bản đồ Pin", type: "battery" as const },
    ];
    setTargetOptions(twoChoices);
    setSelectedTargetKey((prev) =>
      prev === "box" || prev === "battery" ? prev : ""
    );

    // Only build battery tiles from mapGrid if no data from challengeJson
    // This prevents overriding data loaded from API
    if (batteryTiles.length === 0) {
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
    }

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

  // Lessons are now passed as props, no need to manage local state

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Custom tooltip handlers
  const handleTooltipOpen = (content: string, event: React.MouseEvent) => {
    // Clear any pending close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipState({
      open: true,
      content,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const handleTooltipClose = () => {
    // Clear any pending timeout first
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }

    // Set delay close to allow mouse to move to tooltip
    closeTimeoutRef.current = setTimeout(() => {
      setTooltipState((prev) => ({ ...prev, open: false }));
      closeTimeoutRef.current = null;
    }, 150);
  };

  const handleTooltipMouseEnter = () => {
    // Clear close timeout when entering tooltip
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    // Keep tooltip open when hovering over it
    setTooltipState((prev) => ({ ...prev, open: true }));
  };

  const handleTooltipMouseLeave = () => {
    // Immediate close when leaving tooltip
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setTooltipState((prev) => ({ ...prev, open: false }));
  };

  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [orderItems, setOrderItems] = useState<
    Array<{
      id: string;
      title: string;
      order: number;
      isDeleted?: boolean;
      lessonTitle?: string;
      courseTitle?: string;
    }>
  >([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [orderPage, setOrderPage] = useState(1);
  const [orderPageSize] = useState(12);
  const [orderTotalPages, setOrderTotalPages] = useState(1);

  useEffect(() => {
    if (!showOrderDialog) return;
    if (!lessonId) return;
    let cancelled = false;
    const fetchOrders = async () => {
      setLoadingOrders(true);
      setOrdersError(null);
      try {
        const res = await axiosClient.get(ROUTES_API_CHALLENGE.ADMIN_GET_ALL, {
          params: {
            LessonId: lessonId,
            IncludeDeleted: true,
            PageNumber: orderPage,
            PageSize: orderPageSize,
          },
        });
        const items = (res as any)?.data?.data?.items || [];
        const mapped = items.map((it: any) => ({
          id: it.id,
          title: it.title,
          order: it.order,
          isDeleted: it.isDeleted,
          lessonTitle: it.lessonTitle,
          courseTitle: it.courseTitle,
        }));
        if (!cancelled) {
          setOrderItems(mapped);
          setOrderTotalPages((res as any)?.data?.data?.totalPages || 1);
        }
      } catch (e: any) {
        if (!cancelled) setOrdersError("Không tải được danh sách thứ tự");
      } finally {
        if (!cancelled) setLoadingOrders(false);
      }
    };
    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, [showOrderDialog, lessonId, orderPage]);

  return (
    <Paper
      sx={{
        p: 2,
        height: "auto",
        overflow: "visible",
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
        {translate("admin.challengeInformation")}
      </Typography>

      {/* Map picker trigger moved to header in ChallengeDesignerPage */}

      {/* Title Input */}
      <TextField
        fullWidth
        label={translate("admin.title")}
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

      {/* Description Input */}
      <TextField
        fullWidth
        label={translate("admin.description")}
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
      <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Lưu ý
          </Typography>
          <Tooltip
            title={
              <Box sx={{ p: 1, maxWidth: 300 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Quy tắc thứ tự trong bài học:
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  • Mỗi thử thách chỉ có thể được gán cho một bài học
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  • Ví dụ: Nếu đã có thử thách cho thứ tự 1 trong bài học
                  "String", bạn không thể thêm thử thách khác cho thứ tự 1 trong
                  "String"
                </Typography>
                <Typography variant="body2">
                  • Phải sử dụng thứ tự khác (2, 3, 4...)
                </Typography>
              </Box>
            }
            arrow
            placement="top-start"
            slotProps={{
              popper: {
                style: { zIndex: 1400 },
                modifiers: [
                  {
                    name: "preventOverflow",
                    enabled: true,
                    options: {
                      altBoundary: true,
                      rootBoundary: "viewport",
                      padding: 8,
                    },
                  },
                  {
                    name: "flip",
                    enabled: true,
                    options: {
                      fallbackPlacements: [
                        "top-end",
                        "bottom-start",
                        "bottom-end",
                      ],
                    },
                  },
                ],
              },
            }}
          >
            <IconButton size="small" sx={{ color: "warning.main" }}>
              <InfoOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Course Selection */}
        <PopupSelect
          label="Khóa học"
          value={courseId}
          onChange={onCourseIdChange}
          items={courses}
          loading={courseLoading}
          error={hasTriedSave && !courseId}
          helperText={
            hasTriedSave && !courseId ? "Vui lòng chọn khóa học" : undefined
          }
          pageSize={12}
          getItemLabel={(course) => course.title}
          getItemValue={(course) => course.id}
          noDataMessage="Không có khóa học nào"
          currentPage={coursePage}
          onPageChange={onCoursePageChange || (() => {})}
          totalPages={courseTotalPages}
          title="Chọn khóa học"
          disabled={isEditMode}
        />

        {/* Lesson Selection */}
        <PopupSelect
          label="Bài học"
          value={lessonId}
          onChange={onLessonIdChange}
          items={lessons}
          loading={lessonLoading}
          error={hasTriedSave && !lessonId}
          disabled={!courseId || isEditMode}
          helperText={
            hasTriedSave && !courseId
              ? "Vui lòng chọn khóa học trước"
              : hasTriedSave && !lessonId
              ? "Vui lòng chọn bài học"
              : undefined
          }
          pageSize={12}
          getItemLabel={(lesson) => lesson.title}
          getItemValue={(lesson) => lesson.id}
          noDataMessage={
            !courseId
              ? "Vui lòng chọn khóa học trước"
              : "Không có bài học nào cho khóa học này"
          }
          currentPage={lessonPage}
          onPageChange={onLessonPageChange || (() => {})}
          totalPages={lessonTotalPages}
          title="Chọn bài học"
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr auto" },
            gap: 1,
          }}
        >
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Thứ tự"
            value={order}
            onChange={(e) => onOrderChange(Number(e.target.value))}
            inputProps={{ min: 1, step: 1 }}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setOrderPage(1);
              setShowOrderDialog(true);
            }}
            disabled={!lessonId}
            sx={{ whiteSpace: "nowrap" }}
          >
            Xem thứ tự hiện có
          </Button>
        </Box>

        <FormControl fullWidth size="small">
          <InputLabel>Độ khó (1-5)</InputLabel>
          <Select
            label="Độ khó (1-5)"
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

        <FormControl fullWidth size="small" sx={{ mb: 0 }}>
          <InputLabel>Chế độ thử thách</InputLabel>
          <Select
            label="Chế độ thử thách"
            value={challengeMode}
            onChange={(e) => onChallengeModeChange(Number(e.target.value))}
          >
            <MenuItem value={0}>Mô phỏng</MenuItem>
            <MenuItem value={1}>Vật lý</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Actions moved below Solution in parent; keep hidden here to avoid linter unused props */}
      <Box sx={{ display: "none" }}>
        <Button onClick={() => setOpenChallenge(true)}>
          {challengeJson
            ? "Thử thách (đã cấu hình)"
            : "Thử thách (chưa cấu hình)"}
        </Button>
        <Button onClick={onSaveMap} disabled={!onSaveMap}>
          Lưu Thử Thách
        </Button>
      </Box>

      {/* Save Challenge button moved to parent under Solution */}

      {/* Solution editor moved to ChallengeDesignerPage */}

      {/* Challenge Popup (basic fields first) */}
      <Dialog
        open={openChallenge}
        onClose={() => setOpenChallenge(false)}
        fullWidth
        maxWidth="md"
        sx={{ zIndex: 1300 }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Trình chỉnh sửa thử thách
          <IconButton
            size="small"
            aria-label="spread-help"
            sx={{ color: THEME_COLORS.text.secondary }}
            onMouseEnter={(e) =>
              handleTooltipOpen(
                "Hướng dẫn Phân cách:\n• Khoảng cách giữa các vật phẩm trong cùng một ô\n• 1 vật phẩm: phân cách = 1\n• Nhiều hơn 2: phân cách = 1.2",
                e
              )
            }
            onMouseLeave={handleTooltipClose}
          >
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
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
                    Hướng
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
                Bản đồ
              </Typography>
              <FormControl size="small" sx={{ minWidth: 240 }}>
                <InputLabel>Bản đồ</InputLabel>
                <Select
                  label="Bản đồ"
                  value={selectedTargetKey}
                  onChange={(e) => {
                    const next = e.target.value as string;
                    if (next === "battery") {
                      const hasAnyBattery = batteryTiles.length > 0;
                      if (!hasAnyBattery) {
                        const msg = "Bản đồ Pin: không có pin nào trên bản đồ";
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
                        const msg = "Bản đồ Box: không có hộp nào trên bản đồ";
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
                    Pin trên bản đồ
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {batteryTiles.length === 0 && (
                      <Typography
                        variant="body2"
                        sx={{ color: THEME_COLORS.text.secondary }}
                      >
                        Không tìm thấy pin nào trên bản đồ.
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
                        >{`Ô [${bt.y}, ${bt.x}]`}</Typography>
                        <TextField
                          label="Số lượng"
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
                          label="Loại"
                          size="small"
                          value={bt.type}
                          InputProps={{ readOnly: true }}
                          sx={{ width: 120 }}
                        />
                        <TextField
                          label="Phân cách"
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
                            Cho phép thu thập
                          </Typography>
                          <input
                            type="checkbox"
                            checked={bt.allowedCollect}
                            onChange={(e) =>
                              setBatteryTiles((prev) =>
                                prev.map((b, i) =>
                                  i === idx
                                    ? {
                                        ...b,
                                        allowedCollect: e.target.checked,
                                      }
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
                      Chiến thắng
                    </Typography>
                    <IconButton
                      size="small"
                      aria-label="battery-victory-help"
                      sx={{ color: THEME_COLORS.text.secondary }}
                      onMouseEnter={(e) =>
                        handleTooltipOpen(
                          "Nhập số lượng pin cần thu thập để chiến thắng.\nLưu ý: tổng số yêu cầu phải nhỏ hơn hoặc bằng số lượng pin có sẵn trên bản đồ.",
                          e
                        )
                      }
                      onMouseLeave={handleTooltipClose}
                    >
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
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
                            label="Vàng"
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
                            label="Đỏ"
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
                            label="Xanh lá"
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
                    label="Gợi ý"
                    placeholder="Mô tả điều kiện chiến thắng. Ví dụ: Thu thập tất cả pin vàng bằng câu lệnh if."
                    size="small"
                    value={victoryDescription}
                    error={hasTriedSave && !victoryDescription.trim()}
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
                    Hộp trên bản đồ
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {boxTiles.length === 0 && (
                      <Typography
                        variant="body2"
                        sx={{ color: THEME_COLORS.text.secondary }}
                      >
                        Không tìm thấy hộp nào trên bản đồ.
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
                        >{`Ô [${bx.y}, ${bx.x}]`}</Typography>
                        <TextField
                          label="Số lượng"
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
                          label="Phân cách"
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
                      label="Phân cách"
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
                      Chiến thắng
                    </Typography>
                    <IconButton
                      size="small"
                      aria-label="victory-help"
                      sx={{ color: THEME_COLORS.text.secondary }}
                      onMouseEnter={(e) =>
                        handleTooltipOpen(
                          "Thêm vị trí và số lượng hộp cần đặt để chiến thắng.\nLưu ý: tổng số hộp cần đặt phải nhỏ hơn hoặc bằng số lượng có sẵn.",
                          e
                        )
                      }
                      onMouseLeave={handleTooltipClose}
                    >
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
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
                          label="Số lượng"
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
                      + Thêm mục tiêu
                    </Button>
                    <TextField
                      fullWidth
                      label="Gợi ý"
                      placeholder="Mô tả điều kiện chiến thắng. Ví dụ: Lấy 2 từ kho và đặt 2 tại vị trí mục tiêu."
                      size="small"
                      value={boxVictoryDescription}
                      error={hasTriedSave && !boxVictoryDescription.trim()}
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
                  Ràng buộc
                </Typography>
                <IconButton
                  size="small"
                  aria-label="constraints-help"
                  sx={{ color: THEME_COLORS.text.secondary }}
                  onMouseEnter={(e) =>
                    handleTooltipOpen(
                      "Hướng dẫn Ràng buộc:\n• Chọn các thẻ mà người chơi phải sử dụng để hoàn thành cấp độ\n• Và số lượng thẻ tối thiểu người chơi phải sử dụng",
                      e
                    )
                  }
                  onMouseLeave={handleTooltipClose}
                >
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, color: THEME_COLORS.text.secondary }}
                >
                  Các khối bắt buộc mà người chơi phải sử dụng:
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
                  label="Số lượng thẻ tối thiểu"
                  type="number"
                  size="small"
                  value={minCards}
                  onChange={(e) => setMinCards(Number(e.target.value))}
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="Số lượng thẻ tối đa"
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
                const msg =
                  "Vui lòng chọn Map (Box hoặc Battery) trước khi lưu";
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
                      ? "Giá trị số lượng và phân cách của Box phải từ 1 trở lên"
                      : invalidTile
                      ? "Mỗi box phải có số lượng ít nhất là 1"
                      : "Phân cách phải từ 1 trở lên";
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
              console.log(
                "🤖 [WinConditions] Building payload with robot direction:",
                robotDir
              );
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
              // Pass to parent state
              onChallengeJsonChange?.(JSON.stringify(payload));
              try {
                (window as any).Snackbar?.enqueueSnackbar &&
                  (window as any).Snackbar.enqueueSnackbar(
                    "Lưu thử thách thành công",
                    { variant: "success" }
                  );
              } catch {}
              setOpenChallenge(false);
            }}
          >
            Lưu
          </Button>
          <Button onClick={() => setOpenChallenge(false)}>Đóng</Button>
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
                                  const ROBOT_BASE_LIFT = Math.round(
                                    25 * scaleY
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
                                    stackShift = 25;
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
          <Button onClick={() => setOpenTargetPicker(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
      {/* Local notification container for this section */}
      <Toast />

      {/* Custom Tooltip - Render outside Dialog using Portal */}
      {tooltipState.open &&
        createPortal(
          <Box
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
            sx={{
              position: "fixed",
              left: tooltipState.x,
              top: tooltipState.y,
              transform: "translateX(-50%)",
              zIndex: 99999,
              pointerEvents: "auto", // Enable pointer events for hover
              maxWidth: 300,
              bgcolor: "rgba(0, 0, 0, 0.9)",
              color: "white",
              borderRadius: 2,
              p: 1.5,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
              fontSize: "0.875rem",
              lineHeight: 1.4,
              whiteSpace: "pre-line",
              opacity: 1,
              transition: "all 0.2s ease-in-out",
              animation: "tooltipFadeIn 0.2s ease-out",
              "@keyframes tooltipFadeIn": {
                "0%": {
                  opacity: 0,
                  transform: "translateX(-50%) translateY(-5px) scale(0.95)",
                },
                "100%": {
                  opacity: 1,
                  transform: "translateX(-50%) translateY(0) scale(1)",
                },
              },
              "&::after": {
                content: '""',
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                border: "6px solid transparent",
                borderTopColor: "rgba(0, 0, 0, 0.9)",
              },
            }}
          >
            {tooltipState.content}
          </Box>,
          document.body
        )}
      <Dialog
        open={showOrderDialog}
        onClose={() => setShowOrderDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Thứ tự hiện có trong bài học
          {orderItems.length > 0 &&
            orderItems[0].courseTitle &&
            orderItems[0].lessonTitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {orderItems[0].courseTitle} &gt; {orderItems[0].lessonTitle}
              </Typography>
            )}
        </DialogTitle>
        <DialogContent dividers>
          {loadingOrders ? (
            <Typography variant="body2">Đang tải...</Typography>
          ) : ordersError ? (
            <Typography variant="body2" color="error">
              {ordersError}
            </Typography>
          ) : orderItems.length === 0 ? (
            <Typography variant="body2">Chưa có thử thách nào</Typography>
          ) : (
            <>
              <List dense>
                {orderItems
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((it) => (
                    <ListItem
                      key={it.id}
                      disableGutters
                      secondaryAction={
                        <Chip
                          size="small"
                          label={it.isDeleted ? "Đã xóa" : "Đang hoạt động"}
                          color={it.isDeleted ? "error" : "success"}
                          variant="outlined"
                        />
                      }
                    >
                      <ListItemText primary={`#${it.order} — ${it.title}`} />
                    </ListItem>
                  ))}
              </List>
              {orderTotalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Pagination
                    count={orderTotalPages}
                    page={orderPage}
                    onChange={(_, page: number) => setOrderPage(page)}
                    size="small"
                  />
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowOrderDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

/*
function MiniIsometricPreview({ mapGrid }: { mapGrid: any[][] }) {
  const rows = Array.isArray(mapGrid) ? mapGrid.length : GRID_CONFIG.rows;
  const cols =
    Array.isArray(mapGrid) && mapGrid[0] ? mapGrid[0].length : GRID_CONFIG.cols;
  const dims = getIsometricGridDimensions(rows, cols, ISOMETRIC_CONFIG);
  const LIFT_PER_DIAGONAL = 15.5;
  const DIAGONAL_SPACING = 4.5;

  return (
    <Box
      sx={{
        width: Math.min(520, dims.width + dims.offsetX),
        height: Math.min(360, dims.height),
        overflow: "hidden",
        position: "relative",
        border: `1px solid ${THEME_COLORS.border}`,
        borderRadius: 1,
        bgcolor: THEME_COLORS.background,
        contain: "layout paint size",
      }}
    >
      <Box sx={{ position: "absolute", inset: 0 }}>
        {mapGrid.map((row, rIdx) =>
          row.map((cell: any, cIdx: number) => {
            const terrainAsset = cell?.terrain
              ? MAP_ASSETS.find((a) => a.id === cell.terrain)
              : null;
            const objectAsset = cell?.object
              ? MAP_ASSETS.find((a) => a.id === cell.object)
              : null;
            const pos = gridToIsometric(rIdx, cIdx, ISOMETRIC_CONFIG);
            const left = pos.x + dims.offsetX;
            const top =
              pos.y +
              dims.offsetY -
              (rIdx + cIdx) * LIFT_PER_DIAGONAL +
              (rIdx + cIdx) * DIAGONAL_SPACING;
            const w = ISOMETRIC_CONFIG.tileWidth;
            const h = ISOMETRIC_CONFIG.tileHeight;
            const halfW = w / 2;
            const halfH = h / 2;
            const isEmpty = !terrainAsset && !objectAsset;

            return (
              <svg
                key={`${rIdx}-${cIdx}`}
                style={{
                  position: "absolute",
                  left,
                  top,
                  width: w,
                  height: h,
                  overflow: "visible",
                }}
              >
                {isEmpty && (
                  <polygon
                    points={`${halfW},0 ${w},${halfH} ${halfW},${h} 0,${halfH}`}
                    fill="#ffffff"
                    stroke="#e5e5e5"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                )}
                {terrainAsset?.imagePath && (
                  <image
                    href={terrainAsset.imagePath}
                    x={0}
                    y={0}
                    width={w}
                    height={h}
                    preserveAspectRatio="none"
                  />
                )}
                {objectAsset?.imagePath && (
                  <image
                    href={objectAsset.imagePath}
                    x={w * 0.2}
                    y={h * 0.2 - 12}
                    width={w * 0.6}
                    height={h * 0.6}
                    preserveAspectRatio="xMidYMid meet"
                  />
                )}
              </svg>
            );
          })
        )}
      </Box>
    </Box>
  );
}
*/
