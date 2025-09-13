import React, { useState } from 'react';
import { Box } from '@mui/material';
import {
  PlayArrow,
  Loop,
  Memory,
  Sensors,
  Build,
  Psychology
} from '@mui/icons-material';

interface ToolboxCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  selectedColor: string;
}

interface BlockToolboxProps {
  onCategorySelect: (categoryId: string) => void;
}

const BlockToolbox: React.FC<BlockToolboxProps> = ({ onCategorySelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // Bắt đầu với toolbox đóng

  const categories: ToolboxCategory[] = [
    {
      id: 'basics',
      name: 'BASICS',
      icon: PlayArrow,
      color: '#4a90e2',
      selectedColor: '#1976d2'
    },
    {
      id: 'loops',
      name: 'LOOPS',
      icon: Loop,
      color: '#ff9800',
      selectedColor: '#f57c00'
    },
    {
      id: 'conditions',
      name: 'CONDITIONS',
      icon: Memory,
      color: '#7b68ee',
      selectedColor: '#5e55e8'
    },
    {
      id: 'logic',
      name: 'LOGIC',
      icon: Psychology,
      color: '#9c27b0',
      selectedColor: '#7b1fa2'
    },
    {
      id: 'sensors',
      name: 'SENSORS',
      icon: Sensors,
      color: '#ff6b6b',
      selectedColor: '#f44336'
    },
    {
      id: 'actions',
      name: 'ACTIONS',
      icon: Build,
      color: '#51cf66',
      selectedColor: '#4caf50'
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
