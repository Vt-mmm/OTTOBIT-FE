import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import {
  Code as CodeIcon,
  Upload as UploadIcon,
  Description as FileIcon,
  PlayArrow as TestIcon,
} from "@mui/icons-material";

interface CodeUploadDialogProps {
  opened: boolean;
  onClose: () => void;
  onUpload: (code: string, isFile: boolean) => void;
  generatedCode: string;
  isUploading: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

export const CodeUploadDialog: React.FC<CodeUploadDialogProps> = ({
  opened,
  onClose,
  onUpload,
  generatedCode,
  isUploading,
}) => {
  const [fileContent, setFileContent] = useState<string>("");
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const content = await file.text();
        setFileContent(content);
      } catch (error) {
        console.error("Error reading file:", error);
        setFileContent("Error reading file");
      }
    } else {
      setFileContent("");
    }
  };

  const handleUploadBlocks = () => {
    onUpload(generatedCode, false);
  };

  const handleUploadFile = () => {
    if (fileContent) {
      onUpload(fileContent, true);
    }
  };

  // Test code for immediate LED display
  const testCode = `from microbit import *

# Immediate display - no loop needed
display.show(Image.HEART)
print("Hello from Ottobit!")

# Optional: scroll text after showing heart
import time
time.sleep(2)
display.scroll("Test OK!")`;

  const handleUploadTest = () => {
    onUpload(testCode, false);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Dialog
      open={opened}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={isUploading}
    >
      <DialogTitle>Upload Code to micro:bit</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Choose what code to upload to your micro:bit. You can upload generated
          code from blocks, a Python file, or a test program.
        </Alert>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            icon={<CodeIcon />}
            label="Generated from Blocks"
            iconPosition="start"
          />
          <Tab icon={<FileIcon />} label="Upload File" iconPosition="start" />
          <Tab icon={<TestIcon />} label="Test Code" iconPosition="start" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Code generated from your Blockly workspace:
          </Typography>
          <Paper
            elevation={1}
            sx={{ p: 2, mb: 2, maxHeight: 300, overflow: "auto" }}
          >
            <pre
              style={{ margin: 0, fontSize: "12px", fontFamily: "monospace" }}
            >
              {generatedCode}
            </pre>
          </Paper>
          <Button
            variant="contained"
            onClick={handleUploadBlocks}
            disabled={isUploading || !generatedCode.trim()}
            startIcon={
              isUploading ? <CircularProgress size={20} /> : <UploadIcon />
            }
            fullWidth
          >
            {isUploading ? "Uploading..." : "Upload Generated Code"}
          </Button>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Upload a Python (.py) file to micro:bit:
          </Typography>
          <input
            type="file"
            accept=".py,.txt"
            onChange={handleFileChange}
            style={{ marginBottom: 16 }}
          />
          {fileContent && (
            <Paper
              elevation={1}
              sx={{ p: 2, mb: 2, maxHeight: 300, overflow: "auto" }}
            >
              <pre
                style={{ margin: 0, fontSize: "12px", fontFamily: "monospace" }}
              >
                {fileContent}
              </pre>
            </Paper>
          )}
          <Button
            variant="contained"
            onClick={handleUploadFile}
            disabled={isUploading || !fileContent}
            startIcon={
              isUploading ? <CircularProgress size={20} /> : <UploadIcon />
            }
            fullWidth
          >
            {isUploading ? "Uploading..." : "Upload File"}
          </Button>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Simple test code to verify micro:bit connection:
          </Typography>
          <Paper
            elevation={1}
            sx={{ p: 2, mb: 2, maxHeight: 300, overflow: "auto" }}
          >
            <pre
              style={{ margin: 0, fontSize: "12px", fontFamily: "monospace" }}
            >
              {testCode}
            </pre>
          </Paper>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            gutterBottom
          >
            This will immediately show a heart on the LED matrix, then scroll
            "Test OK!" message.
          </Typography>
          <Button
            variant="contained"
            color="success"
            onClick={handleUploadTest}
            disabled={isUploading}
            startIcon={
              isUploading ? <CircularProgress size={20} /> : <TestIcon />
            }
            fullWidth
          >
            {isUploading ? "Uploading..." : "Upload Test Code"}
          </Button>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isUploading}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
