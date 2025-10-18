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
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  CloudUpload as UploadIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { SimpleImageUploader } from "../../../components/common/SimpleImageUploader";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import {
  createImageThunk,
  updateImageThunk,
} from "../../../redux/image/imageThunks";
import { getRobotsThunk } from "../../../redux/robot/robotThunks";
import { getComponentsThunk } from "../../../redux/component/componentThunks";
import { clearSuccessFlags } from "../../../redux/image/imageSlice";
import {
  ImageResult,
  CreateImageRequest,
  UpdateImageRequest,
} from "../../../common/@types/image";
import useLocales from "../../../hooks/useLocales";

interface ImageFormSectionProps {
  mode: "create" | "edit";
  image?: ImageResult | null;
  /** Pre-selected robot ID */
  robotId?: string;
  /** Pre-selected component ID */
  componentId?: string;
  onBack: () => void;
  onSuccess: () => void;
}

export default function ImageFormSection({
  mode,
  image,
  robotId,
  componentId,
  onBack,
  onSuccess,
}: ImageFormSectionProps) {
  const { translate } = useLocales();
  const dispatch = useAppDispatch();
  const { operations } = useAppSelector((state) => state.image);
  const { robots } = useAppSelector((state) => state.robot);
  const { components } = useAppSelector((state) => state.component);

  const [formData, setFormData] = useState({
    url: image?.url || "",
    assignmentType: image?.robotId
      ? "robot"
      : robotId
      ? "robot"
      : componentId
      ? "component"
      : "general",
    robotId: image?.robotId || robotId || "",
    componentId: componentId || "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load robots and components for assignment
  useEffect(() => {
    dispatch(getRobotsThunk({ page: 1, size: 10 }));
    dispatch(getComponentsThunk({ page: 1, size: 100 }));
  }, [dispatch]);

  // Handle success
  useEffect(() => {
    if (operations.createSuccess || operations.updateSuccess) {
      dispatch(clearSuccessFlags());
      onSuccess();
    }
  }, [operations.createSuccess, operations.updateSuccess, dispatch, onSuccess]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.url.trim()) {
      newErrors.url = translate("image.image_form_url_required");
    } else if (!isValidUrl(formData.url)) {
      newErrors.url = translate("image.image_form_url_invalid");
    }

    if (formData.assignmentType === "robot" && !formData.robotId) {
      newErrors.robotId = translate("image.image_form_robot_required");
    }

    if (formData.assignmentType === "component" && !formData.componentId) {
      newErrors.componentId = translate("image.image_form_component_required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const baseData = {
      url: formData.url.trim(),
      robotId:
        formData.assignmentType === "robot"
          ? formData.robotId || undefined
          : undefined,
      componentId:
        formData.assignmentType === "component"
          ? formData.componentId || undefined
          : undefined,
    };

    if (mode === "create") {
      await dispatch(createImageThunk(baseData as CreateImageRequest));
    } else if (image) {
      await dispatch(
        updateImageThunk({
          id: image.id,
          data: baseData as UpdateImageRequest,
        })
      );
    }
  };

  const handleAssignmentTypeChange = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      assignmentType: type,
      robotId: type === "robot" ? prev.robotId : "",
      componentId: type === "component" ? prev.componentId : "",
    }));
  };

  const isLoading = operations.isCreating || operations.isUpdating;
  const error = operations.createError || operations.updateError;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mr: 2 }}>
          {translate("image.image_form_back_to_list")}
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {/* Error Alert */}
                  {error && <Alert severity="error">{error}</Alert>}

                  {/* Image Upload */}
                  <SimpleImageUploader
                    entityId={
                      formData.assignmentType === "robot"
                        ? formData.robotId
                        : formData.assignmentType === "component"
                        ? formData.componentId
                        : undefined
                    }
                    entityType={
                      formData.assignmentType as
                        | "robot"
                        | "component"
                        | "general"
                    }
                    currentImageUrl={formData.url}
                    onImageChange={(url) =>
                      setFormData((prev) => ({ ...prev, url: url || "" }))
                    }
                    title={translate("image.image_form_upload_title")}
                    description={translate("image.image_form_upload_description")}
                    height={250}
                    disabled={isLoading}
                  />

                  {/* Alternative: Manual URL Input */}
                  <TextField
                    label={translate("image.image_form_url_label")}
                    value={formData.url}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, url: e.target.value }))
                    }
                    error={!!errors.url}
                    helperText={
                      errors.url ||
                      translate("image.image_form_url_helper")
                    }
                    fullWidth
                    placeholder={translate("image.image_form_url_placeholder")}
                  />

                  {/* Assignment Type */}
                  <FormControl fullWidth>
                    <InputLabel>{translate("image.image_form_assignment_label")}</InputLabel>
                    <Select
                      value={formData.assignmentType}
                      label={translate("image.image_form_assignment_label")}
                      onChange={(e) =>
                        handleAssignmentTypeChange(e.target.value)
                      }
                    >
                      <MenuItem value="general">
                        {translate("image.image_form_assignment_general")}
                      </MenuItem>
                      <MenuItem value="robot">{translate("image.image_form_assignment_robot")}</MenuItem>
                      <MenuItem value="component">{translate("image.image_form_assignment_component")}</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Robot Selection */}
                  {formData.assignmentType === "robot" && (
                    <FormControl fullWidth error={!!errors.robotId}>
                      <InputLabel>{translate("image.image_form_select_robot")}</InputLabel>
                      <Select
                        value={formData.robotId}
                        label={translate("image.image_form_select_robot")}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            robotId: e.target.value,
                          }))
                        }
                        disabled={robots.isLoading}
                      >
                        {robots.data?.items.map((robot) => (
                          <MenuItem key={robot.id} value={robot.id}>
                            {robot.name} ({robot.brand})
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.robotId && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5, ml: 2 }}
                        >
                          {errors.robotId}
                        </Typography>
                      )}
                    </FormControl>
                  )}

                  {/* Component Selection */}
                  {formData.assignmentType === "component" && (
                    <FormControl fullWidth error={!!errors.componentId}>
                      <InputLabel>{translate("image.image_form_select_component")}</InputLabel>
                      <Select
                        value={formData.componentId}
                        label={translate("image.image_form_select_component")}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            componentId: e.target.value,
                          }))
                        }
                        disabled={components.isLoading}
                      >
                        {components.data?.items.map((component) => (
                          <MenuItem key={component.id} value={component.id}>
                            {component.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.componentId && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5, ml: 2 }}
                        >
                          {errors.componentId}
                        </Typography>
                      )}
                    </FormControl>
                  )}

                  {/* Submit Button */}
                  <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={
                        isLoading ? (
                          <CircularProgress size={20} />
                        ) : (
                          <SaveIcon />
                        )
                      }
                      disabled={isLoading}
                      size="large"
                    >
                      {mode === "create" ? translate("image.image_form_upload_btn") : translate("image.image_form_update_btn")}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={onBack}
                      disabled={isLoading}
                      size="large"
                    >
                      {translate("image.image_form_cancel")}
                    </Button>
                  </Box>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Preview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {translate("image.image_form_preview")}
              </Typography>

              {formData.url && isValidUrl(formData.url) ? (
                <Box
                  sx={{
                    width: "100%",
                    height: 250, // Fixed height instead of aspect ratio
                    borderRadius: 1,
                    overflow: "hidden",
                    backgroundColor: "grey.100",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    component="img"
                    src={formData.url}
                    alt="Preview"
                    sx={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                      borderRadius: 1,
                    }}
                    onError={(e) => {
                      // Hide broken image preview
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    paddingTop: "75%",
                    position: "relative",
                    borderRadius: 1,
                    backgroundColor: "grey.100",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px dashed",
                    borderColor: "grey.300",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      textAlign: "center",
                    }}
                  >
                    <UploadIcon
                      sx={{ fontSize: 48, color: "grey.400", mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {translate("image.image_form_preview_placeholder")}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Assignment Info */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>{translate("image.image_form_assignment_info")}:</strong> {formData.assignmentType}
                </Typography>
                {formData.assignmentType === "robot" && formData.robotId && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    <strong>{translate("image.image_form_robot_info")}:</strong>{" "}
                    {
                      robots.data?.items.find((r) => r.id === formData.robotId)
                        ?.name
                    }
                  </Typography>
                )}
                {formData.assignmentType === "component" &&
                  formData.componentId && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      <strong>{translate("image.image_form_component_info")}:</strong>{" "}
                      {
                        components.data?.items.find(
                          (c) => c.id === formData.componentId
                        )?.name
                      }
                    </Typography>
                  )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

