import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardMedia,
  Alert,
} from "@mui/material";
import {
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

interface MicrobitConnectionGuideProps {
  open: boolean;
  onClose: () => void;
  onConnect: () => void;
}

const steps = [
  {
    label: "Connect Cable",
    description: "Connect your micro:bit to your computer using a USB cable",
    image: "/images/connect-cable.gif",
    content: (
      <Box sx={{ textAlign: "center", py: 2 }}>
        <Card sx={{ maxWidth: 400, mx: "auto", mb: 2 }}>
          <CardMedia
            component="img"
            height="300"
            image="/images/connect-cable.gif"
            alt="Connect micro:bit cable"
            sx={{ objectFit: "contain" }}
          />
        </Card>
        <Typography variant="body1" color="text.secondary">
          Make sure your micro:bit is connected via USB cable
        </Typography>
      </Box>
    ),
  },
  {
    label: "Select micro:bit",
    description: "In the browser popup, select your micro:bit device",
    image: "/images/select-microbit.png",
    content: (
      <Box sx={{ textAlign: "center", py: 2 }}>
        <Card sx={{ maxWidth: 500, mx: "auto", mb: 2 }}>
          <CardMedia
            component="img"
            height="400"
            image="/images/select-microbit.png"
            alt="Select micro:bit device"
            sx={{ objectFit: "contain" }}
          />
        </Card>
        <Box sx={{ textAlign: "left", maxWidth: 500, mx: "auto" }}>
          <Typography variant="h6" gutterBottom>
            In next popup:
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography variant="body1" sx={{ mr: 1, fontWeight: "bold" }}>
              1
            </Typography>
            <Typography variant="body1">Choose your micro:bit</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography variant="body1" sx={{ mr: 1, fontWeight: "bold" }}>
              2
            </Typography>
            <Typography variant="body1">Select 'Connect'</Typography>
          </Box>
          <Alert severity="info" sx={{ mt: 2 }}>
            Look for "BBC micro:bit CMSIS-DAP" in the device list
          </Alert>
        </Box>
      </Box>
    ),
  },
];

export default function MicrobitConnectionGuide({
  open,
  onClose,
  onConnect,
}: MicrobitConnectionGuideProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      // Save preference
      if (dontShowAgain) {
        localStorage.setItem("microbit-connection-guide-dismissed", "true");
      }
      onConnect();
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem("microbit-connection-guide-dismissed", "true");
    }
    onClose();
  };

  const currentStep = steps[activeStep];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div">
            {currentStep.label}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">
              {activeStep + 1} of {steps.length}
            </Typography>
            <Button
              size="small"
              onClick={handleClose}
              sx={{ minWidth: "auto", p: 0.5 }}
            >
              <CloseIcon />
            </Button>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box sx={{ minHeight: 400 }}>{currentStep.content}</Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography variant="body2" color="primary">
                Don't show this again
              </Typography>
            }
          />

          <Box sx={{ display: "flex", gap: 1 }}>
            {activeStep > 0 && (
              <Button
                onClick={handleBack}
                startIcon={<ArrowBackIcon />}
                variant="outlined"
                color="primary"
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              endIcon={
                activeStep === steps.length - 1 ? undefined : (
                  <ArrowForwardIcon />
                )
              }
              variant="contained"
              color="primary"
            >
              {activeStep === steps.length - 1 ? "Connect" : "Next"}
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
