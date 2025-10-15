import { useState } from "react";
import { Box, Typography } from "@mui/material";
import ImageListSection from "../../sections/admin/image/ImageListSection";
import ImageFormSection from "../../sections/admin/image/ImageFormSection";
import ImageDetailsSection from "../../sections/admin/image/ImageDetailsSection";
import { ImageResult } from "../../common/@types/image";
import useLocales from "../../hooks/useLocales";

type ViewMode = "list" | "create" | "edit" | "details";

export interface ImageManagementProps {
  /** Robot ID to filter images (optional) */
  robotId?: string;
  /** Component ID to filter images (optional) - Removed */
  // componentId?: string;
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
  // componentId,
  title,
  description,
  showHeader = true,
  allowCreate = true,
  allowEdit = true,
  allowDelete = true,
  onImageChange,
  height,
}: ImageManagementProps) {
  const { translate } = useLocales();
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
          ? translate("image.image_management_upload_robot_images")
          : translate("image.image_management_upload_new_image");
      case "edit":
        return translate("image.image_management_edit_image");
      case "details":
        return translate("image.image_management_image_details");
      default:
        return title || translate("image.image_management_title");
    }
  };

  const getPageDescription = () => {
    if (description) return description;

    switch (viewMode) {
      case "create":
        return robotId
          ? translate("image.image_management_description_upload_robot")
          : translate("image.image_management_description_upload_new");
      case "edit":
        return translate("image.image_management_description_edit");
      case "details":
        return translate("image.image_management_description_details");
      default:
        return robotId
          ? translate("image.image_management_description_manage_robot")
          : translate("image.image_management_description_manage_all");
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
