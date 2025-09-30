import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  InputAdornment,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  SmartToy as RobotIcon,
  AttachMoney as PriceIcon,
  Inventory as StockIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { createRobotThunk, updateRobotThunk } from "../../../redux/robot/robotThunks";
import { clearSuccessFlags } from "../../../redux/robot/robotSlice";
import { SimpleImageUploader } from "../../../components/common/SimpleImageUploader";
import { 
  RobotResult, 
  CreateRobotRequest, 
  UpdateRobotRequest
} from "../../../common/@types/robot";
import { formatVND } from "../../../utils/utils";

interface RobotFormSectionProps {
  mode: "create" | "edit";
  robot?: RobotResult | null;
  onBack: () => void;
  onSuccess: () => void;
}

export default function RobotFormSection({ mode, robot, onBack, onSuccess }: RobotFormSectionProps) {
  const dispatch = useAppDispatch();
  const { operations } = useAppSelector((state) => state.robot);

  const [formData, setFormData] = useState({
    name: robot?.name || "",
    model: robot?.model || "",
    brand: robot?.brand || "",
    description: robot?.description || "",
    imageUrl: robot?.imageUrl || "",
    price: robot?.price || 0,
    stockQuantity: robot?.stockQuantity || 0,
    technicalSpecs: robot?.technicalSpecs || "",
    requirements: robot?.requirements || "",
    minAge: robot?.minAge || 8,
    maxAge: robot?.maxAge || 99,
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Handle success
  useEffect(() => {
    if (operations.createSuccess || operations.updateSuccess) {
      dispatch(clearSuccessFlags());
      onSuccess();
    }
  }, [operations.createSuccess, operations.updateSuccess, dispatch, onSuccess]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Robot name is required";
    }

    if (!formData.model.trim()) {
      newErrors.model = "Model is required";
    }

    if (!formData.brand.trim()) {
      newErrors.brand = "Brand is required";
    }

    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (formData.stockQuantity < 0) {
      newErrors.stockQuantity = "Stock quantity cannot be negative";
    }

    if (formData.minAge < 0 || formData.minAge > 18) {
      newErrors.minAge = "Minimum age must be between 0 and 18";
    }

    if (formData.maxAge < formData.minAge || formData.maxAge > 99) {
      newErrors.maxAge = "Maximum age must be greater than minimum age and less than 100";
    }

    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = "Please enter a valid image URL";
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
      name: formData.name.trim(),
      model: formData.model.trim(),
      brand: formData.brand.trim(),
      description: formData.description.trim() || undefined,
      imageUrl: formData.imageUrl.trim() || undefined,
      price: formData.price,
      stockQuantity: formData.stockQuantity,
      technicalSpecs: formData.technicalSpecs.trim() || undefined,
      requirements: formData.requirements.trim() || undefined,
      minAge: formData.minAge,
      maxAge: formData.maxAge,
    };

    if (mode === "create") {
      await dispatch(createRobotThunk(baseData as CreateRobotRequest));
    } else if (robot) {
      await dispatch(updateRobotThunk({ 
        id: robot.id, 
        data: baseData as UpdateRobotRequest 
      }));
    }
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

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          {/* Main Form */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Product Information
                </Typography>

                {/* Error Alert */}
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {/* Product Name */}
                  <TextField
                    label="Product Name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    error={!!errors.name}
                    helperText={errors.name}
                    fullWidth
                    required
                    placeholder="e.g., LEGO Mindstorms EV3"
                  />

                  <Grid container spacing={2}>
                    {/* Model */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Model"
                        value={formData.model}
                        onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                        error={!!errors.model}
                        helperText={errors.model}
                        fullWidth
                        required
                        placeholder="e.g., EV3-31313"
                      />
                    </Grid>

                    {/* Brand */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Brand"
                        value={formData.brand}
                        onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                        error={!!errors.brand}
                        helperText={errors.brand}
                        fullWidth
                        required
                        placeholder="e.g., LEGO"
                      />
                    </Grid>
                  </Grid>

                  {/* Description */}
                  <TextField
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Describe the robot's features and educational value..."
                  />

                  <Grid container spacing={2}>
                    {/* Price */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Price"
                        type="number"
                        value={formData.price || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) || 0 }))}
                        error={!!errors.price}
                        helperText={errors.price}
                        fullWidth
                        required
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><PriceIcon /></InputAdornment>,
                          inputProps: { min: 0, step: 0.01 }
                        }}
                        placeholder="0.00"
                      />
                    </Grid>

                    {/* Stock Quantity */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Stock Quantity"
                        type="number"
                        value={formData.stockQuantity || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: Number(e.target.value) || 0 }))}
                        error={!!errors.stockQuantity}
                        helperText={errors.stockQuantity}
                        fullWidth
                        required
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><StockIcon /></InputAdornment>,
                          inputProps: { min: 0 }
                        }}
                        placeholder="0"
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    {/* Age Range */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Minimum Age"
                        type="number"
                        value={formData.minAge || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, minAge: Number(e.target.value) || 8 }))}
                        error={!!errors.minAge}
                        helperText={errors.minAge}
                        fullWidth
                        required
                        InputProps={{
                          inputProps: { min: 0, max: 18 }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Maximum Age"
                        type="number"
                        value={formData.maxAge || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxAge: Number(e.target.value) || 99 }))}
                        error={!!errors.maxAge}
                        helperText={errors.maxAge}
                        fullWidth
                        required
                        InputProps={{
                          inputProps: { min: formData.minAge, max: 99 }
                        }}
                      />
                    </Grid>
                  </Grid>

                  {/* Technical Specifications */}
                  <TextField
                    label="Technical Specifications"
                    value={formData.technicalSpecs}
                    onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecs: e.target.value }))}
                    multiline
                    rows={4}
                    fullWidth
                    placeholder="List technical specifications, dimensions, connectivity options..."
                  />

                  {/* Requirements */}
                  <TextField
                    label="Requirements"
                    value={formData.requirements}
                    onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="System requirements, prerequisites, software needed..."
                  />

                  {/* Image URL */}
                  <TextField
                    label="Image URL (Optional)"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    error={!!errors.imageUrl}
                    helperText={errors.imageUrl || "URL to robot's product image"}
                    fullWidth
                    placeholder="https://example.com/robot-product.jpg"
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={isLoading}
                size="large"
              >
                {mode === "create" ? "Create Product" : "Update Product"}
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
            {/* Robot Image Upload */}
            <SimpleImageUploader
              entityId={robot?.id}
              entityType="robot"
              currentImageUrl={formData.imageUrl}
              onImageChange={(url: string | null) => setFormData(prev => ({ ...prev, imageUrl: url || "" }))}
              title="Product Image"
              description="Upload product image for the robot"
              height={280}
              disabled={isLoading}
            />

            {/* Product Preview */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Product Preview
                </Typography>
                
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <RobotIcon sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="body1" fontWeight="medium">
                    {formData.name || "Unnamed Product"}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {formData.description || "No description provided"}
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="body2">
                    <strong>Brand:</strong> {formData.brand || "N/A"}
                  </Typography>
                  
                  <Typography variant="body2">
                    <strong>Model:</strong> {formData.model || "N/A"}
                  </Typography>

                  <Typography variant="body2">
                    <strong>Price:</strong> {formatVND(formData.price)}
                  </Typography>

                  <Typography variant="body2">
                    <strong>Stock:</strong> {formData.stockQuantity} units
                  </Typography>

                  <Typography variant="body2">
                    <strong>Age Range:</strong> {formData.minAge} - {formData.maxAge} tuổi
                  </Typography>

                  {/* Inventory Status */}
                  <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: "divider" }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Status:</strong> {formData.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Category:</strong> Educational Robot
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
