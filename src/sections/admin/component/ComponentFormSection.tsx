import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Memory as ComponentIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import {
  createComponentThunk,
  updateComponentThunk,
} from "../../../redux/component/componentThunks";
import {
  clearSuccessFlags,
  clearErrors,
} from "../../../redux/component/componentSlice";
import {
  ComponentResult,
  ComponentType,
  CreateComponentRequest,
  UpdateComponentRequest,
} from "../../../common/@types/component";
import { SimpleImageUploader } from "../../../components/common/SimpleImageUploader";

interface ComponentFormSectionProps {
  mode: "create" | "edit";
  component?: ComponentResult;
  onBack: () => void;
  onSuccess: () => void;
}

interface ComponentFormData {
  name: string;
  description: string;
  type: ComponentType;
  imageUrl: string;
  specifications: string;
}

export default function ComponentFormSection({
  mode,
  component,
  onBack,
  onSuccess,
}: ComponentFormSectionProps) {
  const dispatch = useAppDispatch();
  const { operations } = useAppSelector((state) => state.component);

  const [formData, setFormData] = useState<ComponentFormData>({
    name: component?.name || "",
    description: component?.description || "",
    type: component?.type || ComponentType.OTHER,
    imageUrl: component?.imageUrl || "",
    specifications: component?.specifications || "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Clear errors and success flags when component mounts
  useEffect(() => {
    dispatch(clearErrors());
    dispatch(clearSuccessFlags());
  }, [dispatch]);

  // Handle success
  useEffect(() => {
    if (operations.createSuccess || operations.updateSuccess) {
      onSuccess();
    }
  }, [operations.createSuccess, operations.updateSuccess, onSuccess]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = "Please enter a valid image URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (mode === "create") {
        const createData: CreateComponentRequest = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          type: formData.type,
          imageUrl: formData.imageUrl.trim() || undefined,
          specifications: formData.specifications.trim() || undefined,
        };
        await dispatch(createComponentThunk(createData));
      } else if (component) {
        const updateData: UpdateComponentRequest = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          type: formData.type,
          imageUrl: formData.imageUrl.trim() || undefined,
          specifications: formData.specifications.trim() || undefined,
        };
        await dispatch(
          updateComponentThunk({ id: component.id, data: updateData })
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleInputChange = (field: keyof ComponentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getComponentTypeLabel = (type: ComponentType) => {
    const typeLabels = {
      [ComponentType.SENSOR]: "Sensor",
      [ComponentType.ACTUATOR]: "Actuator",
      [ComponentType.CONTROLLER]: "Controller",
      [ComponentType.POWER_SUPPLY]: "Power Supply",
      [ComponentType.CONNECTIVITY]: "Connectivity",
      [ComponentType.MECHANICAL]: "Mechanical",
      [ComponentType.DISPLAY]: "Display",
      [ComponentType.AUDIO]: "Audio",
      [ComponentType.OTHER]: "Other",
    };
    return typeLabels[type] || "Unknown";
  };

  const isLoading = operations.isCreating || operations.isUpdating;
  const error = operations.createError || operations.updateError;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mr: 2 }}>
          Back to List
        </Button>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          {/* Main Form */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Component Information
                </Typography>

                {/* Error Alert */}
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {/* Component Name */}
                  <TextField
                    label="Component Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name}
                    fullWidth
                    required
                    placeholder="e.g., Arduino Uno R3"
                  />

                  <Grid container spacing={2}>
                    {/* Component Type */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth error={!!errors.type}>
                        <InputLabel>Component Type</InputLabel>
                        <Select
                          value={formData.type}
                          label="Component Type"
                          onChange={(e) =>
                            handleInputChange("type", e.target.value)
                          }
                          disabled={isLoading}
                        >
                          {Object.values(ComponentType)
                            .filter((v) => typeof v === "number")
                            .map((type) => (
                              <MenuItem key={type} value={type}>
                                {getComponentTypeLabel(type as ComponentType)}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  {/* Description */}
                  <TextField
                    label="Description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    error={!!errors.description}
                    helperText={errors.description}
                    multiline
                    rows={3}
                    fullWidth
                    required
                    placeholder="Describe the component's features and applications..."
                  />

                  {/* Technical Specifications */}
                  <TextField
                    label="Technical Specifications"
                    value={formData.specifications}
                    onChange={(e) =>
                      handleInputChange("specifications", e.target.value)
                    }
                    multiline
                    rows={4}
                    fullWidth
                    placeholder="List technical specifications, dimensions, voltage requirements, etc..."
                  />

                  {/* Image URL */}
                  <TextField
                    label="Image URL (Optional)"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      handleInputChange("imageUrl", e.target.value)
                    }
                    error={!!errors.imageUrl}
                    helperText={
                      errors.imageUrl || "URL to component's product image"
                    }
                    fullWidth
                    placeholder="https://example.com/component-image.jpg"
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={
                  isLoading ? <CircularProgress size={20} /> : <SaveIcon />
                }
                disabled={isLoading}
                size="large"
              >
                {mode === "create" ? "Create Component" : "Update Component"}
              </Button>
              <Button
                variant="outlined"
                onClick={onBack}
                disabled={isLoading}
                size="large"
              >
                Cancel
              </Button>
            </Box>
          </Grid>

          {/* Preview/Upload Panel */}
          <Grid item xs={12} md={4}>
            {/* Component Image Upload */}
            <SimpleImageUploader
              entityId={component?.id}
              entityType="component"
              currentImageUrl={formData.imageUrl}
              onImageChange={(url: string | null) =>
                handleInputChange("imageUrl", url || "")
              }
              title="Component Image"
              description="Upload component image"
              height={280}
              disabled={isLoading}
            />

            {/* Component Preview */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Component Preview
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <ComponentIcon sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="body1" fontWeight="medium">
                    {formData.name || "Unnamed Component"}
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {formData.description || "No description provided"}
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="body2">
                    <strong>Type:</strong>{" "}
                    {getComponentTypeLabel(formData.type)}
                  </Typography>

                  {formData.specifications && (
                    <Typography variant="body2">
                      <strong>Specifications:</strong> Available
                    </Typography>
                  )}

                  {/* Status */}
                  <Box
                    sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: "divider" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      <strong>Category:</strong> Electronic Component
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
