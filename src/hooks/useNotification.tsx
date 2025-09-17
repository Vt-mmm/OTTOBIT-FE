/**
 * @license
 * Copyright 2024 ottobit
 * SPDX-License-Identifier: Apache-2.0
 */

import { Alert, Snackbar } from "@mui/material";
import { useState } from "react";

type AnchorVertical = "top" | "bottom";
type AnchorHorizontal = "left" | "center" | "right";

interface UseNotificationConfig {
  anchorOrigin?: { vertical: AnchorVertical; horizontal: AnchorHorizontal };
  autoHideDurationMs?: number;
}

export function useNotification(config?: UseNotificationConfig) {
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  const showNotification = (
    message: string,
    severity: "success" | "error" | "warning" | "info" = "info"
  ) => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const hideNotification = () => {
    setNotification((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const NotificationComponent = () => (
    <Snackbar
      open={notification.open}
      autoHideDuration={config?.autoHideDurationMs ?? 4000}
      onClose={hideNotification}
      anchorOrigin={
        config?.anchorOrigin ?? { vertical: "bottom", horizontal: "right" }
      }
    >
      <Alert
        onClose={hideNotification}
        severity={notification.severity}
        sx={{ width: "100%" }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );

  return {
    showNotification,
    hideNotification,
    NotificationComponent,
  };
}
