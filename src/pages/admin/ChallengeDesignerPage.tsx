import {
  Box,
  Container,
  Typography,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import AdminLayout from "layout/admin/AdminLayout";
import { MapCell } from "common/models";
import {
  WorkspaceSection,
  MapGridSection,
  WinConditionsSection,
  IsometricMapGridV2,
} from "sections/admin/mapDesigner";
import MiniIsometricMapGrid from "sections/admin/mapDesigner/MiniIsometricMapGrid";
import { GRID_CONFIG } from "sections/admin/mapDesigner/theme.config";
import { MAP_ASSETS } from "sections/admin/mapDesigner/mapAssets.config";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ThreeDRotationIcon from "@mui/icons-material/ThreeDRotation";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import { axiosClient } from "axiosClient";
import { ROUTES_API_CHALLENGE } from "constants/routesApiKeys";
import { extractApiErrorMessage } from "utils/errorHandler";
import { useAppDispatch, useAppSelector } from "../../redux/config";
import { useLocales } from "hooks";
import {
  getCoursesForAdmin,
  setMessageSuccess,
  setMessageError,
} from "../../redux/course/courseSlice";
import {
  getLessons,
  getLessonsByCourse,
  getLessonByIdForAdmin,
} from "../../redux/lesson/lessonSlice";
import MapPickerDialog from "sections/admin/map/MapPickerDialog";
import BlocksWorkspace from "sections/studio/BlocksWorkspace";
import { BlocklyToPhaserConverter } from "../../features/phaser/services/blocklyToPhaserConverter";

const MapDesignerPage = () => {
  const dispatch = useAppDispatch();
  const { translate } = useLocales();
  const { data: coursesData } = useAppSelector((s) => s.course.adminCourses);
  const { data: lessonsData } = useAppSelector((s) => s.lesson.courseLessons);

  // Debug: Log data to see pagination info

  const [selectedAsset, setSelectedAsset] = useState<string>("robot_east");

  // Debug log when selectedAsset changes
  useEffect(() => {
    console.log(
      "🤖 [ChallengeDesigner] selectedAsset changed to:",
      selectedAsset
    );
  }, [selectedAsset]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mapName, setMapName] = useState<string>("Thử thách mới");
  const [mapDescription, setMapDescription] = useState<string>("");
  // Keep original solution JSON only for save conversion; render uses dedicated state to avoid side effects
  const initialSolutionJsonRef = useRef<string | null>(null);
  // Buffer new solution JSON here so UI state doesn't change and won't disturb map
  // pendingSolutionJsonRef removed; we build from workspace at save time
  const [challengeJson, setChallengeJson] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string>("");
  const [lessonId, setLessonId] = useState<string>("");
  const [order, setOrder] = useState<number>(1);
  const [difficulty, setDifficulty] = useState<number>(1);
  const [challengeMode, setChallengeMode] = useState<number>(0);
  const [openUpdateConfirm, setOpenUpdateConfirm] = useState(false);
  const [hasTriedSave, setHasTriedSave] = useState(false);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [solutionDialogOpen] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [selectedMapTitle, setSelectedMapTitle] =
    useState<string>("Chưa chọn bản đồ");
  const [viewMode, setViewMode] = useState<"orthogonal" | "isometric">(
    "isometric"
  );

  const [mapGrid, setMapGrid] = useState<MapCell[][]>(
    Array(GRID_CONFIG.rows)
      .fill(null)
      .map((_, row) =>
        Array(GRID_CONFIG.cols)
          .fill(null)
          .map((_, col) => ({
            row,
            col,
            terrain: null,
            object: null,
          }))
      )
  );

  // Disable automatic ResizeObserver + debounce to avoid size recalculation when unrelated state updates
  const [enableAutoResize] = useState<boolean>(false);
  const debounceTimerRef = useRef<any>(null);
  // Snapshot of last good terrain grid to recover from accidental resets
  const terrainSnapshotRef = useRef<MapCell[][] | null>(null);
  const solutionWorkspaceRef = useRef<any>(null);
  const openChallengeDialogRef = useRef<(() => void) | null>(null);

  const countTerrainCells = (grid: MapCell[][]): number => {
    try {
      let n = 0;
      for (const row of grid) {
        for (const cell of row) {
          if (cell && cell.terrain) n++;
        }
      }
      return n;
    } catch {
      return 0;
    }
  };

  // State for pagination
  const [coursePage, setCoursePage] = useState(1);
  const [lessonPage, setLessonPage] = useState(1);
  const [courseLoading, setCourseLoading] = useState(false);
  const [lessonLoading, setLessonLoading] = useState(false);

  // Debug: Log page changes

  // Fetch courses with pagination
  useEffect(() => {
    const fetchCourses = async () => {
      setCourseLoading(true);
      try {
        await dispatch(
          getCoursesForAdmin({
            pageNumber: coursePage,
            pageSize: 12,
          })
        );
      } finally {
        setCourseLoading(false);
      }
    };
    fetchCourses();
  }, [dispatch, coursePage]);

  // Fetch lessons when courseId changes
  useEffect(() => {
    if (courseId) {
      setLessonId(""); // Reset lesson selection when course changes
      setLessonPage(1); // Reset lesson page when course changes
    }
  }, [courseId]);

  // Fetch lessons when courseId or lessonPage changes
  useEffect(() => {
    if (courseId) {
      const fetchLessons = async () => {
        setLessonLoading(true);
        try {
          await dispatch(
            getLessonsByCourse({
              courseId,
              pageNumber: lessonPage,
              pageSize: 12,
            })
          );
        } finally {
          setLessonLoading(false);
        }
      };
      fetchLessons();
    }
  }, [dispatch, courseId, lessonPage]);

  // Prefill from query params when navigated from Map Management (Edit)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qpTitle = params.get("title");
    const qpDescription = params.get("description");
    const qpOrder = params.get("order");
    const qpDifficulty = params.get("difficulty");
    const qpLessonId = params.get("lessonId");
    const qpId = params.get("id");

    if (qpTitle) setMapName(qpTitle);
    if (qpDescription) setMapDescription(qpDescription);
    if (qpOrder && !Number.isNaN(Number(qpOrder))) setOrder(Number(qpOrder));
    if (qpDifficulty && !Number.isNaN(Number(qpDifficulty)))
      setDifficulty(Number(qpDifficulty));
    if (qpLessonId) setLessonId(qpLessonId);

    // If an id is present, set edit mode and fetch details to load mapJson and solution/challenge into state
    if (qpId) {
      setEditingId(qpId);
      (async () => {
        try {
          // Admin detail endpoint for challenge edit
          const res = await axiosClient.get(`/api/v1/challenges/admin/${qpId}`);
          const item = res?.data?.data;
          if (item?.solutionJson) {
            initialSolutionJsonRef.current = item.solutionJson;
          }
          if (item?.challengeJson) setChallengeJson(item.challengeJson);

          // Set challenge fields from API response
          if (item?.title) setMapName(item.title);
          if (item?.description) setMapDescription(item.description);
          if (typeof item?.order === "number") setOrder(item.order);
          if (typeof item?.difficulty === "number")
            setDifficulty(item.difficulty);
          if (typeof item?.challengeMode === "number")
            setChallengeMode(item.challengeMode);

          // Find courseId from lessonId for edit mode
          if (item?.lessonId) {
            try {
              const lessonResult = await dispatch(
                getLessonByIdForAdmin(item.lessonId)
              ).unwrap();
              if (lessonResult?.courseId) {
                setCourseId(lessonResult.courseId);
                // Fetch lessons for this course
                await dispatch(
                  getLessons({
                    courseId: lessonResult.courseId,
                    includeDeleted: true,
                  })
                );
                // Set lessonId after fetching lessons
                setLessonId(item.lessonId);
              }
            } catch (error) {
              console.error(
                "Error fetching lesson details for courseId:",
                error
              );
            }
          }

          // Prefer load map by mapId when available (admin detail)
          let newGrid: (MapCell & { itemCount?: number })[][] | null = null;
          if (item?.mapId) {
            try {
              const mapRes = await axiosClient.get(
                `/api/v1/maps/${item.mapId}`
              );
              const map = (mapRes as any)?.data?.data || (mapRes as any)?.data;
              if (map?.id) {
                setSelectedMapId(map.id);
                setSelectedMapTitle(map.title || "Bản đồ không xác định");
              }
              const mapJsonStr = map?.mapJson as string | undefined;
              if (mapJsonStr) {
                try {
                  const parsed = JSON.parse(mapJsonStr);
                  const width: number = parsed?.width ?? GRID_CONFIG.cols;
                  const height: number = parsed?.height ?? GRID_CONFIG.rows;
                  const layer = Array.isArray(parsed?.layers)
                    ? parsed.layers[0]
                    : null;
                  const data: number[] = Array.isArray(layer?.data)
                    ? layer.data
                    : [];
                  if (data.length >= width * height) {
                    const idToTerrain: Record<number, string | null> = {
                      0: null,
                      1: "road_v",
                      2: "road_h",
                      3: "wood",
                      4: "water",
                      5: "grass",
                      6: "crossroad",
                    };
                    // Use actual map dimensions instead of GRID_CONFIG
                    newGrid = Array(height)
                      .fill(null)
                      .map((_, row) =>
                        Array(width)
                          .fill(null)
                          .map((_, col) => {
                            const idx = row * width + col;
                            const tileId = data[idx] || 0;
                            const terrain = idToTerrain[tileId] ?? null;
                            return {
                              row,
                              col,
                              terrain: terrain as any,
                              object: null,
                              itemCount: 0,
                            } as any;
                          })
                      );
                  }
                } catch (e) {
                  // ignore
                }
              }
              if (newGrid) {
                setMapGrid(newGrid);
                // Save terrain snapshot
                terrainSnapshotRef.current = newGrid.map((r) =>
                  r.map((c) => ({ ...c }))
                );
              }
            } catch (e) {
              // ignore map fetch errors
            }
          }

          // Overlay challengeJson robot/items
          try {
            const chStr: string | null | undefined = item?.challengeJson;
            if (chStr && newGrid) {
              const ch = JSON.parse(chStr);

              // Robot
              const robot = ch?.robot;
              if (
                robot?.tile &&
                typeof robot.tile.x === "number" &&
                typeof robot.tile.y === "number"
              ) {
                const r = robot.tile.y;
                const c = robot.tile.x;
                if (
                  r >= 0 &&
                  r < newGrid!.length &&
                  c >= 0 &&
                  c < newGrid![0].length
                ) {
                  const dir = String(robot.direction || "east").toLowerCase();
                  const dirToAsset: Record<string, string> = {
                    north: "robot_north",
                    east: "robot_east",
                    south: "robot_south",
                    west: "robot_west",
                  };
                  // Don't overwrite terrain, just add object
                  newGrid[r][c].object = dirToAsset[dir] || "robot_east";
                  newGrid[r][c].itemCount = 1;
                }
              }

              // Boxes
              const boxes = Array.isArray(ch?.boxes) ? ch.boxes : [];
              boxes.forEach((box: any) => {
                const tiles = Array.isArray(box?.tiles) ? box.tiles : [];
                tiles.forEach((t: any) => {
                  const c = t?.x;
                  const r = t?.y;
                  const count = typeof t?.count === "number" ? t.count : 1;
                  if (
                    typeof r === "number" &&
                    typeof c === "number" &&
                    r >= 0 &&
                    r < newGrid!.length &&
                    c >= 0 &&
                    c < newGrid![0].length
                  ) {
                    // Don't overwrite terrain, just add object
                    newGrid![r][c].object = "box";
                    newGrid![r][c].itemCount = count;
                  }
                });
              });

              // Batteries
              const batteries = Array.isArray(ch?.batteries)
                ? ch.batteries
                : [];
              const typeToAsset: Record<string, string> = {
                yellow: "pin_yellow",
                red: "pin_red",
                green: "pin_green",
              };
              batteries.forEach((batt: any) => {
                const tiles = Array.isArray(batt?.tiles) ? batt.tiles : [];
                tiles.forEach((t: any) => {
                  const c = t?.x;
                  const r = t?.y;
                  const count = typeof t?.count === "number" ? t.count : 1;
                  const type = String(t?.type || "yellow").toLowerCase();
                  const assetId = typeToAsset[type] || "pin_yellow";
                  if (
                    typeof r === "number" &&
                    typeof c === "number" &&
                    r >= 0 &&
                    r < newGrid!.length &&
                    c >= 0 &&
                    c < newGrid![0].length
                  ) {
                    // Don't overwrite terrain, just add object
                    newGrid![r][c].object = assetId as any;
                    newGrid![r][c].itemCount = count;
                  }
                });
              });
            }
          } catch {}

          if (newGrid) {
            setMapGrid(newGrid);
          }
        } catch (e) {
          // ignore fetch errors
        }
      })();
    }
  }, []);

  // Force reflow when page mounts (minimized to avoid flicker)
  useEffect(() => {
    const tick = () => window.dispatchEvent(new Event("resize"));
    requestAnimationFrame(tick);
    const t = setTimeout(tick, 120);
    return () => clearTimeout(t);
  }, []);

  // Fixed viewport: no re-measure needed when toggling view mode
  useEffect(() => {}, [viewMode]);

  // Fixed viewport: no ResizeObserver
  useEffect(() => {}, [solutionDialogOpen, enableAutoResize]);

  // Fixed viewport: no debounce sizing
  useEffect(() => {}, []);

  // Fixed viewport: no lock/unlock needed
  useEffect(() => {}, [solutionDialogOpen]);

  // Handle browser tab visibility/focus changes to prevent "bunging" after returning
  useEffect(() => {
    const handleSolutionUpdating = (e: any) => {
      // When Solution save completes (detail=false), restore terrain if lost
      try {
        const done = e && e.detail === false;
        if (done) {
          const lostTerrain = countTerrainCells(mapGrid) === 0;
          if (lostTerrain && terrainSnapshotRef.current) {
            setMapGrid(
              terrainSnapshotRef.current.map((r) => r.map((c) => ({ ...c })))
            );
          }
        }
      } catch {}
    };
    const handleMapPickerOpen = (e: any) => {
      const isOpen = !!e?.detail;
      if (isOpen) {
        // Ensure no resize logic runs while map picker dialog is open
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
        // Guard: if terrain was lost unexpectedly, restore snapshot
        const lostTerrain = countTerrainCells(mapGrid) === 0;
        if (lostTerrain && terrainSnapshotRef.current) {
          setMapGrid(
            terrainSnapshotRef.current.map((r) => r.map((c) => ({ ...c })))
          );
        }
      }
    };

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "hidden") return;

      // Fixed viewport: no re-measure on focus/visibility
    };

    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);
    window.addEventListener("solution-updating", handleSolutionUpdating as any);
    window.addEventListener("map-picker-open", handleMapPickerOpen as any);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      window.removeEventListener(
        "solution-updating",
        handleSolutionUpdating as any
      );
      window.removeEventListener("map-picker-open", handleMapPickerOpen as any);
    };
  }, [viewMode, mapGrid]);

  // const gridKey = `${viewMode}-${containerSizeStable.w}x${containerSizeStable.h}-${isoRemountId}`;

  // Unused legacy panel; keep commented reference for future if needed
  /* const IsometricMapPanel = memo(
    ({
      isoReadyProp,
      frozenSizeProp,
      containerSizeProp,
      gridKeyProp,
      mapGridProp,
      selectedAssetProp,
      onCellClickProp,
    }: {
      isoReadyProp: boolean;
      frozenSizeProp: { w: number; h: number } | null;
      containerSizeProp: { w: number; h: number };
      gridKeyProp: string;
      mapGridProp: MapCell[][];
      selectedAssetProp: string;
      onCellClickProp: (row: number, col: number) => void;
    }) => {
      return (
        <Box
          ref={gridContainerRef}
          sx={{
            height: "100%",
            width: "100%",
            position: "relative",
            minHeight: "700px",
            ...(frozenSizeProp
              ? {
                  width: `${frozenSizeProp.w}px`,
                  height: `${frozenSizeProp.h}px`,
                  overflow: "hidden",
                }
              : {}),
          }}
        >
          {isoReadyProp &&
          (frozenSizeProp ||
            (containerSizeProp.w > 0 && containerSizeProp.h > 0)) ? (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: `${
                  frozenSizeProp ? frozenSizeProp.w : containerSizeProp.w
                }px`,
                height: `${
                  frozenSizeProp ? frozenSizeProp.h : containerSizeProp.h
                }px`,
                overflow: "hidden",
              }}
            >
              <SimpleIsometricMapGrid
                key={gridKeyProp}
                mapGrid={mapGridProp}
                selectedAsset={selectedAssetProp}
                onCellClick={onCellClickProp}
              />
            </Box>
          ) : null}
        </Box>
      );
    }
  ); */

  const handleCellClick = (row: number, col: number) => {
    const newGrid = [...mapGrid];
    const asset = MAP_ASSETS.find((a) => a.id === selectedAsset);
    const currentCell = newGrid[row][col];

    if (!asset) {
      return;
    }

    // Tool actions
    if (selectedAsset === "eraser") {
      // Simple rule: if cell has itemCount > 1, decrement; else clear object
      if ((currentCell.itemCount || 0) > 1) {
        currentCell.itemCount = (currentCell.itemCount || 1) - 1;
      } else {
        currentCell.object = null;
        currentCell.itemCount = 0;
      }
    } else if (selectedAsset === "empty") {
      // Clear the cell completely
      currentCell.terrain = null;
      currentCell.object = null;
      currentCell.itemCount = 0;
    }
    // Asset placement
    else if (asset.category === "terrain") {
      // Terrain placement disabled in Challenge Designer (read-only display only)
      return;
    } else if (asset.category === "robot") {
      // Only one robot allowed per map
      newGrid.forEach((gridRow) =>
        gridRow.forEach((cell) => {
          if (
            cell.object &&
            MAP_ASSETS.find((a) => a.id === cell.object)?.category === "robot"
          ) {
            cell.object = null;
          }
        })
      );
      currentCell.object = selectedAsset;
    } else if (asset.category === "item") {
      // Items (including box): clicking same item stacks count on the same cell
      if (currentCell.object === selectedAsset) {
        currentCell.itemCount = (currentCell.itemCount || 0) + 1;
      } else {
        currentCell.object = selectedAsset;
        currentCell.itemCount = 1;
      }
    } else if (asset.category === "object") {
      // Handle other objects (obstacles, decorations)
      if (currentCell.object === selectedAsset) {
        // Remove if same object is clicked again
        currentCell.object = null;
      } else {
        // Replace with new object
        currentCell.object = selectedAsset;
      }
    }

    setMapGrid(newGrid);
  };

  const handleSaveMap = async () => {
    // Set hasTriedSave to true to show validation messages
    setHasTriedSave(true);

    // Build solution JSON directly from current workspace (unwrapped program)
    let solutionJsonToSave: string | null = null;
    try {
      if (solutionWorkspaceRef.current) {
        try {
          const ws = solutionWorkspaceRef.current;
          const tops = ws.getTopBlocks(true) || [];
          const start = tops.find((b: any) => b?.type === "ottobit_start");
          const first = start?.nextConnection?.targetBlock?.();
          let cur = first;
          const seq: string[] = [];
          while (cur) {
            seq.push(cur.type);
            cur = cur.nextConnection?.targetBlock?.() || null;
          }
        } catch {}
        const program = BlocklyToPhaserConverter.convertWorkspace(
          solutionWorkspaceRef.current
        );
        // Remove version/programName before sending
        const sanitizedProgram = (() => {
          try {
            const { actions, functions } = (program as any) || {};
            const result: any = {};
            if (Array.isArray(actions)) result.actions = actions;
            if (Array.isArray(functions)) result.functions = functions;
            return result;
          } catch {
            return program;
          }
        })();
        solutionJsonToSave = JSON.stringify(sanitizedProgram);
      }
    } catch {}
    // Validate required fields
    if (!courseId || courseId.trim().length === 0) {
      const msg = "Vui lòng chọn Khóa học trước khi lưu";
      dispatch(setMessageError(msg));
      return;
    }

    if (!lessonId || lessonId.trim().length === 0) {
      const msg = "Vui lòng chọn Bài học trước khi lưu";
      dispatch(setMessageError(msg));
      return;
    }
    const nameTrim = (mapName || "").trim();
    const descTrim = (mapDescription || "").trim();
    const missingName = nameTrim.length === 0;
    const missingDescription = descTrim.length === 0;
    const tooShortDescription = !missingDescription && descTrim.length < 10;

    if (missingName || missingDescription || tooShortDescription) {
      let msg = "";
      if (missingName && missingDescription) {
        msg = "Vui lòng nhập tên và mô tả thử thách";
      } else if (missingName) {
        msg = "Vui lòng nhập tên thử thách";
      } else if (missingDescription) {
        msg = "Vui lòng nhập mô tả thử thách";
      } else if (tooShortDescription) {
        msg = "Mô tả thử thách phải có ít nhất 10 ký tự";
      }
      const variant: "error" | "warning" =
        missingName || missingDescription ? "error" : "warning";
      if (variant === "error") {
        dispatch(setMessageError(msg));
      } else {
        dispatch(setMessageSuccess(msg));
      }
      return;
    }

    // Validate: must have a robot placed on the map
    let hasRobot = false;
    outer: for (const row of mapGrid) {
      for (const cell of row) {
        if (!cell.object) continue;
        const asset = MAP_ASSETS.find((a) => a.id === cell.object);
        if (asset && (asset as any).category === "robot") {
          hasRobot = true;
          break outer;
        }
      }
    }

    // Continue to build payload first; for editing, we'll open confirm right before API call
    if (!hasRobot) {
      const msg = "Vui lòng đặt robot trên bản đồ trước khi lưu";
      dispatch(setMessageError(msg));
      return;
    }

    // Validate: solution and challenge must be configured
    const missingSolution = (solutionJsonToSave || "").trim().length === 0;
    const missingChallenge =
      !challengeJson || challengeJson.trim().length === 0;
    if (missingSolution || missingChallenge) {
      const msg =
        missingSolution && missingChallenge
          ? "Vui lòng cấu hình Giải pháp và Thử thách trước khi lưu"
          : missingSolution
          ? "Vui lòng cấu hình Giải pháp trước khi lưu"
          : "Vui lòng cấu hình Thử thách trước khi lưu";
      dispatch(setMessageError(msg));
      return;
    }

    // Extra validation for Battery challenge: per-color victory must not exceed available pins on map
    try {
      const ch = JSON.parse(challengeJson || "{}");
      const victory = ch?.victory || {};
      const batteries = Array.isArray(ch?.batteries) ? ch.batteries : [];
      const batteryTiles =
        batteries.length > 0 && Array.isArray(batteries[0]?.tiles)
          ? batteries[0].tiles
          : [];
      if (Array.isArray(victory?.byType) && victory.byType.length > 0) {
        const needObj = victory.byType[0] || {};
        const need = {
          yellow: Math.max(0, Number(needObj.yellow) || 0),
          red: Math.max(0, Number(needObj.red) || 0),
          green: Math.max(0, Number(needObj.green) || 0),
        };
        const have = { yellow: 0, red: 0, green: 0 } as Record<string, number>;
        for (const t of batteryTiles) {
          const c = Math.max(1, Number(t?.count) || 0);
          const type = String(t?.type || "yellow").toLowerCase();
          if (type === "red") have.red += c;
          else if (type === "green") have.green += c;
          else have.yellow += c;
        }
        if (
          need.yellow > have.yellow ||
          need.red > have.red ||
          need.green > have.green
        ) {
          const color =
            need.yellow > have.yellow
              ? "yellow"
              : need.red > have.red
              ? "red"
              : "green";
          const msg = `Battery victory for ${color} requires ${need[color]} but only ${have[color]} on map.`;
          dispatch(setMessageError(msg));
          return;
        }
      }
    } catch {
      // ignore parse errors; validation best-effort
    }

    // Selected map is referenced via selectedMapId; we no longer build mapJson here

    // Create lesson form data
    // Use challengeJson as-is from WinConditionsSection
    // WinConditionsSection already handles building complete payload including robot, batteries, etc.
    let currentChallengeJson = challengeJson;

    const lessonData = {
      lessonId,
      title: mapName,
      description: mapDescription,
      order,
      difficulty,
      mapId: selectedMapId,
      challengeJson: currentChallengeJson,
      solutionJson: solutionJsonToSave,
      challengeMode,
    } as any;

    try {
      let res;
      if (editingId) {
        // Ask for confirmation only after all validations pass, before PUT
        setOpenUpdateConfirm(true);
        return;
      } else {
        // Create new challenge
        res = await axiosClient.post(ROUTES_API_CHALLENGE.CREATE, lessonData);
      }
      const ok = res && (res.status === 200 || res.status === 201);
      const msg = ok
        ? editingId
          ? "Cập nhật thử thách thành công"
          : "Tạo thử thách thành công"
        : editingId
        ? "Cập nhật thử thách thất bại"
        : "Tạo thử thách thất bại";
      if (ok) {
        dispatch(setMessageSuccess(msg));
      } else {
        dispatch(setMessageError(msg));
      }
    } catch (e: any) {
      const errorMessage = extractApiErrorMessage(e, "Lưu thử thách thất bại");
      dispatch(setMessageError(errorMessage));
    }
  };

  const handleClearMap = () => {
    setMapGrid(
      Array(GRID_CONFIG.rows)
        .fill(null)
        .map((_, row) =>
          Array(GRID_CONFIG.cols)
            .fill(null)
            .map((_, col) => ({
              row,
              col,
              terrain: null, // Clear to empty
              object: null,
            }))
        )
    );
  };

  // Sync boxes/pins from challengeJson into mapGrid when Challenge modal saves
  const handleChallengeJsonChange = (newJson: string) => {
    setChallengeJson(newJson);
    try {
      const ch = JSON.parse(newJson || "{}");

      // Handle box mode
      const boxes = Array.isArray(ch?.boxes) ? ch.boxes : [];
      const boxTiles =
        boxes.length > 0 && Array.isArray(boxes[0]?.tiles)
          ? boxes[0].tiles
          : [];

      // Handle battery mode
      const batteries = Array.isArray(ch?.batteries) ? ch.batteries : [];
      const batteryTiles =
        batteries.length > 0 && Array.isArray(batteries[0]?.tiles)
          ? batteries[0].tiles
          : [];

      if (boxTiles.length > 0) {
        // Box mode: keep boxes, clear pins
        setMapGrid((prev) => {
          const next = prev.map((row) => row.map((cell) => ({ ...cell })));
          // Clear existing pins only (keep boxes)
          for (const row of next) {
            for (const cell of row) {
              if (cell.object && cell.object.startsWith("pin_")) {
                cell.object = null;
                (cell as any).itemCount = 0;
              }
            }
          }
          // Apply tiles from challengeJson
          boxTiles.forEach((t: any) => {
            const x = Number(t?.x);
            const y = Number(t?.y);
            const count = Math.max(1, Number(t?.count) || 0);
            if (
              Number.isFinite(x) &&
              Number.isFinite(y) &&
              y >= 0 &&
              y < mapGrid.length &&
              x >= 0 &&
              x < mapGrid[0].length
            ) {
              next[y][x].object = "box";
              (next[y][x] as any).itemCount = count;
            }
          });
          // Update terrain snapshot alongside changes
          terrainSnapshotRef.current = next.map((r) =>
            r.map((c) => ({ ...c }))
          );
          return next;
        });
      } else if (batteryTiles.length > 0) {
        // Battery mode: keep pins, clear boxes
        setMapGrid((prev) => {
          const next = prev.map((row) => row.map((cell) => ({ ...cell })));
          // Clear existing boxes only (keep pins)
          for (const row of next) {
            for (const cell of row) {
              if (cell.object === "box") {
                cell.object = null;
                (cell as any).itemCount = 0;
              }
            }
          }
          return next;
        });
      }
    } catch {}
  };

  const handleCourseIdChange = (value: string) => {
    setCourseId(value);
    setLessonId(""); // Reset lesson when course changes
    setHasTriedSave(false); // Reset validation state
  };

  const handleLessonIdChange = (value: string) => {
    setLessonId(value);
    setHasTriedSave(false); // Reset validation state
  };

  return (
    <AdminLayout>
      <Container maxWidth="xl">
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 600, color: "#1B5E20", mb: 1 }}
              >
                {translate("admin.challengeDesigner")}
              </Typography>
            </Box>

            {/* Right controls: Select Map (left) + View Mode Toggle (far right) */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "nowrap",
                justifyContent: "flex-end",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontStyle: "italic",
                  maxWidth: 200,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {selectedMapTitle}
              </Typography>
              <Button variant="outlined" onClick={() => setMapPickerOpen(true)}>
                {translate("admin.selectChangeMap")}
              </Button>
              <Box sx={{ flexShrink: 0 }}>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(_, newMode) => newMode && setViewMode(newMode)}
                  aria-label="view mode"
                  size="small"
                  sx={{ flexWrap: "nowrap" }}
                >
                  <ToggleButton value="orthogonal" aria-label="orthogonal view">
                    <ViewModuleIcon sx={{ mr: 1 }} />
                    {translate("admin.viewMode2D")}
                  </ToggleButton>
                  <ToggleButton value="isometric" aria-label="isometric view">
                    <ThreeDRotationIcon sx={{ mr: 1 }} />
                    {translate("admin.viewMode25D")}
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>
          </Box>
        </Box>

        <Grid
          container
          spacing={2}
          sx={{
            height: "calc(100vh - 200px)", // Increased height (reduced top margin)
            minHeight: "800px", // Increased minimum height
            position: "relative", // Stable positioning
          }}
        >
          {/* Left Panel - Workspace */}
          <Grid item xs={12} md={3}>
            <Box
              sx={{
                height: "100%",
                minHeight: "700px", // Increased minimum height for longer workspace
                position: "relative", // Stable positioning
                // Hard reset spacing like Map Designer lite to avoid inherited styles
                "& .MuiDivider-root": { mb: 0.5 },
                "& .MuiTabs-root": { mb: 0.5, minHeight: 32 },
                "& .MuiTab-root": { minHeight: 32, py: 0.5, px: 1 },
                "& .MuiTabs-root + .MuiBox-root": { mt: 0, pt: 0 },
                "& .MuiBox-root": { mt: 0 },
                "& .MuiTabs-flexContainer": { alignItems: "center" },
              }}
            >
              <WorkspaceSection
                selectedAsset={selectedAsset}
                onAssetSelect={setSelectedAsset}
              />
            </Box>
          </Grid>

          {/* Middle Panel - Map Grid (wider) */}
          <Grid item xs={12} md={9}>
            <Box
              sx={{
                height: "100%",
                minHeight: "700px", // Increased minimum height to match workspace
                position: "relative", // Stable positioning
              }}
            >
              {viewMode === "orthogonal" ? (
                <MapGridSection
                  mapGrid={mapGrid}
                  selectedAsset={selectedAsset}
                  onCellClick={handleCellClick}
                  onSaveMap={handleSaveMap}
                  onClearMap={handleClearMap}
                />
              ) : (
                <Box
                  sx={{ height: "100%", width: "100%", position: "relative" }}
                >
                  <IsometricMapGridV2
                    mapGrid={mapGrid}
                    onCellClick={handleCellClick}
                    diagonalLift={15.5}
                    diagonalSpacing={4.5}
                    offsetX={60}
                    offsetY={60}
                    robotLift={8}
                    itemLift={8}
                    itemStackStep={0}
                  />
                </Box>
              )}
            </Box>
          </Grid>

          {/* Bottom Row - Map Info (moves below for more map space) */}
          <Grid item xs={12}>
            <WinConditionsSection
              mapName={mapName}
              onMapNameChange={setMapName}
              mapDescription={mapDescription}
              onMapDescriptionChange={setMapDescription}
              courseId={courseId}
              onCourseIdChange={handleCourseIdChange}
              lessonId={lessonId}
              onLessonIdChange={handleLessonIdChange}
              order={order}
              onOrderChange={setOrder}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
              challengeMode={challengeMode}
              onChallengeModeChange={setChallengeMode}
              mapGrid={mapGrid}
              onChallengeJsonChange={handleChallengeJsonChange}
              challengeJson={challengeJson}
              onSaveMap={handleSaveMap}
              onOpenMapPicker={() => {
                if (!courseId) {
                  alert(translate("admin.pleasSelectCourse"));
                  return;
                }
                setMapPickerOpen(true);
              }}
              registerOpenChallengeTrigger={(fn: () => void) => {
                (openChallengeDialogRef as any).current = fn;
              }}
              courses={coursesData?.items || []}
              lessons={lessonsData?.items || []}
              hasTriedSave={hasTriedSave}
              coursePage={coursePage}
              onCoursePageChange={setCoursePage}
              lessonPage={lessonPage}
              onLessonPageChange={(page) => {
                setLessonPage(page);
              }}
              courseLoading={courseLoading}
              lessonLoading={lessonLoading}
              courseTotalPages={coursesData?.totalPages || 1}
              lessonTotalPages={lessonsData?.totalPages || 1}
              isEditMode={!!editingId}
            />
            {/* Inline Solution Editor (moved from WinConditionsSection) */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                border: `1px solid #e0e0e0`,
                borderRadius: 1.5,
                minHeight: 500,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                {translate("admin.solution")}
              </Typography>
              <Box sx={{ display: "flex", gap: 0 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <BlocksWorkspace
                    onWorkspaceChange={(ws) => {
                      solutionWorkspaceRef.current = ws;
                    }}
                    initialProgramActionsJson={(() => {
                      try {
                        const raw = initialSolutionJsonRef.current;
                        if (!raw) return undefined;
                        const parsed = JSON.parse(raw);
                        // Support both formats: wrapped {data: {program: ...}} and direct {actions: [...]}
                        return parsed?.data?.program ?? parsed;
                      } catch {
                        return undefined;
                      }
                    })()}
                  />
                </Box>
                <Box
                  sx={{
                    width: 400,
                    height: 500,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {mapGrid && mapGrid.length > 0 ? (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        position: "relative",
                        transformOrigin: "center",
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          height: "100%",
                          pointerEvents: "none",
                          userSelect: "none",
                        }}
                      >
                        <MiniIsometricMapGrid
                          mapGrid={mapGrid}
                          selectedAsset=""
                          onCellClick={() => {}}
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ color: "#999", textAlign: "center" }}
                    >
                      {translate("admin.noMapSelected")}
                    </Typography>
                  )}
                </Box>
              </Box>
              {/* Actions moved under Solution */}
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  gap: 1.5,
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="contained"
                  disableElevation
                  onClick={() => {
                    try {
                      (openChallengeDialogRef as any).current?.();
                    } catch {}
                  }}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "8px",
                    py: 1.5,
                    px: 3,
                    minWidth: 200,
                    bgcolor: challengeJson ? "#4CAF50" : "#FF9800",
                    color: "white",
                    "&:hover": {
                      bgcolor: challengeJson ? "#45a049" : "#F57C00",
                    },
                    boxShadow: challengeJson
                      ? "0 2px 8px rgba(76, 175, 80, 0.3)"
                      : "0 2px 8px rgba(255, 152, 0, 0.3)",
                    transition: "all 0.2s ease-in-out",
                  }}
                  startIcon={
                    challengeJson ? (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "white",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "white",
                          opacity: 0.7,
                        }}
                      />
                    )
                  }
                >
                  {challengeJson
                    ? translate("admin.challengeConfigured")
                    : translate("admin.configureChallenge")}
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  variant="contained"
                  onClick={handleSaveMap}
                  startIcon={editingId ? <SaveIcon /> : <AddIcon />}
                >
                  {editingId ? "Cập nhật" : "Tạo mới"}
                </Button>
              </Box>
              {/* Auto-use buffered solution on Challenge Save; no separate Save Solution button */}
            </Box>
          </Grid>
        </Grid>
        {/* Save button moved inside WinConditionsSection */}
      </Container>
      {/* Map Picker */}
      <MapPickerDialog
        open={mapPickerOpen}
        onClose={() => setMapPickerOpen(false)}
        courseId={courseId}
        onSelect={async (m: any) => {
          setMapPickerOpen(false);
          try {
            const res = await axiosClient.get(`/api/v1/maps/${m.id}`);
            const map = (res as any)?.data?.data || (res as any)?.data || m;
            // do not copy title/description from selected map; only apply mapJson to preview
            // Persist selected map id into local state used for saving challenge
            setSelectedMapId(map.id);
            setSelectedMapTitle(map.title || "Bản đồ không xác định");
            // parse mapJson to apply into grid preview
            if (map?.mapJson) {
              try {
                const parsed =
                  typeof map.mapJson === "string"
                    ? JSON.parse(map.mapJson)
                    : map.mapJson;
                const width: number = parsed?.width ?? GRID_CONFIG.cols;
                const height: number = parsed?.height ?? GRID_CONFIG.rows;
                const layer = Array.isArray(parsed?.layers)
                  ? parsed.layers[0]
                  : null;
                const data: number[] = Array.isArray(layer?.data)
                  ? layer.data
                  : [];
                if (data.length >= width * height) {
                  const idToTerrain: Record<number, string | null> = {
                    0: null,
                    1: "road_v",
                    2: "road_h",
                    3: "wood",
                    4: "water",
                    5: "grass",
                    6: "crossroad",
                  };
                  // Use actual map dimensions instead of GRID_CONFIG
                  const newGrid = Array(height)
                    .fill(null)
                    .map((_, row) =>
                      Array(width)
                        .fill(null)
                        .map((_, col) => {
                          const idx = row * width + col;
                          const tileId = data[idx] || 0;
                          return {
                            row,
                            col,
                            terrain: idToTerrain[tileId] ?? null,
                            object: null,
                          } as any;
                        })
                    );
                  setMapGrid(newGrid);
                  // Save terrain snapshot
                  terrainSnapshotRef.current = newGrid.map((r) =>
                    r.map((c) => ({ ...c }))
                  );
                }
              } catch {}
            }
          } catch {}
        }}
      />
      <Dialog
        open={openUpdateConfirm}
        onClose={() => setOpenUpdateConfirm(false)}
      >
        <DialogTitle>{translate("admin.confirmUpdate")}</DialogTitle>
        <DialogContent>{translate("admin.confirmUpdateMessage")}</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpdateConfirm(false)}>
            {translate("admin.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              setOpenUpdateConfirm(false);
              try {
                // Rebuild solution JSON directly from workspace at update time
                let solutionJsonToSave: string | null = null;
                try {
                  if (solutionWorkspaceRef.current) {
                    const program = BlocklyToPhaserConverter.convertWorkspace(
                      solutionWorkspaceRef.current
                    );
                    // Remove version/programName before sending
                    const sanitizedProgram = (() => {
                      try {
                        const { actions, functions } = (program as any) || {};
                        const result: any = {};
                        if (Array.isArray(actions)) result.actions = actions;
                        if (Array.isArray(functions))
                          result.functions = functions;
                        return result;
                      } catch {
                        return program;
                      }
                    })();
                    solutionJsonToSave = JSON.stringify(sanitizedProgram);
                  }
                } catch {}
                if (
                  !solutionJsonToSave ||
                  solutionJsonToSave.trim().length === 0
                ) {
                  const msg = "Vui lòng cấu hình Giải pháp trước khi lưu";
                  dispatch(setMessageError(msg));
                  return;
                }
                // Use challengeJson as-is from WinConditionsSection for update
                // WinConditionsSection already handles building complete payload including robot, batteries, etc.
                let currentChallengeJson = challengeJson;

                const updateBody = {
                  title: mapName,
                  description: mapDescription,
                  order,
                  difficulty,
                  mapId: selectedMapId,
                  challengeJson: currentChallengeJson,
                  solutionJson: solutionJsonToSave,
                  challengeMode,
                } as any;
                const res = await axiosClient.put(
                  ROUTES_API_CHALLENGE.ADMIN_UPDATE(editingId as string),
                  updateBody
                );
                const ok = res && (res.status === 200 || res.status === 201);
                const msg = ok
                  ? "Cập nhật thử thách thành công"
                  : "Cập nhật thử thách thất bại";
                if (ok) {
                  dispatch(setMessageSuccess(msg));
                } else {
                  dispatch(setMessageError(msg));
                }
              } catch (e: any) {
                const errorMessage = extractApiErrorMessage(
                  e,
                  "Lưu thử thách thất bại"
                );
                dispatch(setMessageError(errorMessage));
              }
            }}
          >
            {translate("admin.update")}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default MapDesignerPage;
