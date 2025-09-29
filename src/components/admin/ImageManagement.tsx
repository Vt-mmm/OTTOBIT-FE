import { useState } from "react";
import { Box, Typography } from "@mui/material";
import ImageListSection from "../../sections/admin/image/ImageListSection";
import ImageFormSection from "../../sections/admin/image/ImageFormSection";
import ImageDetailsSection from "../../sections/admin/image/ImageDetailsSection";
import { ImageResult } from "../../common/@types/image";

type ViewMode = "list" | "create" | "edit" | "details";

export interface ImageManagementProps {
  /** Robot ID to filter images (optional) */
  robotId?: string;
  /** Component ID to filter images (optional) */
  componentId?: string;
  /** Custom title for the image management section */
  title?: string;
  /** Custom description */
  description?: string;
  /** Show header with title and description */
  showHeader?: boolean;
  /** Allow creation of new images */
  allowCreate?: boolean;
  /** Allow editing of existing images */
  allowEdit?: boolean;
  /** Allow deletion of images */
  allowDelete?: boolean;
  /** Callback when an image is successfully created/updated/deleted */
  onImageChange?: (action: 'create' | 'update' | 'delete', image?: ImageResult) => void;
  /** Custom height for the component */
  height?: string | number;
}

export default function ImageManagement({
  robotId,
  componentId,
  title = "Image Management",
  description,
  showHeader = true,
  allowCreate = true,
  allowEdit = true,
  allowDelete = true,
  onImageChange,
  height,
}: ImageManagementProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedImage, setSelectedImage] = useState<ImageResult | null>(null);

  const handleViewModeChange = (mode: ViewMode, image?: ImageResult) => {
    setViewMode(mode);
    setSelectedImage(image || null);
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedImage(null);
  };

  const handleImageSuccess = (action: 'create' | 'update' | 'delete', image?: ImageResult) => {
    onImageChange?.(action, image);
    handleBackToList();
  };

  const renderContent = () => {
    switch (viewMode) {
      case "create":
        return allowCreate ? (
          <ImageFormSection
            mode="create"
            robotId={robotId}
            componentId={componentId}
            onBack={handleBackToList}
            onSuccess={() => handleImageSuccess('create')}
          />
        ) : null;
      case "edit":
        return allowEdit ? (
          <ImageFormSection
            mode="edit"
            image={selectedImage}
            robotId={robotId}
            componentId={componentId}
            onBack={handleBackToList}
            onSuccess={() => handleImageSuccess('update', selectedImage || undefined)}
          />
        ) : null;
      case "details":
        return (
          <ImageDetailsSection
            image={selectedImage}
            onBack={handleBackToList}
            onEdit={allowEdit ? (image) => handleViewModeChange("edit", image) : undefined}
            onDelete={() => handleImageSuccess('delete', selectedImage || undefined)}
            allowEdit={allowEdit}
            allowDelete={allowDelete}
          />
        );
      default:
        return (
          <ImageListSection
            robotId={robotId}
            componentId={componentId}
            onViewModeChange={handleViewModeChange}
            allowCreate={allowCreate}
            allowEdit={allowEdit}
            allowDelete={allowDelete}
          />
        );
    }
  };

  const getPageTitle = () => {
    switch (viewMode) {
      case "create":
        return robotId
          ? "Upload Robot Images"
          : componentId
          ? "Upload Component Images"
          : "Upload New Image";
      case "edit":
        return "Edit Image";
      case "details":
        return "Image Details";
      default:
        return title;
    }
  };

  const getPageDescription = () => {
    if (description) return description;

    switch (viewMode) {
      case "create":
        return robotId
          ? "Upload new images for this robot"
          : componentId
          ? "Upload new images for this component"
          : "Upload a new image to the system";
      case "edit":
        return "Update image information and assignments";
      case "details":
        return "View detailed image information";
      default:
        return robotId
          ? "Manage images for this robot"
          : componentId
          ? "Manage images for this component"
          : "Manage images for robots, components, and general use";
    }
  };

  return (
    <Box sx={{ height: height || 'auto', display: 'flex', flexDirection: 'column' }}>
      {showHeader && (
        <Box sx={{ mb: 4, flexShrink: 0 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              mb: 1,
            }}
          >
            {getPageTitle()}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {getPageDescription()}
          </Typography>
        </Box>
      )}

      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        {renderContent()}
      </Box>
    </Box>
  );
}
