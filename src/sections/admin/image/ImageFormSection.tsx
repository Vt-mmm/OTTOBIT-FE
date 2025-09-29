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
import { createImageThunk, updateImageThunk } from "../../../redux/image/imageThunks";
import { getRobotsThunk } from "../../../redux/robot/robotThunks";
import { getComponentsThunk } from "../../../redux/component/componentThunks";
import { clearSuccessFlags } from "../../../redux/image/imageSlice";
import { ImageResult, CreateImageRequest, UpdateImageRequest } from "../../../common/@types/image";

interface ImageFormSectionProps {
  mode: "create" | "edit";
  image?: ImageResult | null;
  onBack: () => void;
  onSuccess: () => void;
}

export default function ImageFormSection({ mode, image, onBack, onSuccess }: ImageFormSectionProps) {
  const dispatch = useAppDispatch();
  const { operations } = useAppSelector((state) => state.image);
  const { robots } = useAppSelector((state) => state.robot);
  const { components } = useAppSelector((state) => state.component);

  const [formData, setFormData] = useState({
    url: image?.url || "",
    assignmentType: image?.robotId ? "robot" : image?.componentId ? "component" : "general",
    robotId: image?.robotId || "",
    componentId: image?.componentId || "",
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load robots and components for assignment
  useEffect(() => {
    dispatch(getRobotsThunk({ pageNumber: 1, pageSize: 100 }));
    dispatch(getComponentsThunk({ pageNumber: 1, pageSize: 100 }));
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
      newErrors.url = "Image URL is required";
    } else if (!isValidUrl(formData.url)) {
      newErrors.url = "Please enter a valid URL";
    }

    if (formData.assignmentType === "robot" && !formData.robotId) {
      newErrors.robotId = "Please select a robot";
    }

    if (formData.assignmentType === "component" && !formData.componentId) {
      newErrors.componentId = "Please select a component";
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
      robotId: formData.assignmentType === "robot" ? formData.robotId || undefined : undefined,
      componentId: formData.assignmentType === "component" ? formData.componentId || undefined : undefined,
    };

    if (mode === "create") {
      await dispatch(createImageThunk(baseData as CreateImageRequest));
    } else if (image) {
      await dispatch(updateImageThunk({ 
        id: image.id, 
        data: baseData as UpdateImageRequest 
      }));
    }
  };

  const handleAssignmentTypeChange = (type: string) => {
    setFormData(prev => ({
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
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{ mr: 2 }}
        >
          Back to List
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
                  {error && (
                    <Alert severity="error">
                      {error}
                    </Alert>
                  )}

                  {/* Image Upload */}
                  <SimpleImageUploader
                    entityId={formData.assignmentType === "robot" ? formData.robotId : 
                             formData.assignmentType === "component" ? formData.componentId : 
                             undefined}
                    entityType={formData.assignmentType as "robot" | "component" | "general"}
                    currentImageUrl={formData.url}
                    onImageChange={(url) => setFormData(prev => ({ ...prev, url: url || "" }))}
                    title="Upload Image"
                    description="Upload an image file or enter a URL below"
                    height={200}
                    disabled={isLoading}
                  />

                  {/* Alternative: Manual URL Input */}
                  <TextField
                    label="Or enter Image URL directly"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    error={!!errors.url}
                    helperText={errors.url || "Alternative: Enter the direct URL to an existing image"}
                    fullWidth
                    placeholder="https://example.com/robot-image.jpg"
                  />

                  {/* Assignment Type */}
                  <FormControl fullWidth>
                    <InputLabel>Assignment</InputLabel>
                    <Select
                      value={formData.assignmentType}
                      label="Assignment"
                      onChange={(e) => handleAssignmentTypeChange(e.target.value)}
                    >
                      <MenuItem value="general">General Use (No Assignment)</MenuItem>
                      <MenuItem value="robot">Assign to Robot</MenuItem>
                      <MenuItem value="component">Assign to Component</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Robot Selection */}
                  {formData.assignmentType === "robot" && (
                    <FormControl fullWidth error={!!errors.robotId}>
                      <InputLabel>Select Robot</InputLabel>
                      <Select
                        value={formData.robotId}
                        label="Select Robot"
                        onChange={(e) => setFormData(prev => ({ ...prev, robotId: e.target.value }))}
                        disabled={robots.isLoading}
                      >
                        {robots.data?.items.map((robot) => (
                          <MenuItem key={robot.id} value={robot.id}>
                            {robot.name} ({robot.brand})
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.robotId && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                          {errors.robotId}
                        </Typography>
                      )}
                    </FormControl>
                  )}

                  {/* Component Selection */}
                  {formData.assignmentType === "component" && (
                    <FormControl fullWidth error={!!errors.componentId}>
                      <InputLabel>Select Component</InputLabel>
                      <Select
                        value={formData.componentId}
                        label="Select Component"
                        onChange={(e) => setFormData(prev => ({ ...prev, componentId: e.target.value }))}
                        disabled={components.isLoading}
                      >
                        {components.data?.items.map((component) => (
                          <MenuItem key={component.id} value={component.id}>
                            {component.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.componentId && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
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
                      startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                      disabled={isLoading}
                      size="large"
                    >
                      {mode === "create" ? "Upload Image" : "Update Image"}
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
                Preview
              </Typography>
              
              {formData.url && isValidUrl(formData.url) ? (
                <Box
                  sx={{
                    width: "100%",
                    paddingTop: "75%", // 4:3 aspect ratio
                    position: "relative",
                    borderRadius: 1,
                    overflow: "hidden",
                    backgroundColor: "grey.100",
                    backgroundImage: `url(${formData.url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
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
                    <UploadIcon sx={{ fontSize: 48, color: "grey.400", mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Image preview will appear here
                    </Typography>
                  </Box>
                </Box>
              )}
              
              {/* Assignment Info */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Assignment:</strong> {formData.assignmentType}
                </Typography>
                {formData.assignmentType === "robot" && formData.robotId && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    <strong>Robot:</strong> {robots.data?.items.find(r => r.id === formData.robotId)?.name}
                  </Typography>
                )}
                {formData.assignmentType === "component" && formData.componentId && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    <strong>Component:</strong> {components.data?.items.find(c => c.id === formData.componentId)?.name}
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
