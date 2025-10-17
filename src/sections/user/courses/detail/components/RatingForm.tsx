import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Rating,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { StarBorder } from "@mui/icons-material";

interface RatingFormProps {
  initialStars?: number;
  initialComment?: string;
  onSubmit: (stars: number, comment: string) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  isEditMode?: boolean;
}

export default function RatingForm({
  initialStars = 0,
  initialComment = "",
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEditMode = false,
}: RatingFormProps) {
  const [stars, setStars] = useState(initialStars);
  const [comment, setComment] = useState(initialComment);
  const [error, setError] = useState("");

  useEffect(() => {
    setStars(initialStars);
    setComment(initialComment);
  }, [initialStars, initialComment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (stars === 0) {
      setError("Vui lòng chọn số sao đánh giá");
      return;
    }

    if (comment.length > 1000) {
      setError("Bình luận không được vượt quá 1000 ký tự");
      return;
    }

    setError("");
    onSubmit(stars, comment.trim());
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Số sao: <span style={{ color: "red" }}>*</span>
        </Typography>
        <Rating
          name="course-rating"
          value={stars}
          onChange={(_, newValue) => {
            setStars(newValue || 0);
            setError("");
          }}
          size="large"
          emptyIcon={<StarBorder fontSize="inherit" />}
        />
      </Box>

      <Box>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Nhận xét (Tùy chọn)
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            if (e.target.value.length > 1000) {
              setError("Bình luận không được vượt quá 1000 ký tự");
            } else {
              setError("");
            }
          }}
          helperText={`${comment.length}/1000 ký tự`}
          error={Boolean(error)}
        />
      </Box>

      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}

      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
        {onCancel && (
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting || stars === 0}
          startIcon={isSubmitting && <CircularProgress size={20} />}
        >
          {isSubmitting
            ? "Đang xử lý..."
            : isEditMode
            ? "Cập nhật"
            : "Gửi đánh giá"}
        </Button>
      </Box>
    </Box>
  );
}
