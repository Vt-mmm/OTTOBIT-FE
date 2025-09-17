import React, { useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Button,
  Divider,
  Chip,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

interface CourseFilters {
  search: string;
  categories: string[];
  levels: string[];
  instructors: string[];
}

interface CourseFilterSidebarProps {
  filters: CourseFilters;
  onFiltersChange: (filters: CourseFilters) => void;
  courseCategories: string[];
  courseLevels: string[];
  courseInstructors: string[];
}

const defaultFilters: CourseFilters = {
  search: "",
  categories: [],
  levels: [],
  instructors: [],
};

export default function CourseFilterSidebar({
  filters,
  onFiltersChange,
  courseCategories,
  courseLevels,
  courseInstructors,
}: CourseFilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState<CourseFilters>(filters);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...localFilters, search: event.target.value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...localFilters.categories, category]
      : localFilters.categories.filter((c) => c !== category);
    const newFilters = { ...localFilters, categories: newCategories };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleLevelChange = (level: string, checked: boolean) => {
    const newLevels = checked
      ? [...localFilters.levels, level]
      : localFilters.levels.filter((l) => l !== level);
    const newFilters = { ...localFilters, levels: newLevels };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleInstructorChange = (instructor: string, checked: boolean) => {
    const newInstructors = checked
      ? [...localFilters.instructors, instructor]
      : localFilters.instructors.filter((i) => i !== instructor);
    const newFilters = { ...localFilters, instructors: newInstructors };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };


  const handleClearFilters = () => {
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const getActiveFiltersCount = () => {
    return (
      localFilters.categories.length +
      localFilters.levels.length +
      localFilters.instructors.length +
      (localFilters.search ? 1 : 0)
    );
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 300, backgroundColor: "white", borderRadius: 2, p: 2, border: "1px solid #e0e0e0" }}>
      {/* Search */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Tìm kiếm
      </Typography>
      <TextField
        fullWidth
        placeholder="Tìm kiếm khóa học..."
        value={localFilters.search}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />,
        }}
        sx={{ mb: 3 }}
      />

      {/* Active Filters */}
      {getActiveFiltersCount() > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="subtitle2" color="primary">
              Bộ lọc đang áp dụng ({getActiveFiltersCount()})
            </Typography>
            <Button
              size="small"
              onClick={handleClearFilters}
              startIcon={<ClearIcon />}
              sx={{ minWidth: "auto" }}
            >
              Xóa tất cả
            </Button>
          </Box>
          <Stack direction="row" flexWrap="wrap" gap={0.5}>
            {localFilters.search && (
              <Chip
                label={`"${localFilters.search}"`}
                size="small"
                onDelete={() => handleSearchChange({ target: { value: "" } } as any)}
              />
            )}
            {localFilters.categories.map((category) => (
              <Chip
                key={category}
                label={category}
                size="small"
                onDelete={() => handleCategoryChange(category, false)}
              />
            ))}
            {localFilters.levels.map((level) => (
              <Chip
                key={level}
                label={level}
                size="small"
                onDelete={() => handleLevelChange(level, false)}
              />
            ))}
          </Stack>
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      {/* Course Categories - Only show if there are categories */}
      {courseCategories.length > 0 && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight={600}>
              Danh mục khóa học
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              {courseCategories.map((category) => (
                <FormControlLabel
                  key={category}
                  control={
                    <Checkbox
                      checked={localFilters.categories.includes(category)}
                      onChange={(e) => handleCategoryChange(category, e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {category}
                    </Typography>
                  }
                />
              ))}
            </FormGroup>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Course Levels - Only show if there are levels */}
      {courseLevels.length > 0 && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight={600}>
              Cấp độ
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              {courseLevels.map((level) => (
                <FormControlLabel
                  key={level}
                  control={
                    <Checkbox
                      checked={localFilters.levels.includes(level)}
                      onChange={(e) => handleLevelChange(level, e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {level}
                    </Typography>
                  }
                />
              ))}
            </FormGroup>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Instructors - Only show if there are instructors */}
      {courseInstructors.length > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight={600}>
              Giảng viên
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              {courseInstructors.map((instructor) => (
                <FormControlLabel
                  key={instructor}
                  control={
                    <Checkbox
                      checked={localFilters.instructors.includes(instructor)}
                      onChange={(e) => handleInstructorChange(instructor, e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {instructor}
                    </Typography>
                  }
                />
              ))}
            </FormGroup>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
}