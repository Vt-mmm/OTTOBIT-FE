import { useEffect, useState } from "react";
import AdminLayout from "layout/admin/AdminLayout";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
} from "@mui/material";
import { axiosClient } from "axiosClient";
import { ROUTES_API_CHALLENGE } from "constants/routesApiKeys";

interface ChallengeItem {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  order?: number;
  difficulty?: number;
  lessonTitle: string;
  courseTitle: string;
  createdAt?: string;
  updatedAt?: string;
  submissionsCount?: number;
}

export default function MapManagementPage() {
  const [rows, setRows] = useState<ChallengeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMap, setSelectedMap] = useState<ChallengeItem | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get(ROUTES_API_CHALLENGE.GET_ALL, {
          params: { pageNumber: 1, pageSize: 50, IncludeDeleted: true },
        });
        const items: ChallengeItem[] = res?.data?.data?.items || [];
        if (!cancelled) setRows(items);
      } catch (e) {
        try {
          if ((window as any).Snackbar?.enqueueSnackbar) {
            (window as any).Snackbar.enqueueSnackbar(
              "Failed to load map list",
              {
                variant: "error",
                anchorOrigin: { vertical: "top", horizontal: "right" },
              }
            );
          }
        } catch {
          // no-op
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleViewMap = (map: ChallengeItem) => {
    setSelectedMap(map);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMap(null);
  };

  const handleDeleteMap = () => {
    if (!selectedMap) return;
    setOpenDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMap) return;
    setDeleting(true);
    try {
      const res = await axiosClient.delete(
        ROUTES_API_CHALLENGE.DELETE(selectedMap.id)
      );
      const ok = res && (res.status === 200 || res.status === 204);
      if (ok) {
        setRows((prev) => prev.filter((r) => r.id !== selectedMap.id));
        try {
          (window as any).Snackbar?.enqueueSnackbar &&
            (window as any).Snackbar.enqueueSnackbar("Deleted successfully", {
              variant: "success",
              anchorOrigin: { vertical: "top", horizontal: "right" },
            });
        } catch {}
        setOpenDeleteConfirm(false);
        handleCloseDialog();
      } else {
        throw new Error("Delete failed");
      }
    } catch (e) {
      try {
        (window as any).Snackbar?.enqueueSnackbar &&
          (window as any).Snackbar.enqueueSnackbar("Failed to delete map", {
            variant: "error",
            anchorOrigin: { vertical: "top", horizontal: "right" },
          });
      } catch {}
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <Container maxWidth="xl">
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 600, color: "#1B5E20", mb: 1 }}
            >
              Map Management
            </Typography>
            <Typography variant="body1" sx={{ color: "#558B2F" }}>
              List of created maps (challenges)
            </Typography>
          </Box>
          <Button variant="contained" href="/admin/map-designer">
            Create New Map
          </Button>
        </Box>

        <Paper sx={{ p: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Course Title</TableCell>
                <TableCell>Lesson Title</TableCell>
                <TableCell>Order</TableCell>
                <TableCell>Difficulty</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell
                    sx={{
                      maxWidth: 200,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={r.title}
                  >
                    {r.title}
                  </TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 300,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={r.description}
                  >
                    {r.description}
                  </TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 150,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={r.courseTitle}
                  >
                    {r.courseTitle}
                  </TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 150,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={r.lessonTitle}
                  >
                    {r.lessonTitle}
                  </TableCell>
                  <TableCell>{r.order ?? "-"}</TableCell>
                  <TableCell>{r.difficulty ?? "-"}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleViewMap(r)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No data
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>

        {/* Map Details Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Map Details
            </Typography>
          </DialogTitle>
          <DialogContent>
            {selectedMap && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, color: "#1B5E20" }}>
                      {selectedMap.title}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedMap.description}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Basic Information
                    </Typography>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Map ID:
                        </Typography>
                        <Typography variant="body1">
                          {selectedMap.id}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Course:
                        </Typography>
                        <Typography variant="body1">
                          {selectedMap.courseTitle}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Lesson:
                        </Typography>
                        <Typography variant="body1">
                          {selectedMap.lessonTitle}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Created:
                        </Typography>
                        <Typography variant="body1">
                          {selectedMap.createdAt
                            ? new Date(selectedMap.createdAt).toLocaleString()
                            : "Not available"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Last Updated:
                        </Typography>
                        <Typography variant="body1">
                          {selectedMap.updatedAt
                            ? new Date(selectedMap.updatedAt).toLocaleString()
                            : "Not available"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Game Settings
                    </Typography>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Order:
                        </Typography>
                        <Typography variant="body1">
                          {selectedMap.order
                            ? `Level ${selectedMap.order}`
                            : "Not set"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Difficulty:
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {selectedMap.difficulty ? (
                            <Chip
                              label={`Level ${selectedMap.difficulty}`}
                              size="small"
                              color={
                                selectedMap.difficulty <= 2
                                  ? "success"
                                  : selectedMap.difficulty <= 4
                                  ? "warning"
                                  : "error"
                              }
                            />
                          ) : (
                            <Typography variant="body1">Not set</Typography>
                          )}
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Submissions:
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Chip
                            label={`${
                              selectedMap.submissionsCount ?? 0
                            } attempts`}
                            size="small"
                            color="info"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Actions
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Button
                        variant="contained"
                        href={`/studio/${selectedMap.id}`}
                        target="_blank"
                      >
                        Open in Studio
                      </Button>
                      <Button
                        variant="outlined"
                        href={`/admin/map-designer?id=${
                          selectedMap.id
                        }&lessonId=${encodeURIComponent(
                          selectedMap.lessonId || ""
                        )}&title=${encodeURIComponent(
                          selectedMap.title || ""
                        )}&description=${encodeURIComponent(
                          selectedMap.description || ""
                        )}&order=${encodeURIComponent(
                          (selectedMap.order ?? "").toString()
                        )}&difficulty=${encodeURIComponent(
                          (selectedMap.difficulty ?? "").toString()
                        )}`}
                      >
                        Edit Map
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={handleDeleteMap}
                        disabled={deleting}
                      >
                        {deleting ? "Deleting..." : "Delete"}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Close</Button>
          </DialogActions>
        </Dialog>
        {/* Confirm Delete Dialog */}
        <Dialog
          open={openDeleteConfirm}
          onClose={() => setOpenDeleteConfirm(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this map?
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenDeleteConfirm(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AdminLayout>
  );
}
