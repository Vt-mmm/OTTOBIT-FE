import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Checkbox,
  Chip,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_TAG } from "constants/routesApiKeys";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";

interface TagItem {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  selectedIds: string[];
  onClose: () => void;
  onSave: (ids: string[]) => void;
}

export default function TagPickerDialog({
  open,
  selectedIds,
  onClose,
  onSave,
}: Props) {
  const [items, setItems] = useState<TagItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [workingSelection, setWorkingSelection] = useState<string[]>(
    selectedIds || []
  );
  const [newTagName, setNewTagName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (open) setWorkingSelection(selectedIds || []);
  }, [open, selectedIds]);

  const fetchTags = async () => {
    try {
      const url =
        `${ROUTES_API_TAG.GET_ALL}?PageNumber=${pageNumber}&PageSize=${pageSize}` +
        (searchTerm.trim()
          ? `&SearchTerm=${encodeURIComponent(searchTerm.trim())}`
          : "");
      const res = await axiosClient.get(url);
      const data = res?.data?.data;
      setItems(data?.items || []);
      setTotalPages(data?.totalPages || 1);
      // setTotal(data?.total || 0);
    } catch {}
  };

  useEffect(() => {
    if (open) fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pageNumber, pageSize]);

  const toggleSelect = (id: string) => {
    setWorkingSelection((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    onSave(workingSelection);
  };

  const handleCreateTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    setIsCreating(true);
    try {
      await axiosClient.post(ROUTES_API_TAG.CREATE, { name });
      setNewTagName("");
      setPageNumber(1);
      await fetchTags();
    } catch {}
    setIsCreating(false);
  };

  const handleDeleteTag = async (id: string) => {
    try {
      await axiosClient.delete(ROUTES_API_TAG.DELETE(id));
      await fetchTags();
      setWorkingSelection((prev) => prev.filter((x) => x !== id));
    } catch {}
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Chọn tag</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              fullWidth
              placeholder="Tìm theo tên tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (setPageNumber(1), fetchTags())
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setPageNumber(1);
                        fetchTags();
                      }}
                    >
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {/* Removed manual reload button as requested */}
            <TextField
              size="small"
              placeholder="Tên tag mới"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
              sx={{ minWidth: 200 }}
            />
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              disabled={isCreating || !newTagName.trim()}
              onClick={handleCreateTag}
            >
              Thêm tag
            </Button>
          </Stack>

          <Paper variant="outlined">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width={56}></TableCell>
                    <TableCell>Tên tag</TableCell>
                    <TableCell align="right" width={80}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((t) => (
                    <TableRow key={t.id} hover>
                      <TableCell
                        onClick={() => toggleSelect(t.id)}
                        sx={{ cursor: "pointer" }}
                      >
                        <Checkbox checked={workingSelection.includes(t.id)} />
                      </TableCell>
                      <TableCell
                        onClick={() => toggleSelect(t.id)}
                        sx={{ cursor: "pointer" }}
                      >
                        {t.name}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteTag(t.id)}
                          aria-label="delete tag"
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ p: 2 }}
            >
              <Chip
                label={`Đã chọn: ${workingSelection.length}`}
                size="small"
              />
              <Pagination
                page={pageNumber}
                count={totalPages}
                onChange={(_, v) => setPageNumber(v)}
              />
            </Stack>
          </Paper>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={handleSave}>
          Xong
        </Button>
      </DialogActions>
    </Dialog>
  );
}
