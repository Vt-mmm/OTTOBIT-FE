import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Typography,
} from "@mui/material";

interface PaginationFooterProps {
  /** Total number of pages */
  totalPages: number;
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Current page size */
  pageSize: number;
  /** Optional total items count for display */
  totalItems?: number;
  /** Available page sizes (default: [6, 12, 24, 48]) */
  pageSizeOptions?: number[];
  /** Handler for page change */
  onPageChange: (page: number) => void;
  /** Handler for page size change */
  onPageSizeChange: (pageSize: number) => void;
  /** Show page size selector (default: true) */
  showPageSize?: boolean;
  /** Show total items info (default: false) */
  showTotalInfo?: boolean;
  /** Custom styling */
  sx?: object;
}

export default function PaginationFooter({
  totalPages,
  currentPage,
  pageSize,
  totalItems,
  pageSizeOptions = [6, 12, 24, 48],
  onPageChange,
  onPageSizeChange,
  showPageSize = true,
  showTotalInfo = false,
  sx,
}: PaginationFooterProps) {
  // Only render if there are pages to show
  if (!totalPages || totalPages <= 0) {
    return null;
  }

  const handlePageSizeChange = (newSize: number) => {
    onPageSizeChange(newSize);
    // Reset to page 1 when changing page size
    if (currentPage > 1) {
      onPageChange(1);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 2,
        ...sx,
      }}
    >
      {/* Left side - Page size selector or total info */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {showPageSize && (
          <FormControl size="small">
            <InputLabel>Page Size</InputLabel>
            <Select
              label="Page Size"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              sx={{ minWidth: 120 }}
            >
              {pageSizeOptions.map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {showTotalInfo && totalItems !== undefined && (
          <Typography variant="body2" color="text.secondary">
            Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)}-
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems} items
          </Typography>
        )}
      </Box>

      {/* Right side - Pagination component */}
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={(_, page) => onPageChange(page)}
        shape="rounded"
        color="primary"
        showFirstButton
        showLastButton
      />
    </Box>
  );
}

export type { PaginationFooterProps };