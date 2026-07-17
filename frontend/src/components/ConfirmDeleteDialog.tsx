"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography
} from "@mui/material";

type ConfirmDeleteDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDeleteDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  loading = false,
  onClose,
  onConfirm
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
          <DeleteIcon color="error" />
          <Typography component="span" sx={{ fontSize: 20, fontWeight: 760 }}>
            {title}
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {description}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button color="inherit" variant="outlined" disabled={loading} onClick={onClose}>
          Cancel
        </Button>
        <Button color="error" variant="contained" disabled={loading} onClick={onConfirm}>
          {loading ? "Deleting..." : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
