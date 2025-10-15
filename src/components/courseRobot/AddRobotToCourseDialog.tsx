import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Typography,
  Autocomplete,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "store/config";
import { getRobotsThunk } from "store/robot/robotThunks";
import { createCourseRobotThunk } from "store/courseRobot/courseRobotThunks";
import { clearSuccessFlags } from "store/courseRobot/courseRobotSlice";

interface AddRobotToCourseDialogProps {
  open: boolean;
  onClose: () => void;
  courseId: string;
  courseName?: string;
  onSuccess?: () => void;
}

export default function AddRobotToCourseDialog({
  open,
  onClose,
  courseId,
  courseName,
  onSuccess,
}: AddRobotToCourseDialogProps) {
  const dispatch = useAppDispatch();

  const { robots } = useAppSelector((state) => state.robot);
  const { operations } = useAppSelector((state) => state.courseRobot);

  const [selectedRobot, setSelectedRobot] = useState<any>(null);
  const [isRequired, setIsRequired] = useState(true);

  useEffect(() => {
    if (open) {
      // Fetch available robots
      dispatch(getRobotsThunk({ pageSize: 10 }));
    }
  }, [open, dispatch]);

  const handleSuccess = () => {
    console.log("✅ AddRobotToCourseDialog: handleSuccess called");
    dispatch(clearSuccessFlags());
    setSelectedRobot(null);
    setIsRequired(true);
    if (onSuccess) {
      console.log("✅ AddRobotToCourseDialog: calling parent onSuccess");
      onSuccess();
    }
    onClose();
  };

  useEffect(() => {
    if (operations.createSuccess) {
      console.log("✅ AddRobotToCourseDialog: createSuccess detected!");
      handleSuccess();
    }
  }, [operations.createSuccess, handleSuccess]);

  const handleSubmit = () => {
    if (!selectedRobot) return;

    console.log("📤 AddRobotToCourseDialog: Submitting...", {
      courseId,
      robotId: selectedRobot.id,
      robotName: selectedRobot.name,
      isRequired,
    });

    dispatch(
      createCourseRobotThunk({
        courseId,
        robotId: selectedRobot.id,
        isRequired,
      })
    );
  };

  const handleCancel = () => {
    setSelectedRobot(null);
    setIsRequired(true);
    onClose();
  };

  const robotsList = robots.data?.items || [];
  const isLoading = robots.isLoading || operations.isCreating;

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        Thêm Robot vào Khóa học
        {courseName && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {courseName}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          {operations.createError && (
            <Alert severity="error">{operations.createError}</Alert>
          )}

          {robots.isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Autocomplete
                options={robotsList}
                getOptionLabel={(option) =>
                  `${option.name} - ${option.model} (${option.brand})`
                }
                value={selectedRobot}
                onChange={(_, newValue) => setSelectedRobot(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Chọn Robot *"
                    placeholder="Tìm kiếm robot..."
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props as any;
                  return (
                    <Box component="li" key={option.id} {...otherProps}>
                      <Box>
                        <Typography variant="body1">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.model} - {option.brand}
                        </Typography>
                      </Box>
                    </Box>
                  );
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={isRequired}
                    onChange={(e) => setIsRequired(e.target.checked)}
                  />
                }
                label="Bắt buộc phải có robot này để hoàn thành khóa học"
              />
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCancel} disabled={isLoading}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!selectedRobot || isLoading}
          startIcon={operations.isCreating && <CircularProgress size={16} />}
        >
          Thêm Robot
        </Button>
      </DialogActions>
    </Dialog>
  );
}
