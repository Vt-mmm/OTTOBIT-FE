import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Map as MapIcon,
  PlayArrow as PlayIcon,
  Restore as RestoreIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getChallenges } from "../../../redux/challenge/challengeSlice";
import { ChallengeMode } from "common/@types/challenge";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import Pagination from "@mui/material/Pagination";
import { axiosClient } from "axiosClient";

interface ChallengeListSectionProps {
  onCreateNew?: () => void;
  onEditChallenge?: (challenge: any) => void;
  onViewDetails?: (challenge: any) => void;
}

export default function ChallengeListSection({
  onCreateNew,
  onEditChallenge,
  onViewDetails,
}: ChallengeListSectionProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { challenges } = useAppSelector((state) => state.challenge);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [committedSearch, setCommittedSearch] = useState<string>("");

  useEffect(() => {
    dispatch(
      getChallenges({
        searchTerm: committedSearch || undefined,
        pageNumber: page,
        pageSize,
        includeDeleted: true,
      })
    );
  }, [dispatch, committedSearch, page, pageSize]);

  useEffect(() => {
    const meta = (challenges as any)?.data;
    if (meta?.totalPages) setTotalPages(meta.totalPages);
    else if (meta?.total && meta?.pageSize)
      setTotalPages(Math.max(1, Math.ceil(meta.total / meta.pageSize)));
  }, [challenges]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  const triggerSearch = () => {
    setCommittedSearch(searchTerm.trim());
    setPage(1);
  };

  // removed mode filter

  const refresh = () => {
    dispatch(
      getChallenges({
        searchTerm: committedSearch || undefined,
        pageNumber: page,
        pageSize,
        includeDeleted: true,
      })
    );
  };

  const handleDelete = async (id: string) => {
    try {
      await (axiosClient as any).delete(`/api/v1/challenges/admin/${id}`);
      refresh();
    } catch {}
  };

  const handleRestore = async (id: string) => {
    try {
      await (axiosClient as any).post(`/api/v1/challenges/admin/${id}/restore`);
      refresh();
    } catch {}
  };

  const getModeColor = (mode: ChallengeMode) => {
    switch (mode) {
      case ChallengeMode.Simulation:
        return "primary";
      case ChallengeMode.PhysicalFirst:
        return "success";
      case ChallengeMode.SimulationPhysical:
        return "warning";
      default:
        return "default";
    }
  };

  if (challenges.isLoading && !challenges.data) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          🎯 Challenge Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() =>
            onCreateNew
              ? onCreateNew()
              : navigate("/admin/challenge-designer?mode=create")
          }
        >
          Add Challenge
        </Button>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              fullWidth
              placeholder="Search challenges by title or description..."
              value={searchTerm}
              onChange={handleSearch}
              onKeyDown={(e) => {
                if (e.key === "Enter") triggerSearch();
              }}
              sx={{
                "& .MuiInputBase-root": { pr: 4 },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={triggerSearch}
                      sx={{ mr: 0 }}
                    >
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {/* Mode filter removed */}
          </Box>
        </CardContent>
      </Card>

      {/* Error Display */}
      {challenges.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {challenges.error}
        </Alert>
      )}

      {/* Challenges Table */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Challenge</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center">Mode</TableCell>
              <TableCell align="center">Difficulty</TableCell>
              <TableCell align="center">Order</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {challenges.data?.items?.map((challenge) => (
              <TableRow
                key={challenge.id}
                hover
                sx={{
                  bgcolor: challenge.isDeleted
                    ? "rgba(255,0,0,0.04)"
                    : undefined,
                  border: challenge.isDeleted
                    ? "1px dashed rgba(244,67,54,0.5)"
                    : undefined,
                }}
              >
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      {challenge.title}
                    </Typography>
                    {challenge.isDeleted && (
                      <Chip
                        size="small"
                        label="Deleted"
                        color="error"
                        variant="outlined"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {challenge.description}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      maxWidth: 340,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {challenge.description || "No description"}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={challenge.challengeMode}
                    size="small"
                    color={getModeColor(challenge.challengeMode) as any}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {challenge.difficulty || 1}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{challenge.order}</Typography>
                </TableCell>
                <TableCell>
                  {dayjs(challenge.createdAt).format("DD/MM/YYYY")}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    title="Edit Challenge"
                    onClick={() => onEditChallenge?.(challenge)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" title="Test Challenge">
                    <PlayIcon />
                  </IconButton>
                  {challenge.isDeleted ? (
                    <IconButton
                      size="small"
                      color="success"
                      title="Restore Challenge"
                      onClick={() => handleRestore(challenge.id)}
                    >
                      <RestoreIcon />
                    </IconButton>
                  ) : (
                    <IconButton
                      size="small"
                      color="error"
                      title="Delete Challenge"
                      onClick={() => {
                        setPendingDeleteId(challenge.id);
                        setConfirmOpen(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Empty State */}
        {!challenges.isLoading && challenges.data?.items?.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <MapIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Challenges Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm
                ? "Try adjusting your search or filter criteria"
                : "No challenges have been created yet"}
            </Typography>
            {onCreateNew && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onCreateNew}
              >
                Create First Challenge
              </Button>
            )}
          </Box>
        )}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
          }}
        >
          <FormControl size="small">
            <InputLabel>Page size</InputLabel>
            <Select
              label="Page size"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              sx={{ minWidth: 120 }}
            >
              {[6, 12, 24, 48].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => setPage(v)}
            shape="rounded"
            color="primary"
          />
        </Box>
      </Paper>

      {/* Delete Confirm Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete Challenge</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this challenge?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (pendingDeleteId) await handleDelete(pendingDeleteId);
              setConfirmOpen(false);
              setPendingDeleteId(null);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
