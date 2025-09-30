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
} from "sections/admin/mapDesigner";
import SimpleIsometricMapGrid from "sections/admin/mapDesigner/SimpleIsometricMapGrid";
import MiniIsometricMapGrid from "sections/admin/mapDesigner/MiniIsometricMapGrid";
import { GRID_CONFIG } from "sections/admin/mapDesigner/theme.config";
import { MAP_ASSETS } from "sections/admin/mapDesigner/mapAssets.config";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ThreeDRotationIcon from "@mui/icons-material/ThreeDRotation";
import { axiosClient } from "axiosClient";
import { ROUTES_API_CHALLENGE } from "constants/routesApiKeys";
import { extractApiErrorMessage } from "utils/errorHandler";
import { useAppDispatch, useAppSelector } from "../../redux/config";
import { getCoursesForAdmin } from "../../redux/course/courseSlice";
import {
  getLessons,
  getLessonByIdForAdmin,
} from "../../redux/lesson/lessonSlice";
import MapPickerDialog from "sections/admin/map/MapPickerDialog";
import BlocksWorkspace from "sections/studio/BlocksWorkspace";
import { BlocklyToPhaserConverter } from "../../features/phaser/services/blocklyToPhaserConverter";

const MapDesignerPage = () => {
  const dispatch = useAppDispatch();
  const { data: coursesData } = useAppSelector((s) => s.course.adminCourses);
  const { data: lessonsData } = useAppSelector((s) => s.lesson.lessons);

  const [selectedAsset, setSelectedAsset] = useState<string>("robot_east");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mapName, setMapName] = useState<string>("New Challenge");
  const [mapDescription, setMapDescription] = useState<string>("");
  // Removed solutionJsonRef; we rely on initialSolutionJsonRef for workspace init and
  // always rebuild JSON from workspace when saving
  // Keep the original solution JSON fetched from API for initializing the workspace only
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
  // Isometric map renders with fixed viewport; no readiness gating needed
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [selectedMapTitle, setSelectedMapTitle] =
    useState<string>("No map selected");
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
            terrain: null, // Start with empty cells
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

  // Fetch courses and lessons
  useEffect(() => {
    dispatch(getCoursesForAdmin({ pageSize: 100 }));
  }, [dispatch]);

  // Fetch lessons when courseId changes
  useEffect(() => {
    if (courseId) {
      dispatch(getLessons({ courseId, pageSize: 100 }));
      setLessonId(""); // Reset lesson selection when course changes
    }
  }, [dispatch, courseId]);

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
                setSelectedMapTitle(map.title || "Unknown Map");
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

  // Lightweight toast fallback (top-right) when global Snackbar is unavailable
  const showLocalToast = (
    message: string,
    variant: "success" | "error" | "info" | "warning" = "info"
  ) => {
    const containerId = "local-toast-container";
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      Object.assign(container.style, {
        position: "fixed",
        top: "16px",
        right: "16px",
        zIndex: "2000",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        pointerEvents: "none",
      } as CSSStyleDeclaration);
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    const bgMap: Record<string, string> = {
      success: "#2e7d32",
      error: "#d32f2f",
      info: "#0288d1",
      warning: "#ed6c02",
    };
    // Align styles to MUI/Notistack look & feel
    Object.assign(toast.style, {
      background: bgMap[variant] || "#323232",
      color: "#fff",
      padding: "6px 16px",
      borderRadius: "4px",
      boxShadow:
        "rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px",
      fontSize: "0.875rem",
      lineHeight: "1.43",
      fontWeight: "500",
      letterSpacing: "0.01071em",
      pointerEvents: "auto",
      transition: "opacity 0.3s, transform 0.3s",
      opacity: "0",
      transform: "translateY(-6px)",
    } as CSSStyleDeclaration);
    toast.textContent = message;
    toast.setAttribute("role", "alert");
    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });
    const remove = () => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-6px)";
      setTimeout(() => toast.remove(), 300);
    };
    setTimeout(remove, 2500);
  };

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
        const program = BlocklyToPhaserConverter.convertWorkspace(
          solutionWorkspaceRef.current
        );
        solutionJsonToSave = JSON.stringify(program);
      }
    } catch {}
    // Validate required fields
    if (!courseId || courseId.trim().length === 0) {
      const msg = "Please select a Course before saving";
      try {
        if ((window as any).Snackbar?.enqueueSnackbar) {
          (window as any).Snackbar.enqueueSnackbar(msg, {
            variant: "error",
            anchorOrigin: { vertical: "top", horizontal: "right" },
          });
        } else {
          showLocalToast(msg, "error");
        }
      } catch {
        showLocalToast(msg, "error");
      }
      return;
    }

    if (!lessonId || lessonId.trim().length === 0) {
      const msg = "Please select a Lesson before saving";
      try {
        if ((window as any).Snackbar?.enqueueSnackbar) {
          (window as any).Snackbar.enqueueSnackbar(msg, {
            variant: "error",
            anchorOrigin: { vertical: "top", horizontal: "right" },
          });
        } else {
          showLocalToast(msg, "error");
        }
      } catch {
        showLocalToast(msg, "error");
      }
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
        msg = "Please enter map name and description";
      } else if (missingName) {
        msg = "Please enter map name";
      } else if (missingDescription) {
        msg = "Please enter map description";
      } else if (tooShortDescription) {
        msg = "Map description must be at least 10 characters";
      }
      const variant: "error" | "warning" =
        missingName || missingDescription ? "error" : "warning";
      try {
        if ((window as any).Snackbar?.enqueueSnackbar) {
          (window as any).Snackbar.enqueueSnackbar(msg, {
            variant,
            anchorOrigin: { vertical: "top", horizontal: "right" },
          });
        } else {
          showLocalToast(msg, variant);
        }
      } catch {
        showLocalToast(msg, variant);
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
      const msg = "Please place a robot on the map before saving";
      try {
        if ((window as any).Snackbar?.enqueueSnackbar) {
          (window as any).Snackbar.enqueueSnackbar(msg, {
            variant: "error",
            anchorOrigin: { vertical: "top", horizontal: "right" },
          });
        } else {
          showLocalToast(msg, "error");
        }
      } catch {
        showLocalToast(msg, "error");
      }
      return;
    }

    // Validate: solution and challenge must be configured
    const missingSolution = (solutionJsonToSave || "").trim().length === 0;
    const missingChallenge =
      !challengeJson || challengeJson.trim().length === 0;
    if (missingSolution || missingChallenge) {
      const msg =
        missingSolution && missingChallenge
          ? "Please configure Solution and Challenge before saving"
          : missingSolution
          ? "Please configure Solution before saving"
          : "Please configure Challenge before saving";
      try {
        if ((window as any).Snackbar?.enqueueSnackbar) {
          (window as any).Snackbar.enqueueSnackbar(msg, {
            variant: "error",
            anchorOrigin: { vertical: "top", horizontal: "right" },
          });
        } else {
          showLocalToast(msg, "error");
        }
      } catch {
        showLocalToast(msg, "error");
      }
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
          if ((window as any).Snackbar?.enqueueSnackbar) {
            (window as any).Snackbar.enqueueSnackbar(msg, {
              variant: "error",
              anchorOrigin: { vertical: "top", horizontal: "right" },
            });
          } else {
            showLocalToast(msg, "error");
          }
          return;
        }
      }
    } catch {
      // ignore parse errors; validation best-effort
    }

    // Selected map is referenced via selectedMapId; we no longer build mapJson here

    // Create lesson form data
    const lessonData = {
      lessonId,
      title: mapName,
      description: mapDescription,
      order,
      difficulty,
      mapId: selectedMapId,
      challengeJson: challengeJson,
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
        ? "Challenge saved successfully"
        : "Failed to save challenge";
      const variant = ok ? "success" : "error";
      if ((window as any).Snackbar?.enqueueSnackbar) {
        (window as any).Snackbar.enqueueSnackbar(msg, {
          variant,
          anchorOrigin: { vertical: "top", horizontal: "right" },
        });
      } else {
        showLocalToast(msg, variant as any);
      }
    } catch (e: any) {
      const errorMessage = extractApiErrorMessage(
        e,
        "Failed to save challenge"
      );
      if ((window as any).Snackbar?.enqueueSnackbar) {
        (window as any).Snackbar.enqueueSnackbar(errorMessage, {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        });
      } else {
        showLocalToast(errorMessage, "error");
      }
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

  // Sync boxes from challengeJson into mapGrid when Challenge modal saves
  const handleChallengeJsonChange = (newJson: string) => {
    setChallengeJson(newJson);
    try {
      const ch = JSON.parse(newJson || "{}");
      const boxes = Array.isArray(ch?.boxes) ? ch.boxes : [];
      const tiles =
        boxes.length > 0 && Array.isArray(boxes[0]?.tiles)
          ? boxes[0].tiles
          : [];
      if (!Array.isArray(tiles)) return;
      setMapGrid((prev) => {
        const next = prev.map((row) => row.map((cell) => ({ ...cell })));
        // Clear existing boxes
        for (const row of next) {
          for (const cell of row) {
            if (cell.object === "box") {
              cell.object = null;
              (cell as any).itemCount = 0;
            }
          }
        }
        // Apply tiles from challengeJson
        tiles.forEach((t: any) => {
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
        terrainSnapshotRef.current = next.map((r) => r.map((c) => ({ ...c })));
        return next;
      });
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
                Challenge Designer
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
                Select / Change Map
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
                    2D View
                  </ToggleButton>
                  <ToggleButton value="isometric" aria-label="isometric view">
                    <ThreeDRotationIcon sx={{ mr: 1 }} />
                    2.5D View
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
                  <SimpleIsometricMapGrid
                    mapGrid={mapGrid}
                    selectedAsset={selectedAsset}
                    onCellClick={handleCellClick}
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
              onOpenMapPicker={() => setMapPickerOpen(true)}
              registerOpenChallengeTrigger={(fn: () => void) => {
                (openChallengeDialogRef as any).current = fn;
              }}
              courses={coursesData?.items || []}
              lessons={lessonsData?.items || []}
              hasTriedSave={hasTriedSave}
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
                Solution
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
                      No map selected
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
                    ? "Challenge Configured"
                    : "Configure Challenge"}
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                <Button variant="contained" onClick={handleSaveMap}>
                  Save Challenge
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
        onSelect={async (m: any) => {
          setMapPickerOpen(false);
          try {
            const res = await axiosClient.get(`/api/v1/maps/${m.id}`);
            const map = (res as any)?.data?.data || (res as any)?.data || m;
            // do not copy title/description from selected map; only apply mapJson to preview
            // Persist selected map id into local state used for saving challenge
            setSelectedMapId(map.id);
            setSelectedMapTitle(map.title || "Unknown Map");
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
        <DialogTitle>Confirm Update</DialogTitle>
        <DialogContent>
          You are updating an existing map. Proceed?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpdateConfirm(false)}>Cancel</Button>
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
                    solutionJsonToSave = JSON.stringify(program);
                  }
                } catch {}
                if (
                  !solutionJsonToSave ||
                  solutionJsonToSave.trim().length === 0
                ) {
                  const msg = "Please configure Solution before saving";
                  try {
                    if ((window as any).Snackbar?.enqueueSnackbar) {
                      (window as any).Snackbar.enqueueSnackbar(msg, {
                        variant: "error",
                        anchorOrigin: { vertical: "top", horizontal: "right" },
                      });
                    } else {
                      showLocalToast(msg, "error");
                    }
                  } catch {
                    showLocalToast(msg, "error");
                  }
                  return;
                }
                const updateBody = {
                  title: mapName,
                  description: mapDescription,
                  order,
                  difficulty,
                  mapId: selectedMapId,
                  challengeJson: challengeJson,
                  solutionJson: solutionJsonToSave,
                  challengeMode,
                } as any;
                const res = await axiosClient.put(
                  ROUTES_API_CHALLENGE.ADMIN_UPDATE(editingId as string),
                  updateBody
                );
                const ok = res && (res.status === 200 || res.status === 201);
                const msg = ok
                  ? "Challenge saved successfully"
                  : "Failed to save challenge";
                const variant = ok ? "success" : "error";
                if ((window as any).Snackbar?.enqueueSnackbar) {
                  (window as any).Snackbar.enqueueSnackbar(msg, {
                    variant,
                    anchorOrigin: { vertical: "top", horizontal: "right" },
                  });
                } else {
                  showLocalToast(msg, variant as any);
                }
              } catch (e: any) {
                const errorMessage = extractApiErrorMessage(
                  e,
                  "Failed to save challenge"
                );
                if ((window as any).Snackbar?.enqueueSnackbar) {
                  (window as any).Snackbar.enqueueSnackbar(errorMessage, {
                    variant: "error",
                    anchorOrigin: { vertical: "top", horizontal: "right" },
                  });
                } else {
                  showLocalToast(errorMessage, "error");
                }
              }
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default MapDesignerPage;
