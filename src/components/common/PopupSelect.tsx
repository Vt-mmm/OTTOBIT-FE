import { useState } from "react";
import {
  FormControl,
  TextField,
  InputAdornment,
  IconButton,
  Box,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import PaginatedSelectDialog from "./PaginatedSelectDialog";

interface PopupSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
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
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  title?: string;
}

export default function PopupSelect({
  label,
  value,
  onChange,
  items = [],
  loading = false,
  currentPage,
  onPageChange,
  totalPages,
  getItemLabel,
  getItemValue,
  noDataMessage = "Không có dữ liệu",
  pageSize = 12,
  searchTerm = "",
  onSearchChange,
  error = false,
  helperText,
  disabled = false,
  title,
}: PopupSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedItem = items.find((item) => getItemValue(item) === value);

  // Nếu value rỗng hoặc không có value thì hiển thị "Tất cả"
  // Nếu có selectedItem thì hiển thị label của item đó
  // Nếu không có selectedItem nhưng có value thì hiển thị value
  const displayValue =
    value === "" ? "Tất cả" : selectedItem ? getItemLabel(selectedItem) : "";

  const handleOpen = () => {
    if (!disabled && !loading) {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSelect = (item: any) => {
    onChange(getItemValue(item));
  };

  return (
    <Box>
      <FormControl fullWidth size="small" error={error}>
        <TextField
          label={displayValue ? undefined : label}
          value={displayValue}
          onMouseDown={(e) => {
            e.preventDefault();
            handleOpen();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            handleOpen();
          }}
          disabled={disabled || loading}
          error={error}
          helperText={helperText}
          placeholder={displayValue ? "" : `Chọn ${label.toLowerCase()}`}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleOpen}
                  disabled={disabled || loading}
                  edge="end"
                  size="small"
                >
                  <ArrowDropDownIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </FormControl>

      <PaginatedSelectDialog
        open={open}
        onClose={handleClose}
        onSelect={handleSelect}
        title={title || label}
        items={items}
        loading={loading}
        currentPage={currentPage}
        onPageChange={onPageChange}
        totalPages={totalPages}
        getItemLabel={getItemLabel}
        getItemValue={getItemValue}
        noDataMessage={noDataMessage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        selectedValue={value}
      />
    </Box>
  );
}
