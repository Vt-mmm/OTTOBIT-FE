import { useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import AdminLayout from "../../layout/admin/AdminLayout";
import ImageListSection from "../../sections/admin/image/ImageListSection";
import ImageFormSection from "../../sections/admin/image/ImageFormSection";
import ImageDetailsSection from "../../sections/admin/image/ImageDetailsSection";
import { ImageResult } from "../../common/@types/image";

type ViewMode = "list" | "create" | "edit" | "details";

export default function ImageManagementPage() {
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

  const renderContent = () => {
    switch (viewMode) {
      case "create":
        return (
          <ImageFormSection
            mode="create"
            onBack={handleBackToList}
            onSuccess={handleBackToList}
          />
        );
      case "edit":
        return (
          <ImageFormSection
            mode="edit"
            image={selectedImage}
            onBack={handleBackToList}
            onSuccess={handleBackToList}
          />
        );
      case "details":
        return (
          <ImageDetailsSection
            image={selectedImage}
            onBack={handleBackToList}
            onEdit={(image) => handleViewModeChange("edit", image)}
            onDelete={handleBackToList}
          />
        );
      default:
        return (
          <ImageListSection
            onViewModeChange={handleViewModeChange}
          />
        );
    }
  };

  const getPageTitle = () => {
    switch (viewMode) {
      case "create":
        return "Upload New Image";
      case "edit":
        return "Edit Image";
      case "details":
        return "Image Details";
      default:
        return "Image Management";
    }
  };

  return (
    <AdminLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              mb: 1,
            }}
          >
            {getPageTitle()}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {viewMode === "list" && "Manage images for robots, components, and general use"}
            {viewMode === "create" && "Upload a new image to the system"}
            {viewMode === "edit" && "Update image information and assignments"}
            {viewMode === "details" && "View detailed image information"}
          </Typography>
        </Box>
        
        {renderContent()}
      </Container>
    </AdminLayout>
  );
}
