import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import SortIcon from "@mui/icons-material/Sort";

export type SortOption = 
  | "newest" 
  | "oldest" 
  | "popular" 
  | "rating" 
  | "price-low" 
  | "price-high"
  | "alphabetical";

interface CourseListingHeaderProps {
  totalCourses: number;
  currentPage: number;
  itemsPerPage: number;
  sortBy: SortOption;
  onSortChange: (sortBy: SortOption) => void;
  activeFiltersCount?: number;
}

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "popular", label: "Phổ biến nhất" },
  { value: "rating", label: "Đánh giá cao" },
  { value: "price-low", label: "Giá thấp đến cao" },
  { value: "price-high", label: "Giá cao đến thấp" },
  { value: "alphabetical", label: "Tên A-Z" },
];

export default function CourseListingHeader({
  totalCourses,
  currentPage,
  itemsPerPage,
  sortBy,
  onSortChange,
  activeFiltersCount = 0,
}: CourseListingHeaderProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCourses);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", md: "center" },
        flexDirection: { xs: "column", md: "row" },
        gap: 2,
        mb: 3,
        pb: 2,
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      {/* Left side - Results info */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {totalCourses > 0
            ? `Tìm thấy ${totalCourses.toLocaleString()} khóa học`
            : "Không tìm thấy khóa học"}
        </Typography>
        
        {totalCourses > 0 && (
          <Typography variant="body2" color="text.secondary">
            (Hiển thị {startItem}-{endItem})
          </Typography>
        )}

        {activeFiltersCount > 0 && (
          <Chip
            label={`${activeFiltersCount} bộ lọc`}
            color="primary"
            size="small"
            variant="outlined"
          />
        )}
      </Box>

      {/* Right side - Controls */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {/* Sort dropdown */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="sort-select-label">
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <SortIcon fontSize="small" />
              Sắp xếp
            </Box>
          </InputLabel>
          <Select
            labelId="sort-select-label"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <SortIcon fontSize="small" />
                Sắp xếp
              </Box>
            }
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

      </Box>
    </Box>
  );
}