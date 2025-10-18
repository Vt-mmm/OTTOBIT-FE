import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Pagination,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Rating,
  Avatar,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../../redux/config";
import {
  getCourseRatings,
  getMyCourseRating,
  createCourseRating,
  updateCourseRating,
  deleteCourseRating,
} from "../../../../redux/courseRating/courseRatingThunks";
import { 
  clearError, 
  resetCourseRatingState,
} from "../../../../redux/courseRating/courseRatingSlice";
import RatingForm from "./components/RatingForm";
import { useLocales } from "../../../../hooks";

interface CourseRatingSectionProps {
  courseId: string;
  isUserEnrolled: boolean;
  ratingAverage?: number;
  ratingCount?: number;
}

export default function CourseRatingSection({
  courseId,
  isUserEnrolled,
  ratingAverage = 0,
  ratingCount = 0,
}: CourseRatingSectionProps) {
  const dispatch = useAppDispatch();
  const { translate } = useLocales();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const {
    myRating,
    ratings,
    page,
    size,
    totalPages,
    // isLoadingMyRating,
    isLoadingRatings,
    isSubmitting,
    error,
    // submitError,
  } = useAppSelector((state) => state.courseRating);

  const [showForm, setShowForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Cleanup state khi component unmount
  useEffect(() => {
    return () => {
      dispatch(resetCourseRatingState());
    };
  }, [dispatch]);

  // Fetch all ratings (public)
  useEffect(() => {
    dispatch(getCourseRatings({ courseId, page: 1, size: 10 }));
  }, [dispatch, courseId]);

  // Fetch user's rating if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getMyCourseRating(courseId));
    }
  }, [dispatch, courseId, isAuthenticated]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    dispatch(getCourseRatings({ courseId, page: value, size }));
  };

  const handleSubmitRating = async (stars: number, comment: string) => {
    try {
      if (myRating) {
        // Update existing rating
        await dispatch(
          updateCourseRating({
            courseId,
            data: { stars, comment },
          })
        ).unwrap();
      } else {
        // Create new rating
        await dispatch(
          createCourseRating({
            courseId,
            data: { stars, comment },
          })
        ).unwrap();
      }
      setShowForm(false);
      dispatch(clearError());
      // Refresh ratings list
      dispatch(getCourseRatings({ courseId, page, size }));
    } catch (err) {
      // Error already in Redux state via submitError
      // Will be displayed in Alert below the form
    }
  };

  const handleDeleteRating = async () => {
    try {
      await dispatch(deleteCourseRating(courseId)).unwrap();
      setDeleteDialogOpen(false);
      // Refresh ratings list
      dispatch(getCourseRatings({ courseId, page, size }));
    } catch (err) {
      // Error handled by redux
    }
  };

  const canRate = isAuthenticated && isUserEnrolled;

  // Format date to Vietnamese
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Box>
      {/* Header with average rating */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: 2,
            color: "#1f1f1f",
            fontSize: { xs: "1.5rem", md: "1.75rem" },
          }}
        >
          {translate("courses.StudentReviews")}
        </Typography>
        
        {/* Display average rating from BE */}
        {ratingCount > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Rating value={ratingAverage} precision={0.1} readOnly />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {ratingAverage.toFixed(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ({ratingCount} đánh giá)
            </Typography>
          </Box>
        )}
        
        {ratingCount === 0 && (
          <Typography variant="body2" color="text.secondary">
            Chưa có đánh giá nào
          </Typography>
        )}
      </Box>

      {/* User's rating section - Only show if authenticated and enrolled */}
      {canRate && (
        <Card sx={{ mb: 4, bgcolor: "#f8f9fa" }}>
          <CardContent>
            {myRating && !showForm ? (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      Đánh giá của bạn
                    </Typography>
                    <Rating value={myRating.stars} readOnly size="small" />
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => setShowForm(true)}
                      sx={{ mr: 1 }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                {myRating.comment && (
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    {myRating.comment}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                  {formatDate(myRating.createdAt)}
                  {myRating.createdAt !== myRating.updatedAt && " (đã chỉnh sửa)"}
                </Typography>
              </Box>
            ) : showForm ? (
              <RatingForm
                initialStars={myRating?.stars || 0}
                initialComment={myRating?.comment || ""}
                onSubmit={handleSubmitRating}
                onCancel={() => {
                  setShowForm(false);
                  dispatch(clearError());
                }}
                isSubmitting={isSubmitting}
                isEditMode={!!myRating}
              />
            ) : (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Chia sẻ trải nghiệm của bạn
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setShowForm(true);
                    dispatch(clearError());
                  }}
                >
                  Viết đánh giá
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Message for non-enrolled users */}
      {isAuthenticated && !isUserEnrolled && (
        <Alert severity="info" sx={{ mb: 4 }}>
          Bạn cần đăng ký khóa học và hoàn thành ít nhất 50% để có thể đánh giá.
        </Alert>
      )}

      {/* Message for non-authenticated users */}
      {!isAuthenticated && (
        <Alert severity="info" sx={{ mb: 4 }}>
          Vui lòng đăng nhập và đăng ký khóa học để đánh giá.
        </Alert>
      )}

      <Divider sx={{ my: 4 }} />

      {/* Ratings list */}
      <Box>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Tất cả đánh giá
        </Typography>

        {isLoadingRatings ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : ratings.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 200,
              bgcolor: "#fafafa",
              borderRadius: 2,
              p: 4,
            }}
          >
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Chưa có đánh giá nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hãy là người đầu tiên đánh giá khóa học này!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {ratings.map((rating) => (
              <Card key={rating.id} variant="outlined">
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "#00AB55" }}>
                      {rating.studentId.substring(0, 2).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Rating value={rating.stars} readOnly size="small" />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(rating.createdAt)}
                        </Typography>
                      </Box>
                      {rating.comment && (
                        <Typography variant="body2" sx={{ mt: 2, lineHeight: 1.6 }}>
                          {rating.comment}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Box>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Xác nhận xóa đánh giá</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa đánh giá của mình? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button
            onClick={handleDeleteRating}
            color="error"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
