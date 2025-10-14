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
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_BLOG, ROUTES_API_TAG } from "constants/routesApiKeys";
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
        showNotification("Tạo blog thành công", "success");
      } else if (mode === "edit" && onUpdate) {
        // Update blog content including tags
        await onUpdate({
          title: title.trim(),
          content: content.trim(),
          thumbnailUrl: thumbnailUrl.trim(),
          tagIds,
        });

        showNotification("Cập nhật blog thành công", "success");
      }
      onSuccess();
    } catch {
      showNotification(
        mode === "create" ? "Không thể tạo blog" : "Không thể cập nhật blog",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 2 } }}>
      {/* Header actions */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            variant="text"
            onClick={onBack}
            disabled={isSubmitting}
          >
            Quay lại
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {mode === "create" ? "Tạo blog" : "Chỉnh sửa blog"}
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {mode === "create" ? "Tạo" : "Lưu"}
        </Button>
      </Box>

      <Grid container spacing={2}>
        {/* Left column - main content */}
        <Grid item xs={12} md={8}>
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
                  minRows={16}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    clearFieldError("content");
                  }}
                  error={!!validationErrors.content}
                  helperText={validationErrors.content}
                  required
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Right column - meta */}
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <Card>
              <CardContent>
                <Stack spacing={1.5}>
                  <TextField
                    label="Ảnh thumbnail URL"
                    fullWidth
                    value={thumbnailUrl}
                    onChange={(e) => {
                      setThumbnailUrl(e.target.value);
                      clearFieldError("thumbnailUrl");
                    }}
                    error={!!validationErrors.thumbnailUrl}
                    helperText={validationErrors.thumbnailUrl}
                    required
                  />
                  <Box
                    sx={{
                      mt: 1,
                      height: 180,
                      borderRadius: 1,
                      overflow: "hidden",
                      border: "1px solid #eee",
                      bgcolor: "#fafafa",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {thumbnailUrl ? (
                      <Box
                        component="img"
                        src={thumbnailUrl}
                        alt="thumbnail preview"
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e: any) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Xem trước ảnh thumbnail
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack spacing={1.5}>
                  <TextField
                    label="Tags"
                    value={tagIds
                      .map((id) => tags.find((t) => t.id === id)?.name || id)
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
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
      <TagPickerDialog
        open={openTagPicker}
        selectedIds={tagIds}
        onClose={() => setOpenTagPicker(false)}
        onSave={(ids) => {
          setTagIds(ids);
          setOpenTagPicker(false);
        }}
      />
      <NotificationComponent />
    </Container>
  );
}
