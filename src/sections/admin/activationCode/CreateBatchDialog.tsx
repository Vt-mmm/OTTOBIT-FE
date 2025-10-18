import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  CircularProgress,
  Alert,
  Typography,
  Autocomplete,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "store/config";
import { useLocales } from "hooks";
import { getRobotsThunk } from "store/robot/robotThunks";
import { createActivationCodeBatchThunk } from "store/activationCode/activationCodeThunks";
import { clearSuccessFlags } from "store/activationCode/activationCodeSlice";

interface CreateBatchDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateBatchDialog({
  open,
  onClose,
  onSuccess,
}: CreateBatchDialogProps) {
  const dispatch = useAppDispatch();
  const { translate } = useLocales();

  const { robots } = useAppSelector((state) => state.robot);
  const { operations } = useAppSelector((state) => state.activationCode);

  const [selectedRobot, setSelectedRobot] = useState<any>(null);
  const [batchId, setBatchId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(10);
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState<string>("");

  useEffect(() => {
    if (open) {
      // Fetch available robots
      dispatch(getRobotsThunk({ size: 10 }));
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (operations.createSuccess) {
      handleSuccess();
    }
  }, [operations.createSuccess]);

  const handleSuccess = () => {
    dispatch(clearSuccessFlags());
    setSelectedRobot(null);
    setBatchId("");
    setQuantity(10);
    setHasExpiry(false);
    setExpiryDate("");
    onSuccess?.();
    onClose();
  };

  const handleSubmit = () => {
    if (!selectedRobot || quantity < 1 || !batchId.trim()) return;

    dispatch(
      createActivationCodeBatchThunk({
        robotId: selectedRobot.id,
        batchId: batchId.trim(),
        quantity,
        expiresAt: hasExpiry && expiryDate ? expiryDate : undefined,
      })
    );
  };

  const handleCancel = () => {
    setSelectedRobot(null);
    setBatchId("");
    setQuantity(10);
    setHasExpiry(false);
    setExpiryDate("");
    onClose();
  };

  const robotsList = robots.data?.items || [];
  const isLoading = robots.isLoading || operations.isCreating;

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{translate("admin.createBatchTitle")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          {operations.createError && (
            <Alert severity="error">{operations.createError}</Alert>
          )}

          {robots.isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Autocomplete
                options={robotsList}
                getOptionLabel={(option) =>
                  `${option.name} - ${option.model} (${option.brand})`
                }
                value={selectedRobot}
                onChange={(_, newValue) => setSelectedRobot(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={translate("admin.selectRobotRequired")}
                    placeholder={translate("admin.searchRobot")}
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props as any;
                  return (
                    <Box component="li" key={option.id} {...otherProps}>
                      <Box>
                        <Typography variant="body1">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.model} - {option.brand}
                          {option.price != null && (
                            <>
                              {" "}
                              | {translate("common.Price")}:{" "}
                              {option.price.toLocaleString()}đ
                            </>
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  );
                }}
              />

              <TextField
                label={`${translate("admin.batchId")} *`}
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                placeholder={translate("admin.batchIdPlaceholder")}
                helperText={translate("admin.batchIdHelper")}
              />

              <TextField
                label={translate("admin.quantityRequired")}
                type="number"
                value={quantity || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setQuantity(value === "" ? 0 : parseInt(value, 10));
                }}
                onFocus={(e) => {
                  // Auto-select for easy replacement
                  setTimeout(() => e.target.select(), 0);
                }}
                onBlur={(e) => {
                  // Set to 1 if empty or less than 1 on blur
                  const value = parseInt(e.target.value, 10);
                  if (e.target.value === "" || isNaN(value) || value < 1) {
                    setQuantity(1);
                  } else if (value > 10000) {
                    setQuantity(10000);
                  }
                }}
                inputProps={{ min: 1, max: 10000, step: 1 }}
                helperText={translate("admin.quantityHelper")}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={hasExpiry}
                    onChange={(e) => setHasExpiry(e.target.checked)}
                  />
                }
                label={translate("admin.hasExpiry")}
              />

              {hasExpiry && (
                <TextField
                  label={translate("admin.expiresAt")}
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText={translate("admin.expiryDateHelper")}
                  inputProps={{
                    min: new Date().toISOString().split("T")[0],
                  }}
                />
              )}

              {selectedRobot && batchId && (
                <Alert severity="info">
                  <Typography
                    variant="body2"
                    dangerouslySetInnerHTML={{
                      __html:
                        translate("admin.createBatchInfo", {
                          quantity: quantity.toString(),
                          robotName: selectedRobot.name,
                          batchId: batchId,
                        }) +
                        (hasExpiry && expiryDate
                          ? translate("admin.createBatchInfoWithExpiry", {
                              expiryDate: new Date(
                                expiryDate
                              ).toLocaleDateString("vi-VN"),
                            })
                          : ""),
                    }}
                  />
                </Alert>
              )}
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCancel} disabled={isLoading}>
          {translate("admin.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            !selectedRobot || quantity < 1 || !batchId.trim() || isLoading
          }
          startIcon={operations.isCreating && <CircularProgress size={16} />}
        >
          {translate("admin.createQuantityCodes", {
            quantity: quantity.toString(),
          })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
