import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import "@google/model-viewer";

interface DroneModel3DProps {
  width?: string;
  height?: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
}

// Extend HTMLElementTagNameMap to include model-viewer
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": any;
    }
  }
}

const DroneModel3D: React.FC<DroneModel3DProps> = ({
  width = "100%",
  height = "400px",
  autoRotate = true,
  cameraControls = true,
}) => {
  const modelViewerRef = useRef<any>(null);

  useEffect(() => {
    // Đảm bảo model-viewer đã được load
    const modelViewer = modelViewerRef.current;
    if (modelViewer) {
      // Có thể thêm các event listeners nếu cần
      const handleLoad = () => {
        console.log("3D model loaded successfully");
      };

      const handleError = (error: any) => {
        console.error("Error loading 3D model:", error);
      };

      modelViewer.addEventListener("load", handleLoad);
      modelViewer.addEventListener("error", handleError);

      return () => {
        modelViewer.removeEventListener("load", handleLoad);
        modelViewer.removeEventListener("error", handleError);
      };
    }
  }, []);

  return (
    <Box
      sx={{
        width,
        height,
        overflow: "visible",
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        outline: "none",
        "& *": {
          border: "none !important",
          outline: "none !important",
          boxShadow: "none !important",
        },
      }}
    >
      <model-viewer
        ref={modelViewerRef}
        src="/asset/k07_drone.glb"
        alt="Drone 3D Model"
        auto-rotate={autoRotate}
        camera-controls={cameraControls}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          outline: "none",
          boxShadow: "none",
          background: "transparent",
          backgroundColor: "transparent",
        }}
        loading="eager"
        reveal="auto"
        environment-image="neutral"
        shadow-intensity="1"
        camera-orbit="0deg 75deg 105%"
        field-of-view="30deg"
        min-camera-orbit="auto auto auto"
        max-camera-orbit="auto auto auto"
        interpolation-decay="200"
        disable-zoom="false"
      />
    </Box>
  );
};

export default DroneModel3D;
