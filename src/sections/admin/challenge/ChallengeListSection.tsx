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
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Map as MapIcon,
  PlayArrow as PlayIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getChallenges } from "../../../redux/challenge/challengeSlice";
import { ChallengeMode } from "common/@types/challenge";
import dayjs from "dayjs";

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
  const { challenges } = useAppSelector((state) => state.challenge);

  const [searchTerm, setSearchTerm] = useState("");
  const [modeFilter, setModeFilter] = useState<ChallengeMode | "">("");

  useEffect(() => {
    dispatch(
      getChallenges({
        searchTerm: searchTerm || undefined,
        pageNumber: 1,
        pageSize: 50,
      })
    );
  }, [dispatch, searchTerm, modeFilter]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleModeFilterChange = (event: any) => {
    setModeFilter(event.target.value);
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
          onClick={onCreateNew}
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Mode</InputLabel>
              <Select
                value={modeFilter}
                label="Mode"
                onChange={handleModeFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value={ChallengeMode.Simulation}>Simulation</MenuItem>
                <MenuItem value={ChallengeMode.PhysicalFirst}>
                  Physical First
                </MenuItem>
                <MenuItem value={ChallengeMode.SimulationPhysical}>
                  Simulation Physical
                </MenuItem>
              </Select>
            </FormControl>
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
              <TableCell>Map</TableCell>
              <TableCell align="center">Mode</TableCell>
              <TableCell align="center">Difficulty</TableCell>
              <TableCell align="center">Order</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {challenges.data?.items?.map((challenge) => (
              <TableRow key={challenge.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      {challenge.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {challenge.description}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <MapIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="body2">
                      {challenge.mapId || "No map"}
                    </Typography>
                  </Box>
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
                <TableCell align="right">
                  <IconButton
                    size="small"
                    title="View Challenge"
                    onClick={() => onViewDetails?.(challenge)}
                  >
                    <ViewIcon />
                  </IconButton>
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
                  <IconButton
                    size="small"
                    color="error"
                    title="Delete Challenge"
                  >
                    <DeleteIcon />
                  </IconButton>
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
              {searchTerm || modeFilter
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
      </Paper>
    </Box>
  );
}
