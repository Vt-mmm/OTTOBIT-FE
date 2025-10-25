import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_BLOG, ROUTES_API_TAG } from "constants/routesApiKeys";
import { ImageUploader } from "components/common/ImageUploader";
import TagPickerDialog from "./TagPickerDialog";
import { useNotification } from "hooks/useNotification";
import { BlogItem, BlogUpdateRequest } from "types/blog";

type Mode = "create" | "edit";

interface TagItem {
  id: string;
  name: string;
}

interface Props {
  mode: Mode;
  onBack: () => void;
  onSuccess: () => void;
  initialData?: BlogItem;
  onUpdate?: (data: BlogUpdateRequest) => Promise<void>;
}

export default function BlogFormSection({
  mode,
  onBack,
  onSuccess,
  initialData,
  onUpdate,
}: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openTagPicker, setOpenTagPicker] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    content?: string;
    thumbnailUrl?: string;
    tagIds?: string;
  }>({});
  const { showNotification, NotificationComponent } = useNotification();

  const fetchTags = async () => {
    try {
      const res = await axiosClient.get(
        `${ROUTES_API_TAG.GET_ALL}?PageNumber=1&PageSize=100`
      );
      const data = res?.data?.data?.items || [];
      setTags(data);
    } catch {}
  };

  useEffect(() => {
    fetchTags();
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setTitle(initialData.title || "");
      setContent(initialData.content || "");
      setThumbnailUrl(initialData.thumbnailUrl || "");
      setTagIds(initialData.tags?.map((tag) => tag.id) || []);
    }
  }, [mode, initialData]);

  // const handleChangeTags = (event: SelectChangeEvent<string[]>) => {
  //   const value = event.target.value as string[];
  //   setTagIds(value);
  //   // Clear validation error when user changes tags
  //   if (validationErrors.tagIds) {
  //     setValidationErrors((prev) => ({ ...prev, tagIds: undefined }));
  //   }
  // };

  const clearFieldError = (field: keyof typeof validationErrors) => {
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const errors: string[] = [];
    const fieldErrors: typeof validationErrors = {};

    if (!title.trim()) {
      errors.push("Tiêu đề không được để trống");
      fieldErrors.title = "Tiêu đề không được để trống";
    }

    if (!content.trim()) {
      errors.push("Nội dung không được để trống");
      fieldErrors.content = "Nội dung không được để trống";
    }

    if (!thumbnailUrl.trim()) {
      errors.push("URL hình ảnh không được để trống");
      fieldErrors.thumbnailUrl = "URL hình ảnh không được để trống";
    }

    if (tagIds.length === 0) {
      errors.push("Phải chọn ít nhất một tag");
      fieldErrors.tagIds = "Phải chọn ít nhất một tag";
    }

    setValidationErrors(fieldErrors);
    return errors;
  };

  const handleSubmit = async () => {
    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      showNotification(validationErrors.join(". "), "error");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await axiosClient.post(ROUTES_API_BLOG.CREATE, {
          title: title.trim(),
          content: content.trim(),
          thumbnailUrl: thumbnailUrl.trim(),
          tagIds,
        });
        showNotification("Tạo bài viết thành công", "success");
      } else if (mode === "edit" && onUpdate) {
        // Update blog content including tags
        await onUpdate({
          title: title.trim(),
          content: content.trim(),
          thumbnailUrl: thumbnailUrl.trim(),
          tagIds,
        });

        showNotification("Cập nhật bài viết thành công", "success");
      }
      onSuccess();
    } catch {
      showNotification(
        mode === "create"
          ? "Không thể tạo bài viết"
          : "Không thể cập nhật bài viết",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 2 } }}>
      {/* Header actions */}
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Quay lại
        </Button>
      </Box>

      <Grid container spacing={2}>
        {/* Top row - image and tags */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={1.5}>
                    <ImageUploader
                      entityType="general"
                      currentImageUrl={thumbnailUrl}
                      onImageChange={(url) => {
                        setThumbnailUrl(url || "");
                        clearFieldError("thumbnailUrl");
                      }}
                      height={220}
                      title="Thumbnail"
                      description="Chọn ảnh và tự động tải lên Firebase, form sẽ lấy URL trả về."
                    />
                    {!!validationErrors.thumbnailUrl && (
                      <Typography variant="caption" color="error">
                        {validationErrors.thumbnailUrl}
                      </Typography>
                    )}
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={1.5}>
                    <TextField
                      label="Tags"
                      value={tags
                        .filter((t) => tagIds.includes(t.id))
                        .map((t) => t.name)
                        .join(", ")}
                      placeholder="Chọn tags..."
                      InputProps={{ readOnly: true }}
                      onClick={() => setOpenTagPicker(true)}
                      error={!!validationErrors.tagIds}
                      helperText={validationErrors.tagIds}
                      required
                    />
                    <Button
                      variant="outlined"
                      onClick={() => setOpenTagPicker(true)}
                    >
                      Chọn tag
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Bottom row - main content full width */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  label="Tiêu đề"
                  fullWidth
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    clearFieldError("title");
                  }}
                  error={!!validationErrors.title}
                  helperText={validationErrors.title}
                  required
                />
                <Divider />
                <TextField
                  label="Nội dung"
                  fullWidth
                  multiline
                  minRows={22}
                  maxRows={22}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    clearFieldError("content");
                  }}
                  error={!!validationErrors.content}
                  helperText={validationErrors.content}
                  required
                  sx={{
                    "& .MuiInputBase-inputMultiline": {
                      minHeight: 520,
                      maxHeight: 840,
                      overflowY: "auto",
                    },
                  }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Submit Button */}
      <Box
        sx={{
          mt: 4,
          display: "flex",
          gap: 2,
          justifyContent: "flex-end",
        }}
      >
        <Button variant="outlined" onClick={onBack} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
          startIcon={<SaveIcon />}
        >
          {mode === "create" ? "Tạo mới" : "Cập nhật"}
        </Button>
      </Box>

      <TagPickerDialog
        open={openTagPicker}
        selectedIds={tagIds}
        onClose={() => setOpenTagPicker(false)}
        onSave={(ids) => {
          setTagIds(ids);
          setOpenTagPicker(false);
          fetchTags();
        }}
      />
      <NotificationComponent />
    </Container>
  );
}
