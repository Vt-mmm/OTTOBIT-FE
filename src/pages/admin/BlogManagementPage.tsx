import { useState } from "react";
import AdminLayout from "layout/admin/AdminLayout";
import { Box, Container, Typography } from "@mui/material";
import BlogListSection from "sections/admin/blog/BlogListSection";
import BlogFormSection from "sections/admin/blog/BlogFormSection";
import { BlogItem, BlogUpdateRequest } from "types/blog";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_BLOG } from "constants/routesApiKeys";
import { useAppDispatch } from "../../redux/config";
import {
  setMessageSuccess,
  setMessageError,
} from "../../redux/course/courseSlice";

type ViewMode = "list" | "create" | "edit" | "details";

export default function BlogManagementPage() {
  const dispatch = useAppDispatch();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);

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
      dispatch(setMessageSuccess("Cập nhật blog thành công"));
      handleBackToList();
    } catch (error) {
      dispatch(setMessageError("Không thể cập nhật blog"));
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
            onSuccess={() => {
              handleBackToList();
            }}
          />
        );
      case "edit":
        return (
          <BlogFormSection
            mode="edit"
            onBack={handleBackToList}
            onSuccess={() => {
              handleBackToList();
            }}
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

  const title = "Quản lý Bài viết";
  const subtitle =
    viewMode === "create"
      ? "Nhập nội dung cho bài viết mới"
      : viewMode === "edit"
      ? `Chỉnh sửa bài viết: ${editingBlog?.title || ""}`
      : "Danh sách bài viết";

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
