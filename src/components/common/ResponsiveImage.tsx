import React from 'react';
import { Box, BoxProps } from '@mui/material';

export interface ResponsiveImageProps extends Omit<BoxProps, 'component'> {
  /** Image URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Fixed height for the container (overrides aspectRatio) */
  height?: number | string;
  /** Aspect ratio (width/height) - only used when height is not provided */
  aspectRatio?: number;
  /** Object fit behavior */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  /** Enable hover zoom effect */
  enableHoverZoom?: boolean;
  /** Zoom scale on hover (when enableHoverZoom is true) */
  hoverScale?: number;
  /** Show loading placeholder */
  showPlaceholder?: boolean;
  /** Custom placeholder content */
  placeholder?: React.ReactNode;
  /** Callback when image fails to load */
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  /** Callback when image loads successfully */
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  /** Make image clickable */
  onClick?: () => void;
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  height,
  aspectRatio = 16/9,
  objectFit = 'contain',
  enableHoverZoom = false,
  hoverScale = 1.05,
  showPlaceholder = true,
  placeholder,
  onError,
  onLoad,
  onClick,
  sx,
  ...boxProps
}) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setImageLoaded(true);
    setImageError(false);
    onLoad?.(event);
  };

  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setImageLoaded(false);
    setImageError(true);
    onError?.(event);
  };

  const containerHeight = height || undefined;
  const containerPaddingTop = height ? undefined : `${(1 / aspectRatio) * 100}%`;

  const defaultPlaceholder = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        backgroundColor: 'grey.100',
        color: 'text.secondary',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Box component="span" sx={{ fontSize: '2rem' }}>
        📷
      </Box>
      <Box component="span" sx={{ fontSize: '0.875rem', textAlign: 'center' }}>
        {imageError ? 'Failed to load image' : 'Loading...'}
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: containerHeight,
        paddingTop: containerPaddingTop,
        backgroundColor: 'grey.100',
        borderRadius: 1,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        display: height ? 'flex' : 'block',
        alignItems: height ? 'center' : undefined,
        justifyContent: height ? 'center' : undefined,
        ...sx,
      }}
      onClick={onClick}
      {...boxProps}
    >
      {/* Image element */}
      <Box
        component="img"
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        sx={{
          position: height ? 'static' : 'absolute',
          top: height ? 'auto' : 0,
          left: height ? 'auto' : 0,
          width: height ? 'auto' : '100%',
          height: height ? 'auto' : '100%',
          maxWidth: height ? '100%' : undefined,
          maxHeight: height ? '100%' : undefined,
          objectFit: objectFit,
          transition: enableHoverZoom ? 'transform 0.3s ease' : 'none',
          display: imageError ? 'none' : 'block',
          '&:hover': enableHoverZoom ? {
            transform: `scale(${hoverScale})`,
          } : {},
        }}
      />

      {/* Placeholder/Loading state */}
      {(!imageLoaded || imageError) && showPlaceholder && (
        <Box
          sx={{
            position: height ? 'absolute' : 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {placeholder || defaultPlaceholder}
        </Box>
      )}
    </Box>
  );
};

export default ResponsiveImage;