/**
 * FieldInputManager - CHỈ cleanup persistent overlays
 * Giải quyết vấn đề UI input bị ghim lên màn hình
 * KHÔNG can thiệp vào normal editing behavior
 */

class FieldInputManager {
  private cleanupCallbacks: (() => void)[] = [];
  private isInitialized = false;

  /**
   * Initialize minimal cleanup only
   */
  public initialize(_workspace: any): void {
    if (this.isInitialized) {
      this.dispose();
    }

    // Chỉ setup cleanup khi navigate away
    const handleVisibilityChange = () => {
      if (document.hidden) {
        this.forceCleanupAll();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    this.cleanupCallbacks.push(() => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    });

    this.isInitialized = true;
    console.log("[FieldInputManager] Initialized (minimal mode)");
  }

  /**
   * Force cleanup all persistent overlays
   * CHỈ cleanup DOM overlays bị stuck, KHÔNG touch active fields
   */
  public forceCleanupAll(): void {
    console.log("[FieldInputManager] Cleaning up persistent overlays");

    this.cleanupFieldOverlays();

    // Additional cleanup sau một chút
    setTimeout(() => {
      this.cleanupFieldOverlays();
    }, 100);
  }

  /**
   * Cleanup field overlays và DOM elements bị persistent
   */
  private cleanupFieldOverlays(): void {
    // Remove các overlay elements bị stuck
    const overlaySelectors = [
      ".blocklyHtmlInput",
      ".blocklyDropdownMenu",
      ".blocklyDropDownDiv",
      ".blocklyFieldTextInput",
      ".blocklyWidgetDiv > *",
    ];

    overlaySelectors.forEach((selector) => {
      const overlays = document.querySelectorAll(selector);
      overlays.forEach((overlay) => {
        // Chỉ remove nếu overlay bị stuck (không có parent workspace)
        const workspaceParent = overlay.closest(".blocklyWorkspace");
        if (
          !workspaceParent &&
          overlay.parentNode &&
          overlay !== document.body
        ) {
          try {
            overlay.parentNode.removeChild(overlay);
            console.log(
              `[FieldInputManager] Removed stuck overlay: ${selector}`
            );
          } catch (error) {
            // Element đã bị remove rồi, bỏ qua
          }
        }
      });
    });

    // Force hide Blockly UI elements
    if ((window as any).Blockly?.DropDownDiv) {
      const DropDownDiv = (window as any).Blockly.DropDownDiv;
      if (DropDownDiv.hideWithoutAnimation) {
        DropDownDiv.hideWithoutAnimation();
      } else if (DropDownDiv.hide) {
        DropDownDiv.hide();
      }
    }

    if ((window as any).Blockly?.WidgetDiv) {
      const WidgetDiv = (window as any).Blockly.WidgetDiv;
      if (WidgetDiv.hide) {
        WidgetDiv.hide();
      }
    }

    // Clear lingering position styles trên elements bị stuck
    const stuckElements = document.querySelectorAll(
      '[style*="position: absolute"], [style*="z-index"]'
    );
    stuckElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      // Chỉ clear style nếu element không thuộc workspace
      const workspaceParent = htmlEl.closest(".blocklyWorkspace");
      if (!workspaceParent && htmlEl.style) {
        if (htmlEl.style.zIndex && parseInt(htmlEl.style.zIndex) > 1000) {
          htmlEl.style.zIndex = "";
        }
        // htmlEl.className có thể là SVGAnimatedString hoặc object khác -> normalize thành string
        const classNameStr =
          typeof htmlEl.className === "string"
            ? htmlEl.className
            : htmlEl.className && (htmlEl.className as any).baseVal
            ? String((htmlEl.className as any).baseVal)
            : "";
        if (
          htmlEl.style.position === "absolute" &&
          !classNameStr.includes("blockly")
        ) {
          htmlEl.style.position = "";
          htmlEl.style.left = "";
          htmlEl.style.top = "";
        }
      }
    });
  }

  /**
   * Get debug info
   */
  public getDebugInfo(): any {
    return {
      isInitialized: this.isInitialized,
      cleanupCallbacksCount: this.cleanupCallbacks.length,
    };
  }

  /**
   * Dispose of all resources
   */
  public dispose(): void {
    console.log("[FieldInputManager] Disposing");

    // Force cleanup
    this.forceCleanupAll();

    // Remove event listeners
    this.cleanupCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.warn("[FieldInputManager] Error in cleanup callback:", error);
      }
    });

    this.cleanupCallbacks = [];
    this.isInitialized = false;
  }
}

// Export singleton instance
export const fieldInputManager = new FieldInputManager();
