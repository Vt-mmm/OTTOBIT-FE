import { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Box,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { CartItemResult } from "common/@types/cart";
import { useAppDispatch } from "store/config";
import { removeCartItemThunk, getCartThunk } from "store/cart/cartThunks";
import { useNavigate } from "react-router-dom";
import { showSuccessToast, showErrorToast } from "utils/toast";
import { useLocales } from "../../hooks";

interface CartItemCardProps {
  item: CartItemResult;
}

export default function CartItemCard({ item }: CartItemCardProps) {
  const { translate } = useLocales();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isRemoving, setIsRemoving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      await dispatch(removeCartItemThunk(item.courseId)).unwrap();
      // Refresh cart data
      await dispatch(getCartThunk());
      setShowDeleteDialog(false);
      showSuccessToast("Đã xóa khóa học khỏi giỏ hàng!");
    } catch (error: any) {
      console.error("Failed to remove item:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể xóa khóa học. Vui lòng thử lại!";
      showErrorToast(errorMessage);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleNavigateToCourse = () => {
    navigate(`/courses/${item.courseId}`);
  };

  return (
    <>
      <Card
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          boxShadow: 2,
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: 4,
          },
        }}
      >
        {/* Course Image */}
        <CardMedia
          component="img"
          sx={{
            width: { xs: "100%", sm: 200 },
            height: { xs: 200, sm: 150 },
            objectFit: "cover",
            cursor: "pointer",
          }}
          image={item.courseImageUrl || "/images/default-course.jpg"}
          alt={item.courseTitle}
          onClick={handleNavigateToCourse}
        />

        {/* Course Info */}
        <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <CardContent sx={{ flex: "1 0 auto", p: 2 }}>
            {/* Title */}
            <Typography
              variant="h6"
              component="div"
              sx={{
                mb: 1,
                fontWeight: 600,
                cursor: "pointer",
                "&:hover": { color: "primary.main" },
              }}
              onClick={handleNavigateToCourse}
            >
              {item.courseTitle}
            </Typography>

            {/* Description */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {item.courseDescription}
            </Typography>

            {/* Price and Actions */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: "auto",
              }}
            >
              {/* Price */}
              <Typography
                variant="h6"
                color="primary.main"
                sx={{ fontWeight: 600 }}
              >
                {item.unitPrice.toLocaleString("vi-VN")} ₫
              </Typography>

              {/* Delete Button */}
              <IconButton
                color="error"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isRemoving}
                sx={{
                  "&:hover": {
                    backgroundColor: "error.light",
                    color: "white",
                  },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </CardContent>
        </Box>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>{translate("cart.ConfirmDelete")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {translate("cart.DeleteConfirmMessage", {
              courseTitle: item.courseTitle,
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowDeleteDialog(false)}
            disabled={isRemoving}
          >
            {translate("cart.Cancel")}
          </Button>
          <Button
            onClick={handleRemove}
            color="error"
            variant="contained"
            disabled={isRemoving}
          >
            {isRemoving ? translate("cart.Deleting") : translate("cart.Delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
