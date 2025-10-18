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
import useLocales from "hooks/useLocales";

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
  const { translate } = useLocales();
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
      newErrors.name = translate("admin.component.nameRequired");
    }

    if (!formData.description.trim()) {
      newErrors.description = translate("admin.component.descriptionRequired");
    }

    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = "Component image is required. Please upload an image.";
    } else if (!isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = translate("admin.component.invalidImageUrl");
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
      [ComponentType.SENSOR]: translate("admin.component.typeSensor"),
      [ComponentType.ACTUATOR]: translate("admin.component.typeActuator"),
      [ComponentType.CONTROLLER]: translate("admin.component.typeController"),
      [ComponentType.POWER_SUPPLY]: translate("admin.component.typePowerSupply"),
      [ComponentType.CONNECTIVITY]: translate("admin.component.typeConnectivity"),
      [ComponentType.MECHANICAL]: translate("admin.component.typeMechanical"),
      [ComponentType.DISPLAY]: translate("admin.component.typeDisplay"),
      [ComponentType.AUDIO]: translate("admin.component.typeAudio"),
      [ComponentType.OTHER]: translate("admin.component.typeOther"),
    };
    return typeLabels[type] || translate("admin.component.typeUnknown");
  };

  const isLoading = operations.isCreating || operations.isUpdating;
  const error = operations.createError || operations.updateError;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mr: 2 }}>
          {translate("admin.component.backToList")}
        </Button>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          {/* Main Form */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {translate("admin.component.componentInformation")}
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
                    label={translate("admin.component.nameLabel")}
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name}
                    fullWidth
                    required
                  />

                  <Grid container spacing={2}>
                    {/* Component Type */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth error={!!errors.type}>
                        <InputLabel>{translate("admin.component.typeLabel")}</InputLabel>
                        <Select
                          value={formData.type}
                          label={translate("admin.component.typeLabel")}
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
                    label={translate("admin.component.descriptionLabel")}
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
                  />

                  {/* Technical Specifications */}
                  <TextField
                    label={translate("admin.component.specificationsLabel")}
                    value={formData.specifications}
                    onChange={(e) =>
                      handleInputChange("specifications", e.target.value)
                    }
                    multiline
                    rows={4}
                    fullWidth
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
                {isLoading 
                  ? (mode === "create" ? translate("admin.component.creating") : translate("admin.component.updating"))
                  : (mode === "create" ? translate("admin.createComponent") : translate("admin.editComponent"))
                }
              </Button>
              <Button
                variant="outlined"
                onClick={onBack}
                disabled={isLoading}
                size="large"
              >
                {translate("admin.cancel")}
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
              title={`${translate("admin.component.images")} *`}
              description="Upload component image (required)"
              height={280}
              disabled={isLoading}
            />
            {errors.imageUrl && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block', px: 2 }}>
                {errors.imageUrl}
              </Typography>
            )}

            {/* Component Preview */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {translate("admin.component.componentInformation")}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <ComponentIcon sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="body1" fontWeight="medium">
                    {formData.name || translate("admin.component.nameLabel")}
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {formData.description || translate("admin.component.noDescription")}
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="body2">
                    <strong>{translate("admin.component.type")}:</strong>{" "}
                    {getComponentTypeLabel(formData.type)}
                  </Typography>

                  {formData.specifications && (
                    <Typography variant="body2">
                      <strong>{translate("admin.component.specifications")}:</strong> {translate("admin.component.noDescription")}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
