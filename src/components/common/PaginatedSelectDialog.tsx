import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Pagination,
  Box,
  CircularProgress,
  Typography,
  InputAdornment,
  IconButton,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

interface PaginatedSelectDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: any) => void;
  title: string;
  items: any[];
  loading?: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  getItemLabel: (item: any) => string;
  getItemValue: (item: any) => string;
  noDataMessage?: string;
  pageSize?: number;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  selectedValue?: string;
}

export default function PaginatedSelectDialog({
  open,
  onClose,
  onSelect,
  title,
  items = [],
  loading = false,
  currentPage,
  onPageChange,
  totalPages,
  getItemLabel,
  getItemValue,
  noDataMessage = "Không có dữ liệu",
  searchTerm = "",
  onSearchChange,
  selectedValue,
}: PaginatedSelectDialogProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  useEffect(() => {
    if (open) {
      setLocalSearchTerm(searchTerm);
    }
  }, [open, searchTerm]);

  const handleSearchSubmit = () => {
    if (onSearchChange) {
      onSearchChange(localSearchTerm);
    }
  };

  const handleItemClick = (item: any) => {
    onSelect(item);
    onClose();
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    onPageChange(page);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: "80vh",
          height: "600px",
        },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Search */}
        {onSearchChange && (
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Tìm kiếm..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearchSubmit();
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleSearchSubmit}
                      edge="end"
                      size="small"
                    >
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        )}

        {/* List */}
        <Box
          sx={{
            maxHeight: 400,
            overflowY: "auto",
            border: "1px solid #e0e0e0",
            borderRadius: 1,
            p: 1,
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : items.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                {noDataMessage}
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1}>
              {/* All option - always show */}
              <Box
                onClick={() => handleItemClick({ id: "", title: "Tất cả" })}
                sx={{
                  p: 2,
                  border:
                    selectedValue === ""
                      ? "2px solid #1976d2"
                      : "2px solid transparent",
                  borderRadius: 1,
                  bgcolor: selectedValue === "" ? "#f3f8ff" : "white",
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    bgcolor: selectedValue === "" ? "#f3f8ff" : "#f5f5f5",
                    borderColor: selectedValue === "" ? "#1976d2" : "#e0e0e0",
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1,
                      bgcolor: "#e8f5e8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Typography variant="h6" color="success.main">
                      A
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" fontWeight={600} noWrap>
                      Tất cả
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      Hiển thị tất cả
                    </Typography>
                  </Box>
                  {selectedValue === "" && (
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        bgcolor: "#1976d2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="white"
                        sx={{ fontSize: "14px" }}
                      >
                        ✓
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>

              {items.map((item) => {
                const isSelected = selectedValue === getItemValue(item);
                return (
                  <Box
                    key={getItemValue(item)}
                    onClick={() => handleItemClick(item)}
                    sx={{
                      p: 2,
                      border: isSelected
                        ? "2px solid #1976d2"
                        : "2px solid transparent",
                      borderRadius: 1,
                      bgcolor: isSelected ? "#f3f8ff" : "white",
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        bgcolor: isSelected ? "#f3f8ff" : "#f5f5f5",
                        borderColor: isSelected ? "#1976d2" : "#e0e0e0",
                      },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1,
                          bgcolor: "#e3f2fd",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Typography variant="h6" color="primary.main">
                          {getItemLabel(item).charAt(0).toUpperCase()}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={600} noWrap>
                          {getItemLabel(item)}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          ID: {getItemValue(item)}
                        </Typography>
                      </Box>
                      {isSelected && (
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            bgcolor: "#1976d2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="white"
                            sx={{ fontSize: "14px" }}
                          >
                            ✓
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: "divider",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              size="small"
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
