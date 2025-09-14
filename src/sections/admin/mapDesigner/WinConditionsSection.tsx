import { Box, Paper, Typography, Button, TextField, IconButton, Chip, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { useState } from "react";
import { WinCondition } from "common/models";
import { THEME_COLORS, WIN_CONDITION_TYPES } from "./theme.config";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface WinConditionsSectionProps {
  conditions: WinCondition[];
  onAddCondition: (condition: WinCondition) => void;
  onRemoveCondition: (id: string) => void;
}

export default function WinConditionsSection({
  conditions,
  onAddCondition,
  onRemoveCondition,
}: WinConditionsSectionProps) {
  const [selectedType, setSelectedType] = useState("");
  const [conditionValue, setConditionValue] = useState<number>(0);
  const [conditionDescription, setConditionDescription] = useState("");

  const handleAddCondition = () => {
    if (!selectedType) return;

    const conditionType = WIN_CONDITION_TYPES.find(t => t.id === selectedType);
    if (!conditionType) return;

    const newCondition: WinCondition = {
      id: Date.now().toString(),
      type: selectedType,
      description: conditionDescription || conditionType.description,
      value: conditionType.requiresValue ? conditionValue : undefined,
    };

    onAddCondition(newCondition);
    
    // Reset form
    setSelectedType("");
    setConditionValue(0);
    setConditionDescription("");
  };

  const selectedConditionType = WIN_CONDITION_TYPES.find(t => t.id === selectedType);

  return (
    <Paper
      sx={{
        p: 2,
        height: '100%',
        overflow: 'auto',
        bgcolor: THEME_COLORS.surface,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 2, 
          fontWeight: 600,
          color: THEME_COLORS.text.primary,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <CheckCircleIcon sx={{ color: THEME_COLORS.primary }} />
        Điều kiện chiến thắng
      </Typography>

      {/* Current conditions list */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, color: THEME_COLORS.text.secondary }}>
          Điều kiện hiện tại ({conditions.length})
        </Typography>
        
        {conditions.length === 0 ? (
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: THEME_COLORS.background,
              borderRadius: 1,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" sx={{ color: THEME_COLORS.text.disabled }}>
              Chưa có điều kiện nào
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {conditions.map((condition) => {
              const type = WIN_CONDITION_TYPES.find(t => t.id === condition.type);
              return (
                <Box
                  key={condition.id}
                  sx={{
                    p: 2,
                    bgcolor: THEME_COLORS.background,
                    borderRadius: 1,
                    border: `1px solid ${THEME_COLORS.border}`,
                    position: 'relative',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: THEME_COLORS.text.primary }}>
                        {type?.name || condition.type}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', color: THEME_COLORS.text.secondary, mt: 0.5 }}>
                        {condition.description}
                      </Typography>
                      {condition.value !== undefined && (
                        <Chip
                          label={`${type?.valueLabel || 'Giá trị'}: ${condition.value}`}
                          size="small"
                          sx={{ 
                            mt: 1,
                            bgcolor: THEME_COLORS.primary,
                            color: '#fff',
                          }}
                        />
                      )}
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => onRemoveCondition(condition.id)}
                      sx={{ 
                        color: THEME_COLORS.error,
                        '&:hover': {
                          bgcolor: `${THEME_COLORS.error}10`,
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Add new condition form */}
      <Box sx={{ 
        p: 2, 
        border: `2px dashed ${THEME_COLORS.primary}40`,
        borderRadius: 1,
        bgcolor: THEME_COLORS.hover,
      }}>
        <Typography variant="subtitle2" sx={{ mb: 2, color: THEME_COLORS.text.primary, fontWeight: 600 }}>
          Thêm điều kiện mới
        </Typography>
        
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Loại điều kiện</InputLabel>
          <Select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            label="Loại điều kiện"
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: THEME_COLORS.border,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: THEME_COLORS.primary,
              },
            }}
          >
            {WIN_CONDITION_TYPES.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedConditionType && (
          <>
            <TextField
              fullWidth
              label="Mô tả"
              value={conditionDescription}
              onChange={(e) => setConditionDescription(e.target.value)}
              size="small"
              sx={{ mb: 2 }}
              placeholder={selectedConditionType.description}
            />

            {selectedConditionType.requiresValue && (
              <TextField
                fullWidth
                label={selectedConditionType.valueLabel || "Giá trị"}
                type="number"
                value={conditionValue}
                onChange={(e) => setConditionValue(Number(e.target.value))}
                size="small"
                sx={{ mb: 2 }}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            )}
          </>
        )}

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          fullWidth
          onClick={handleAddCondition}
          disabled={!selectedType}
          sx={{
            bgcolor: THEME_COLORS.primary,
            '&:hover': {
              bgcolor: THEME_COLORS.primaryDark,
            },
            '&.Mui-disabled': {
              bgcolor: THEME_COLORS.text.disabled,
            },
          }}
        >
          Thêm điều kiện
        </Button>
      </Box>

      {/* Map statistics */}
      <Box sx={{ mt: 3, p: 2, bgcolor: THEME_COLORS.background, borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: THEME_COLORS.text.primary, fontWeight: 600 }}>
          Thống kê Map
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', color: THEME_COLORS.text.secondary }}>
          • Kích thước: 10x10
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', color: THEME_COLORS.text.secondary }}>
          • Số điều kiện: {conditions.length}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', color: THEME_COLORS.text.secondary }}>
          • Độ khó: {conditions.length <= 1 ? 'Dễ' : conditions.length <= 3 ? 'Trung bình' : 'Khó'}
        </Typography>
      </Box>
    </Paper>
  );
}