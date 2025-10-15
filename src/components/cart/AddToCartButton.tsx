import { useState, useEffect } from "react";
import { Button, CircularProgress } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CheckIcon from "@mui/icons-material/Check";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "store/config";
import {
  addCartItemThunk,
  checkItemExistsThunk,
  getCartSummaryThunk,
  getCartThunk,
} from "store/cart/cartThunks";
import { PATH_USER } from "routes/paths";
import { useLocales } from "hooks";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
} from "utils/toast";

interface AddToCartButtonProps {
  courseId: string;
  coursePrice: number;
  disabled?: boolean;
  fullWidth?: boolean;
}

export default function AddToCartButton({
  courseId,
  coursePrice,
  disabled = false,
  fullWidth = false,
}: AddToCartButtonProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { translate } = useLocales();
  const { itemExistsCache } = useAppSelector((state) => state.cart);

  const isInCart = itemExistsCache[courseId] || false;
  // Avoid making all buttons show loading: use local adding state per button
  const [isAddingLocal, setIsAddingLocal] = useState<boolean>(false);

  // Check if we already have cache for this course
  const hasCache = courseId in itemExistsCache;
  const [isChecking, setIsChecking] = useState(!hasCache);

  useEffect(() => {
    // Only check if we don't have cache
    if (hasCache) {
      return;
    }

    // Check if item exists in cart on mount (background check)
    const checkExists = async () => {
      try {
        await dispatch(checkItemExistsThunk(courseId));
      } finally {
        setIsChecking(false);
      }
    };

    checkExists();
  }, [dispatch, courseId, hasCache]);

  const handleAddToCart = async () => {
    try {
      setIsAddingLocal(true);
      await dispatch(
        addCartItemThunk({
          courseId,
          unitPrice: coursePrice,
        })
      ).unwrap();

      // Refresh full cart to get updated cart data
      await dispatch(getCartThunk());

      // Refresh cart summary to update badge count
      await dispatch(getCartSummaryThunk());

      // Update exists cache
      await dispatch(checkItemExistsThunk(courseId));

      // Show success message
      showSuccessToast("Đã thêm khóa học vào giỏ hàng!");
    } catch (error: any) {
      // Error from unwrap() is already the string message from rejectWithValue
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.message || translate("cart.CannotAddToCart");

      // Show appropriate message based on error content
      if (
        errorMessage.includes("already exists") ||
        errorMessage.includes("đã có trong giỏ")
      ) {
        showWarningToast(translate("cart.CourseInCart"));
      } else if (
        errorMessage.includes("already own") ||
        errorMessage.includes("đã sở hữu")
      ) {
        showInfoToast(translate("cart.AlreadyOwnCourse"));
      } else if (
        errorMessage.includes("requires a compatible robot") ||
        errorMessage.includes("activate a compatible robot")
      ) {
        showErrorToast(
          "Khóa học này yêu cầu robot tương thích. Vui lòng kích hoạt robot trước khi mua khóa học!"
        );
      } else {
        showErrorToast(errorMessage);
      }
    } finally {
      setIsAddingLocal(false);
    }
  };

  const handleGoToCart = () => {
    navigate(PATH_USER.cart);
  };

  // Show "In Cart" immediately if cache says so
  if (isInCart) {
    return (
      <Button
        fullWidth={fullWidth}
        variant="outlined"
        color="success"
        startIcon={<CheckIcon />}
        onClick={handleGoToCart}
        sx={{
          textTransform: "none",
          fontWeight: 600,
        }}
      >
        Đã có trong giỏ hàng
      </Button>
    );
  }

  // Show loading state only while adding, not while checking
  // This improves UX - user sees button immediately
  return (
    <Button
      fullWidth={fullWidth}
      variant="contained"
      startIcon={
        isAddingLocal ? (
          <CircularProgress size={20} sx={{ color: "#212121" }} />
        ) : (
          <ShoppingCartIcon />
        )
      }
      onClick={handleAddToCart}
      disabled={disabled || isAddingLocal || isChecking}
      sx={{
        textTransform: "none",
        fontWeight: 600,
        bgcolor: "#ffffff",
        color: "#212121",
        border: "2px solid #e0e0e0",
        py: 1.5,
        px: 3,
        borderRadius: 2,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        "&:hover": {
          bgcolor: "#f5f5f5",
          borderColor: "#bdbdbd",
          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
        },
        "&:disabled": {
          bgcolor: "#fafafa",
          color: "#9e9e9e",
          borderColor: "#e0e0e0",
        },
      }}
    >
      {isAddingLocal ? translate("cart.Adding") : translate("cart.AddToCart")}
    </Button>
  );
}
