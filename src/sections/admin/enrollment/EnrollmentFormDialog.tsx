import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  Autocomplete,
  TextField,
  CircularProgress,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { CreateEnrollmentRequest } from "common/@types/enrollment";

// Import course and student types if needed for autocomplete
interface Course {
  id: string;
  title: string;
  description?: string;
}

interface Student {
  id: string;
  fullname: string;
}

interface EnrollmentFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEnrollmentRequest) => void;
  isLoading?: boolean;
  error?: string | null;

  // For admin to select student and course
  students?: Student[];
  courses?: Course[];
  isLoadingStudents?: boolean;
  isLoadingCourses?: boolean;

  // Pre-selected values
  preSelectedStudentId?: string;
  preSelectedCourseId?: string;
}

interface EnrollmentFormData {
  courseId: string;
}

export default function EnrollmentFormDialog({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  error = null,
  courses = [],
  isLoadingCourses = false,
  preSelectedCourseId,
}: EnrollmentFormDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EnrollmentFormData>({
    defaultValues: {
      courseId: preSelectedCourseId || "",
    },
  });

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (preSelectedCourseId) {
        const course = courses.find((c) => c.id === preSelectedCourseId);
        setSelectedCourse(course || null);
        reset({ courseId: preSelectedCourseId });
      } else {
        setSelectedCourse(null);
        reset({ courseId: "" });
      }
    }
  }, [open, preSelectedCourseId, courses, reset]);

  const handleFormSubmit = (data: EnrollmentFormData) => {
    onSubmit({ courseId: data.courseId });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
        }}
      >
        <Typography variant="h6">Create New Enrollment</Typography>
        <IconButton onClick={onClose} disabled={isLoading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Alert severity="info">
              Create enrollment for a student to enroll them in a course.
            </Alert>

            {/* Course Selection */}
            <Controller
              name="courseId"
              control={control}
              rules={{
                required: "Please select a course",
              }}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  options={courses}
                  getOptionLabel={(option) =>
                    typeof option === "string"
                      ? courses.find((c) => c.id === option)?.title || ""
                      : option.title
                  }
                  value={selectedCourse}
                  onChange={(_, newValue) => {
                    setSelectedCourse(newValue);
                    field.onChange(newValue?.id || "");
                  }}
                  loading={isLoadingCourses}
                  disabled={isLoading || isLoadingCourses}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Course *"
                      error={!!errors.courseId}
                      helperText={errors.courseId?.message}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {isLoadingCourses ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body2">{option.title}</Typography>
                        {option.description && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {option.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                />
              )}
            />

            {selectedCourse && (
              <Alert severity="success">
                <Typography variant="body2">
                  <strong>{selectedCourse.title}</strong>
                </Typography>
                {selectedCourse.description && (
                  <Typography variant="caption" color="text.secondary">
                    {selectedCourse.description}
                  </Typography>
                )}
              </Alert>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={onClose} disabled={isLoading} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || isLoadingCourses}
            sx={{ minWidth: 120 }}
          >
            {isLoading ? "Creating..." : "Create Enrollment"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
