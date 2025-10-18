import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Pagination,
  Box,
  CircularProgress,
  Typography,
  InputAdornment,
  IconButton,
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
        <Box sx={{ height: "400px", overflow: "auto" }}>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {/* All option - always show */}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleItemClick({ id: "", title: "Tất cả" })}
                  selected={selectedValue === ""}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "primary.main",
                      color: "primary.contrastText",
                      "&:hover": {
                        backgroundColor: "primary.dark",
                      },
                    },
                  }}
                >
                  <ListItemText primary="Tất cả" />
                </ListItemButton>
              </ListItem>
              {items.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100px",
                    px: 2,
                  }}
                >
                  <Typography color="text.secondary">
                    {noDataMessage}
                  </Typography>
                </Box>
              ) : (
                items.map((item) => {
                  const isSelected = selectedValue === getItemValue(item);
                  return (
                    <ListItem key={getItemValue(item)} disablePadding>
                      <ListItemButton
                        onClick={() => handleItemClick(item)}
                        selected={isSelected}
                        sx={{
                          "&.Mui-selected": {
                            backgroundColor: "primary.main",
                            color: "primary.contrastText",
                            "&:hover": {
                              backgroundColor: "primary.dark",
                            },
                          },
                        }}
                      >
                        <ListItemText primary={getItemLabel(item)} />
                      </ListItemButton>
                    </ListItem>
                  );
                })
              )}
            </List>
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
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
