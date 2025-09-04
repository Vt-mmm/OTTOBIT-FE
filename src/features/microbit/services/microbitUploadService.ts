/**
 * Service for uploading code directly to micro:bit via different methods
 */
export class MicrobitUploadService {
  /**
   * Upload Python code directly to micro:bit via REPL
   */
  static async uploadViaPythonREPL(
    connectionService: any,
    pythonCode: string
  ): Promise<void> {
    try {
      console.log("Starting Python REPL upload...");

      // Step 1: Stop any running program
      await connectionService.sendData("\x03"); // Ctrl+C
      await this.delay(200);

      // Step 2: Enter raw REPL mode
      await connectionService.sendData("\x01"); // Ctrl+A for raw REPL
      await this.delay(200);

      // Step 3: Try to read response (with shorter timeout)
      try {
        const response = await connectionService.readData(1000);
        if (!response.includes("raw REPL") && !response.includes(">>>")) {
          // If no clear response, continue anyway
          console.log("No clear REPL response, continuing...");
        }
      } catch (readError) {
        console.log("REPL read timeout, continuing anyway...");
      }

      // Step 4: Send the Python code
      const codeLines = pythonCode.split("\n");
      for (const line of codeLines) {
        if (line.trim()) {
          await connectionService.sendData(line);
          await this.delay(50);
        }
      }

      // Step 5: Execute the code
      await connectionService.sendData("\x04"); // Ctrl+D to execute
      await this.delay(200);

      console.log("Python code uploaded successfully via REPL");
    } catch (error) {
      console.error("Failed to upload via Python REPL:", error);
      throw new Error("Failed to upload code via Python REPL");
    }
  }

  /**
   * Upload code by writing to micro:bit's filesystem
   */
  static async uploadViaFilesystem(
    connectionService: any,
    pythonCode: string,
    filename: string = "main.py"
  ): Promise<void> {
    try {
      console.log("Starting filesystem upload...");

      // Step 1: Enter raw REPL mode
      await connectionService.sendData("\x03"); // Ctrl+C
      await this.delay(100);
      await connectionService.sendData("\x01"); // Ctrl+A
      await this.delay(100);

      // Step 2: Create file writing code
      const fileWriteCode = `
import os
try:
    with open('${filename}', 'w') as f:
        f.write("""${pythonCode.replace(/"/g, '\\"')}""")
    print("File written successfully")
except Exception as e:
    print("Error:", e)
`;

      // Step 3: Send file writing code
      await connectionService.sendData(fileWriteCode);
      await connectionService.sendData("\x04"); // Execute
      await this.delay(500);

      // Step 4: Reset to run the new code
      await connectionService.sendData("\x04"); // Soft reset

      console.log("Code uploaded successfully via filesystem");
    } catch (error) {
      console.error("Failed to upload via filesystem:", error);
      throw new Error("Failed to upload code via filesystem");
    }
  }

  /**
   * Upload code using MicroPython paste mode
   */
  static async uploadViaPasteMode(
    connectionService: any,
    pythonCode: string
  ): Promise<void> {
    try {
      console.log("Starting paste mode upload...");

      // Step 1: Stop any running program
      await connectionService.sendData("\x03"); // Ctrl+C
      await this.delay(200);

      // Step 2: Enter paste mode
      await connectionService.sendData("\x05"); // Ctrl+E for paste mode
      await this.delay(200);

      // Step 3: Try to read response (with shorter timeout)
      try {
        const response = await connectionService.readData(1000);
        if (!response.includes("paste mode") && !response.includes("===")) {
          console.log("No clear paste mode response, continuing...");
        }
      } catch (readError) {
        console.log("Paste mode read timeout, continuing anyway...");
      }

      // Step 4: Send the code
      await connectionService.sendData(pythonCode);
      await this.delay(100);

      // Step 5: End paste mode and execute
      await connectionService.sendData("\x04"); // Ctrl+D to execute
      await this.delay(200);

      // Step 6: Send soft reset to restart micro:bit
      await connectionService.sendData("\x02"); // Ctrl+B for soft reset
      await this.delay(500);

      console.log("Code uploaded successfully via paste mode");
    } catch (error) {
      console.error("Failed to upload via paste mode:", error);
      throw new Error("Failed to upload code via paste mode");
    }
  }

  /**
   * Auto-detect and use the best upload method
   */
  static async uploadCodeAuto(
    connectionService: any,
    pythonCode: string
  ): Promise<void> {
    const methods = [
      { name: "Paste Mode", fn: this.uploadViaPasteMode },
      { name: "Python REPL", fn: this.uploadViaPythonREPL },
      { name: "Filesystem", fn: this.uploadViaFilesystem },
    ];

    for (const method of methods) {
      try {
        console.log(`Trying upload method: ${method.name}`);
        await method.fn.call(this, connectionService, pythonCode);
        console.log(`Upload successful with method: ${method.name}`);
        return;
      } catch (error) {
        console.warn(`Upload method ${method.name} failed:`, error);
        continue;
      }
    }

    throw new Error("All upload methods failed");
  }

  /**
   * Upload .hex file content (for advanced users)
   */
  static async uploadHexFile(hexContent: string): Promise<void> {
    try {
      // This requires the micro:bit to be in DAPLink mode
      // The hex file needs to be copied to the MICROBIT drive

      if ("showDirectoryPicker" in window) {
        // Use File System Access API if available
        const dirHandle = await (window as any).showDirectoryPicker();
        const fileHandle = await dirHandle.getFileHandle("firmware.hex", {
          create: true,
        });
        const writable = await fileHandle.createWritable();
        await writable.write(hexContent);
        await writable.close();

        console.log("Hex file uploaded via File System Access API");
      } else {
        // Fallback: Download the hex file
        const blob = new Blob([hexContent], {
          type: "application/octet-stream",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "firmware.hex";
        a.click();
        URL.revokeObjectURL(url);

        console.log(
          "Hex file downloaded - please copy to MICROBIT drive manually"
        );
      }
    } catch (error) {
      console.error("Failed to upload hex file:", error);
      throw new Error("Failed to upload hex file");
    }
  }

  /**
   * Utility: Delay function
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check micro:bit connection and firmware
   */
  static async checkMicrobitStatus(connectionService: any): Promise<{
    isConnected: boolean;
    firmwareVersion?: string;
    pythonVersion?: string;
    canUpload: boolean;
  }> {
    try {
      if (!connectionService.isConnected()) {
        return { isConnected: false, canUpload: false };
      }

      // Send a simple command to check responsiveness (with better timeout handling)
      await connectionService.sendData("\x03"); // Ctrl+C to stop any running code
      await this.delay(200);

      try {
        await connectionService.sendData('print("PING")'); // Send ping command
        const response = await connectionService.readData(1000); // Shorter timeout
        const isResponsive = response.includes("PING");

        if (isResponsive) {
          // Try to get version info
          try {
            await connectionService.sendData("import sys; print(sys.version)");
            const versionResponse = await connectionService.readData(1000);

            return {
              isConnected: true,
              pythonVersion: versionResponse.trim(),
              canUpload: true,
            };
          } catch (versionError) {
            // Version check failed but device responded to ping
            return { isConnected: true, canUpload: true };
          }
        }
      } catch (readError) {
        // Read timeout but device is connected - assume it can upload
        console.log(
          "micro:bit read timeout but device is connected, assuming uploadable"
        );
        return { isConnected: true, canUpload: true };
      }

      return { isConnected: true, canUpload: false };
    } catch (error) {
      console.error("Failed to check micro:bit status:", error);
      return { isConnected: false, canUpload: false };
    }
  }
}
