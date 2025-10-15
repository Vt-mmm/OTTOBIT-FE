import { useState } from "react";
import AdminLayout from "layout/admin/AdminLayout";
import { Box, Container, Typography } from "@mui/material";
import BlogListSection from "sections/admin/blog/BlogListSection";
import BlogFormSection from "sections/admin/blog/BlogFormSection";
import { BlogItem, BlogUpdateRequest } from "types/blog";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_BLOG } from "constants/routesApiKeys";
import { useNotification } from "hooks/useNotification";

type ViewMode = "list" | "create" | "edit" | "details";

export default function BlogManagementPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);
  const { showNotification } = useNotification();

  const handleBackToList = () => {
    setViewMode("list");
    setEditingBlog(null);
  };

  const handleEditBlog = (blog: BlogItem) => {
    setEditingBlog(blog);
    setViewMode("edit");
  };

  const handleUpdateBlog = async (updateData: BlogUpdateRequest) => {
    if (!editingBlog) return;

    try {
      await axiosClient.put(ROUTES_API_BLOG.UPDATE(editingBlog.id), updateData);
      showNotification("Cập nhật blog thành công", "success");
      handleBackToList();
    } catch (error) {
      showNotification("Không thể cập nhật blog", "error");
      throw error; // Re-throw để BlogFormSection có thể handle
    }
  };

  const renderContent = () => {
    switch (viewMode) {
      case "create":
        return (
          <BlogFormSection
            mode="create"
            onBack={handleBackToList}
            onSuccess={handleBackToList}
          />
        );
      case "edit":
        return (
          <BlogFormSection
            mode="edit"
            onBack={handleBackToList}
            onSuccess={handleBackToList}
            initialData={editingBlog || undefined}
            onUpdate={handleUpdateBlog}
          />
        );
      default:
        return (
          <BlogListSection
            onCreateNew={() => setViewMode("create")}
            onEditBlog={handleEditBlog}
          />
        );
    }
  };

  const title = "Quản lý Blog";
  const subtitle =
    viewMode === "create"
      ? "Nhập nội dung cho bài blog mới"
      : viewMode === "edit"
      ? "Chỉnh sửa bài blog"
      : "Danh sách bài viết blog";

  return (
    <AdminLayout>
      <Container
        maxWidth="xl"
        sx={{ py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 3 } }}
      >
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: "#1a1a1a",
              mb: 1,
              fontSize: { xs: "1.5rem", sm: "2.125rem" },
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "#666", fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            {subtitle}
          </Typography>
        </Box>
        {renderContent()}
      </Container>
    </AdminLayout>
  );
}
