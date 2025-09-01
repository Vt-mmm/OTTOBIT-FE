import React, { useState } from 'react';
import { Box } from '@mui/material';
import {
  DirectionsCar,
  SettingsInputComponent,
  Build,
  Memory,
  Sync,
  Functions
} from '@mui/icons-material';

interface ToolboxCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  selectedColor: string;
  blocks: string[];
}

interface BlockToolboxProps {
  onCategorySelect: (categoryId: string) => void;
}

const BlockToolbox: React.FC<BlockToolboxProps> = ({ onCategorySelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // Bắt đầu với toolbox đóng

  const categories: ToolboxCategory[] = [
    {
      id: 'car',
      name: 'CAR',
      icon: DirectionsCar,
      color: '#4285f4',
      selectedColor: '#1976d2',
      blocks: ['start', 'move_forward', 'move_backward', 'turn_left', 'turn_right', 'rotate', 'stop']
    },
    {
      id: 'control',
      name: 'CONTROL',
      icon: SettingsInputComponent,
      color: '#f57f17',
      selectedColor: '#e65100',
      blocks: ['repeat', 'if_else', 'wait']
    },
    {
      id: 'actions',
      name: 'ACTIONS',
      icon: Build,
      color: '#9c27b0',
      selectedColor: '#7b1fa2',
      blocks: ['led_on', 'led_off', 'buzzer', 'servo']
    },
    {
      id: 'sensors',
      name: 'SENSORS',
      icon: Memory,
      color: '#ff9800',
      selectedColor: '#f57c00',
      blocks: ['ultrasonic', 'light_sensor', 'button', 'temperature']
    },
    {
      id: 'loops',
      name: 'LOOPS',
      icon: Sync,
      color: '#4caf50',
      selectedColor: '#388e3c',
      blocks: ['repeat_forever', 'repeat_times']
    },
    {
      id: 'functions',
      name: 'FUNCTIONS',
      icon: Functions,
      color: '#607d8b',
      selectedColor: '#455a64',
      blocks: ['function_def', 'function_call']
    }
  ];

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      // Nếu click vào category đã được chọn, đóng toolbox
      setSelectedCategory('');
      onCategorySelect('');
    } else {
      // Nếu click vào category khác, mở category đó
      setSelectedCategory(categoryId);
      onCategorySelect(categoryId);
    }
  };

  return (
    <Box 
      sx={{ 
        width: 70,
        height: '100%',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden'
      }}
    >
      {categories.map((category) => {
        const isSelected = selectedCategory === category.id;
        const IconComponent = category.icon;
        
        return (
          <Box
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              padding: '12px 8px',
              backgroundColor: isSelected ? category.color : 'transparent',
              color: isSelected ? '#ffffff' : category.color,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              borderBottom: '1px solid #f0f0f0',
              minHeight: '60px',
              position: 'relative',
              opacity: selectedCategory === '' ? 0.7 : 1, // Dim khi toolbox đóng
              '&:hover': {
                backgroundColor: category.color,
                color: '#ffffff',
                opacity: 1,
                '& .category-icon': {
                  color: '#ffffff'
                }
              },
              ...(isSelected && {
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '4px',
                  backgroundColor: category.color
                }
              })
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <IconComponent 
                className="category-icon"
                style={{ 
                  fontSize: '28px', 
                  color: isSelected ? '#ffffff' : category.color 
                }} 
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default BlockToolbox;
