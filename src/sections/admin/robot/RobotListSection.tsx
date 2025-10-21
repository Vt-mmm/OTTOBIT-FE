import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Pagination,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  SmartToy as RobotIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import {
  getRobotsThunk,
  deleteRobotThunk,
} from "../../../redux/robot/robotThunks";
import { clearSuccessFlags } from "../../../redux/robot/robotSlice";
import { RobotResult } from "../../../common/@types/robot";
import ConfirmDialog from "components/common/ConfirmDialog";
import useLocales from "../../../hooks/useLocales";

interface RobotListSectionProps {
  onViewModeChange: (
    mode: "create" | "edit" | "details",
    robot?: RobotResult
  ) => void | Promise<void>;
}

export default function RobotListSection({
  onViewModeChange,
}: RobotListSectionProps) {
  const dispatch = useAppDispatch();
  const { robots, operations } = useAppSelector((state) => state.robot);
  const { translate } = useLocales();

  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    robotId?: string;
    robotName?: string;
  }>({ open: false });

  // Fetch robots on component mount and pagination changes (no search)
  useEffect(() => {
    const filters = {
      page: pageNumber,
      size: pageSize,
    };

    dispatch(getRobotsThunk(filters));
  }, [dispatch, pageNumber, pageSize]);

  // Clear success flags after operations
  useEffect(() => {
    if (operations.deleteSuccess) {
      dispatch(clearSuccessFlags());
    }
  }, [operations.deleteSuccess, dispatch]);

  const handleDeleteClick = (robot: RobotResult) => {
    setDeleteDialog({
      open: true,
      robotId: robot.id,
      robotName: robot.name,
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.robotId) {
      await dispatch(deleteRobotThunk(deleteDialog.robotId));
      setDeleteDialog({ open: false });
    }
  };

  const handleSearchClick = () => {
    const filters = {
      searchTerm: searchTerm.trim() || undefined,
      page: 1,
      size: pageSize,
    };
    setPageNumber(1);
    dispatch(getRobotsThunk(filters));
  };

  const robotList = robots.data?.items || [];

  if (robots.isLoading && !robots.data) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Search and Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          placeholder={translate("admin.searchRobotPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearchClick} edge="end">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, minWidth: 300 }}
        />

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => onViewModeChange("create")}
          sx={{ ml: "auto" }}
        >
          {translate("admin.addProduct")}
        </Button>
      </Box>

      {/* Success/Error Messages */}
      {operations.deleteSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {translate("admin.robotProductDeletedSuccess")}
        </Alert>
      )}

      {robots.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {robots.error}
        </Alert>
      )}

      {/* Results Summary */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {robots.data &&
          translate("admin.showingRobotProducts", {
            count: robotList.length,
            total: robots.data.total,
          })}
      </Typography>

      {/* Robots Grid */}
      {robotList.length === 0 ? (
        <Box textAlign="center" py={8}>
          <RobotIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" mb={2}>
            {translate("admin.noRobotProductsFound")}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {searchTerm.trim()
              ? translate("admin.tryAdjustingSearchOrFilters")
              : translate("admin.addYourFirstRobot")}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onViewModeChange("create")}
          >
            {translate("admin.addFirstProduct")}
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {robotList.map((robot) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={robot.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                {/* Product Image */}
                <Box
                  sx={{
                    position: "relative",
                    height: 200, // Fixed height for consistency
                    backgroundColor: "grey.100",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    borderRadius: "4px 4px 0 0",
                  }}
                  onClick={() => onViewModeChange("details", robot)}
                >
                  {/* Actual Image Element */}
                  {robot.imageUrl && (
                    <Box
                      component="img"
                      src={robot.imageUrl}
                      alt={`${robot.name} - ${robot.brand}`}
                      sx={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        width: "auto",
                        height: "auto",
                        objectFit: "contain",
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.05)",
                        },
                      }}
                      onError={(e) => {
                        // Hide broken image and show fallback
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}

                  {/* Action Buttons */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 8,
                      right: 8,
                      display: "flex",
                      gap: 0.5,
                    }}
                  >
                    <IconButton
                      size="small"
                      sx={{
                        backgroundColor: "background.paper",
                        "&:hover": { backgroundColor: "grey.100" },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewModeChange("details", robot);
                      }}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{
                        backgroundColor: "background.paper",
                        "&:hover": { backgroundColor: "grey.100" },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewModeChange("edit", robot);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      sx={{
                        backgroundColor: "background.paper",
                        "&:hover": {
                          backgroundColor: "error.light",
                          color: "white",
                        },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(robot);
                      }}
                      disabled={operations.isDeleting}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Default Robot Icon if no image */}
                  {!robot.imageUrl && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          backgroundColor: "primary.main",
                        }}
                      >
                        <RobotIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                    </Box>
                  )}
                </Box>

                {/* Product Info */}
                <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                  <Typography variant="h6" noWrap sx={{ mb: 1 }}>
                    {robot.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="primary.main"
                    noWrap
                    sx={{ mb: 1 }}
                  >
                    {robot.brand} - {robot.model}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: "2.5em",
                    }}
                  >
                    {robot.description ||
                      translate("admin.noDescriptionAvailable")}
                  </Typography>

                  {/* Product Details */}
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      <strong>{translate("admin.age")}:</strong> {robot.minAge}-
                      {robot.maxAge} tuổi
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      <strong>{translate("admin.status")}:</strong>
                      <Chip
                        label={translate("admin.active")}
                        color="success"
                        size="small"
                        sx={{ ml: 0.5, height: 16, fontSize: "0.7rem" }}
                      />
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      <strong>{translate("admin.createdAt")}:</strong>{" "}
                      {new Date(robot.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {robots.data?.totalPages ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 4,
            p: 2,
          }}
        >
          <FormControl size="small">
            <InputLabel>{translate("admin.pageSize")}</InputLabel>
            <Select
              label={translate("admin.pageSize")}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageNumber(1);
              }}
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
            count={robots.data.totalPages}
            page={pageNumber}
            onChange={(_, v) => setPageNumber(v)}
            shape="rounded"
            color="primary"
          />
        </Box>
      ) : null}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title={translate("admin.deleteRobotProduct")}
        message={translate("admin.confirmDeleteRobotProduct", {
          name: deleteDialog.robotName || "",
        })}
        confirmText={translate("admin.delete")}
        cancelText={translate("admin.cancel")}
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialog({ open: false })}
        isLoading={operations.isDeleting}
      />
    </Box>
  );
}
