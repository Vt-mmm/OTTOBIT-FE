import { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Alert,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import useLocales from "hooks/useLocales";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import {
  CreateStudentRequest,
  UpdateStudentRequest,
  StudentResult,
} from "common/@types/student";

interface StudentFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStudentRequest | UpdateStudentRequest) => void;
  isLoading?: boolean;
  error?: string | null;
  mode: "create" | "edit";
  initialData?: StudentResult;
}

interface StudentFormData {
  fullname: string;
  phoneNumber: string;
  address: string;
  state: string;
  city: string;
  dateOfBirth: Dayjs | null;
}

export default function StudentFormDialog({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  error = null,
  mode,
  initialData,
}: StudentFormDialogProps) {
  const { translate } = useLocales();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentFormData>({
    defaultValues: {
      fullname: "",
      phoneNumber: "",
      address: "",
      state: "",
      city: "",
      dateOfBirth: null,
    },
  });

  // Reset form when dialog opens with initial data
  useEffect(() => {
    if (open && initialData && mode === "edit") {
      reset({
        fullname: initialData.fullname || "",
        phoneNumber: initialData.phoneNumber || "",
        address: initialData.address || "",
        state: initialData.state || "",
        city: initialData.city || "",
        dateOfBirth: initialData.dateOfBirth
          ? dayjs(initialData.dateOfBirth)
          : null,
      });
    } else if (open && mode === "create") {
      reset({
        fullname: "",
        phoneNumber: "",
        address: "",
        state: "",
        city: "",
        dateOfBirth: null,
      });
    }
  }, [open, initialData, mode, reset]);

  const handleFormSubmit = (data: StudentFormData) => {
    const formattedData = {
      fullname: data.fullname,
      phoneNumber: data.phoneNumber || undefined,
      address: data.address || undefined,
      state: data.state || undefined,
      city: data.city || undefined,
      dateOfBirth: data.dateOfBirth
        ? data.dateOfBirth.toISOString()
        : undefined,
    };

    onSubmit(formattedData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
        <Typography variant="h6">
          {mode === "create" ? translate("admin.createNewStudent") : translate("admin.editStudent")}
        </Typography>
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

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Full Name */}
            <Controller
              name="fullname"
              control={control}
              rules={{
                required: translate("admin.fullNameRequired"),
                minLength: {
                  value: 2,
                  message: translate("admin.fullNameMin2Chars"),
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={translate("admin.fullNameRequired")}
                  fullWidth
                  error={!!errors.fullname}
                  helperText={errors.fullname?.message}
                  disabled={isLoading}
                />
              )}
            />

            {/* Phone Number */}
            <Controller
              name="phoneNumber"
              control={control}
              rules={{
                pattern: {
                  value: /^[0-9+\s()-]+$/,
                  message: translate("admin.invalidPhoneFormat"),
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={translate("admin.phoneNumber")}
                  fullWidth
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber?.message}
                  disabled={isLoading}
                />
              )}
            />

            {/* Date of Birth */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name="dateOfBirth"
                control={control}
                rules={{
                  required: translate("admin.dateOfBirthRequired"),
                }}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label={translate("admin.dateOfBirthRequired")}
                    maxDate={dayjs()}
                    disabled={isLoading}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.dateOfBirth,
                        helperText: errors.dateOfBirth?.message,
                      },
                    }}
                  />
                )}
              />
            </LocalizationProvider>

            {/* Address */}
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={translate("admin.address")}
                  fullWidth
                  multiline
                  rows={2}
                  disabled={isLoading}
                />
              )}
            />

            {/* City and State */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={translate("admin.city")}
                    fullWidth
                    disabled={isLoading}
                  />
                )}
              />

              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={translate("admin.stateProvince")}
                    fullWidth
                    disabled={isLoading}
                  />
                )}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={onClose} disabled={isLoading} color="inherit">
            {translate("admin.cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{ minWidth: 120 }}
          >
            {isLoading
              ? translate("admin.saving")
              : mode === "create"
              ? translate("admin.createStudent")
              : translate("admin.updateStudent")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
