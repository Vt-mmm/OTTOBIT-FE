/**
 * @license
 * Copyright 2024 Ottobot
 * SPDX-License-Identifier: Apache-2.0
 */

import { Alert, Snackbar } from "@mui/material";
import { useState } from "react";

export function useNotification() {
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
      autoHideDuration={4000}
      onClose={hideNotification}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
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
