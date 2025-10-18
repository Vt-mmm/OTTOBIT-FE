import React, { useState, useEffect } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Pagination,
  CircularProgress,
  Typography,
  FormHelperText,
} from "@mui/material";

interface PaginatedSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  items: any[];
  loading?: boolean;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  pageSize?: number;
  getItemLabel: (item: any) => string;
  getItemValue: (item: any) => string;
  emptyMessage?: string;
  noDataMessage?: string;
  onPageChange?: (page: number) => void;
  currentPage?: number;
  totalPages?: number; // Use API totalPages instead of calculating from items.length
}

export default function PaginatedSelect({
  label,
  value,
  onChange,
  items = [],
  loading = false,
  error = false,
  helperText,
  disabled = false,
  pageSize = 12,
  getItemLabel,
  getItemValue,
  emptyMessage = "No items available",
  noDataMessage = "No data available",
  onPageChange,
  currentPage: externalCurrentPage,
  totalPages: externalTotalPages,
}: PaginatedSelectProps) {
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);

  const currentPage = externalCurrentPage ?? internalCurrentPage;
  const totalPages = externalTotalPages ?? Math.ceil(items.length / pageSize);

  // For server-side pagination, use items directly (they're already paginated)
  // For client-side pagination, slice the items
  const currentItems = externalTotalPages
    ? items
    : items.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset to page 1 when items change
  useEffect(() => {
    if (externalCurrentPage === undefined) {
      setInternalCurrentPage(1);
    }
  }, [items.length, externalCurrentPage]);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      setInternalCurrentPage(page);
    }
  };

  const handleSelectChange = (event: any) => {
    onChange(event.target.value as string);
  };

  return (
    <Box>
      <FormControl fullWidth size="small" error={error}>
        <InputLabel>{label}</InputLabel>
        <Select
          label={label}
          value={value}
          onChange={handleSelectChange}
          disabled={disabled || loading}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 300,
                overflow: "auto",
              },
            },
          }}
        >
          {loading ? (
            <MenuItem disabled>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  width: "100%",
                }}
              >
                <CircularProgress size={16} />
                <Typography variant="body2">Loading...</Typography>
              </Box>
            </MenuItem>
          ) : items.length === 0 ? (
            <MenuItem value="" disabled>
              {noDataMessage}
            </MenuItem>
          ) : (
            <>
              {currentItems.map((item) => (
                <MenuItem key={getItemValue(item)} value={getItemValue(item)}>
                  {getItemLabel(item)}
                </MenuItem>
              ))}
              {/* Pagination inside dropdown */}
              {totalPages > 1 && (
                <MenuItem
                  disabled
                  sx={{
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                    cursor: "default",
                    minHeight: "auto",
                    padding: 0,
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      p: 1,
                      bgcolor: "#f5f5f5",
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={(event, page) => {
                        event.stopPropagation();
                        handlePageChange(event, page);
                      }}
                      size="small"
                      color="primary"
                      sx={{
                        "& .MuiPaginationItem-root": {
                          minWidth: 24,
                          height: 24,
                          fontSize: "0.6rem",
                        },
                      }}
                    />
                  </Box>
                </MenuItem>
              )}
            </>
          )}
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    </Box>
  );
}
