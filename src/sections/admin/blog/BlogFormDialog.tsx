import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
} from "@mui/material";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_BLOG, ROUTES_API_TAG } from "constants/routesApiKeys";

interface TagItem {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BlogFormDialog({ open, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setSummary("");
    setThumbnailUrl("");
    setTagIds([]);
  };

  const fetchTags = async () => {
    try {
      const res = await axiosClient.get(
        `${ROUTES_API_TAG.GET_ALL}?PageNumber=1&PageSize=20`
      );
      const data = res?.data?.data?.items || [];
      setTags(data);
    } catch {}
  };

  useEffect(() => {
    if (open) {
      fetchTags();
    }
  }, [open]);

  // Ensure names resolve for newly selected tag ids by refetching if any id is unknown
  useEffect(() => {
    if (!open) return;
    if (tagIds.length === 0) return;
    const knownIds = new Set(tags.map((t) => t.id));
    const hasUnknown = tagIds.some((id) => !knownIds.has(id));
    if (hasUnknown) {
      fetchTags();
    }
  }, [open, tagIds, tags]);

  const handleChangeTags = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setTagIds(value);
    // Ensure latest names are available immediately after selection
    fetchTags();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await axiosClient.post(ROUTES_API_BLOG.CREATE, {
        title: title.trim(),
        content: content.trim(),
        summary: summary.trim(),
        thumbnailUrl: thumbnailUrl.trim() || null,
        tagIds,
      });
      onSuccess();
      resetForm();
      onClose();
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Tạo blog</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Tiêu đề"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Tóm tắt"
            fullWidth
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
          <TextField
            label="Nội dung"
            fullWidth
            multiline
            minRows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <TextField
            label="Ảnh thumbnail URL"
            fullWidth
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
          />

          <FormControl fullWidth>
            <InputLabel id="blog-tags-label">Tags</InputLabel>
            <Select
              labelId="blog-tags-label"
              multiple
              value={tagIds}
              onChange={handleChangeTags}
              input={<OutlinedInput label="Tags" />}
              renderValue={(selected) =>
                tags
                  .filter((t) => (selected as string[]).includes(t.id))
                  .map((t) => t.name)
                  .join(", ")
              }
            >
              {tags.map((tag) => (
                <MenuItem key={tag.id} value={tag.id}>
                  {tag.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          Tạo
        </Button>
      </DialogActions>
    </Dialog>
  );
}
