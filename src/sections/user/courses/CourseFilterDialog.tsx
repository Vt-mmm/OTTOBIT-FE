import { useEffect, useState } from "react";
import {
  Drawer,
  Stack,
  TextField,
  MenuItem,
  Button,
  Typography,
  InputAdornment,
  Box,
  IconButton,
  Divider,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export type CourseFilters = {
  minPrice?: number;
  maxPrice?: number;
  type?: number; // 1 = Free, 2 = Paid
  sortBy?: number; // 0 = Title, 1 = CreatedAt
  sortDirection?: number; // 0 = Ascending, 1 = Descending
};

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: CourseFilters;
  onApply: (values: CourseFilters) => void;
}

export default function CourseFilterDialog({
  open,
  onClose,
  initial,
  onApply,
}: Props) {
  const [values, setValues] = useState<CourseFilters>({
    sortBy: 1, // CreatedAt
    sortDirection: 1, // Descending
  });

  useEffect(() => {
    if (open) {
      setValues({
        sortBy: 1,
        sortDirection: 1,
        ...initial,
        // Đảm bảo sortBy và sortDirection luôn có giá trị mặc định
        sortBy: initial?.sortBy ?? 1,
        sortDirection: initial?.sortDirection ?? 1,
      });
    }
  }, [open, initial]);

  const handleChange = (key: keyof CourseFilters, val: any) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100%", sm: 400 },
          maxWidth: "100vw",
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            p: 3,
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Bộ lọc khóa học
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
          <Stack spacing={4}>
            {/* Price Range */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Khoảng giá
              </Typography>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Giá tối thiểu"
                  type="number"
                  placeholder="VD: 10000"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">VNĐ</InputAdornment>
                    ),
                  }}
                  inputProps={{ min: 0 }}
                  value={values.minPrice ?? ""}
                  onChange={(e) =>
                    handleChange(
                      "minPrice",
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Giá tối đa"
                  type="number"
                  placeholder="VD: 100000"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">VNĐ</InputAdornment>
                    ),
                  }}
                  inputProps={{ min: 0 }}
                  value={values.maxPrice ?? ""}
                  onChange={(e) =>
                    handleChange(
                      "maxPrice",
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Stack>
            </Box>

            <Divider />

            {/* Course Type */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Loại khóa học
              </Typography>
              <FormControl fullWidth>
                <InputLabel shrink>Loại khóa học</InputLabel>
                <Select
                  value={values.type === undefined ? "" : values.type}
                  onChange={(e) =>
                    handleChange(
                      "type",
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                  label="Loại khóa học"
                  displayEmpty
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value={1}>Miễn phí</MenuItem>
                  <MenuItem value={2}>Trả phí</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Divider />

            {/* Sort By */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Sắp xếp theo
              </Typography>
              <TextField
                select
                fullWidth
                value={values.sortBy || 1}
                onChange={(e) => handleChange("sortBy", Number(e.target.value))}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              >
                <MenuItem value={0}>Tên khóa học</MenuItem>
                <MenuItem value={1}>Ngày tạo</MenuItem>
              </TextField>
            </Box>

            <Divider />

            {/* Sort Direction */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Thứ tự
              </Typography>
              <TextField
                select
                fullWidth
                value={values.sortDirection || 1}
                onChange={(e) =>
                  handleChange("sortDirection", Number(e.target.value))
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              >
                <MenuItem value={0}>Tăng dần</MenuItem>
                <MenuItem value={1}>Giảm dần</MenuItem>
              </TextField>
            </Box>
          </Stack>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 3,
            borderTop: "1px solid #e0e0e0",
            display: "flex",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            fullWidth
            onClick={onClose}
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={() => onApply(values)}
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "#1976d2",
              "&:hover": {
                bgcolor: "#1565c0",
              },
            }}
          >
            Áp dụng
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
