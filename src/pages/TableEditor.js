import React, { useEffect, useState } from 'react';
import ImportExportDialog from '../components/ImportExportDialog';
import { ImportExport as ImportExportIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTableData } from '../hooks/useTableData';
import CellRenderer from '../components/CellRenderer';
import AddColumnDialog from '../components/AddColumnDialog';
import { COLUMN_TYPES } from '../config/columnTypes';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Alert,
  Skeleton,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  TableChart as TableChartIcon
} from '@mui/icons-material';

function TableEditor() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [showAddColumnDialog, setShowAddColumnDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: null, id: null });
  const [showImportExportDialog, setShowImportExportDialog] = useState(false);

  const {
    tableData,
    loading,
    error,
    clearError,
    loadTableData,
    addColumn,
    deleteColumn,
    addRow,
    deleteRow,
    updateCell
  } = useTableData(itemId);

  useEffect(() => {
    loadTableData();
  }, [loadTableData]);

  const handleImportSuccess = (result) => {
    // The import functions already update Firebase directly
    // Just reload the table data to reflect the changes
    loadTableData();
  };

  const handleAddColumn = async (columnName, columnType) => {
    try {
      await addColumn(columnName, columnType);
    } catch (err) {
      console.error('Failed to add column:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteConfirm.type === 'column') {
        await deleteColumn(deleteConfirm.id);
      } else if (deleteConfirm.type === 'row') {
        await deleteRow(deleteConfirm.id);
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeleteConfirm({ open: false, type: null, id: null });
    }
  };

  const LoadingSkeleton = () => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            {[1, 2, 3, 4].map((col) => (
              <TableCell key={col}>
                <Skeleton variant="text" width={100} />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {[1, 2, 3].map((row) => (
            <TableRow key={row}>
              {[1, 2, 3, 4].map((col) => (
                <TableCell key={col}>
                  <Skeleton variant="text" width={120} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (!currentUser) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Please log in to access the table editor.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <TableChartIcon color="primary" />
        <Typography variant="h4">
          Table Editor
        </Typography>
        <Chip label={`ID: ${itemId}`} variant="outlined" />
      </Box>

      {/* Error State */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={clearError}>
              Dismiss
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddColumnDialog(true)}
          disabled={loading}
        >
          Add Column
        </Button>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addRow}
          disabled={loading}
        >
          Add Row
        </Button>
        <Button
          variant="outlined"
          startIcon={<ImportExportIcon />}
          onClick={() => setShowImportExportDialog(true)}
          disabled={loading}
        >
          Import/Export
        </Button>
      </Box>

      {/* Loading State */}
      {loading && <LoadingSkeleton />}

      {/* Table */}
      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {tableData.columns.map((column) => (
                  <TableCell key={column.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{COLUMN_TYPES[column.type]?.icon}</span>
                      <Typography variant="subtitle2">
                        {column.name}
                      </Typography>
                      <Chip
                        label={column.type}
                        size="small"
                        variant="outlined"
                      />
                      {column.editable && (
                        <Tooltip title="Delete Column">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteConfirm({
                              open: true,
                              type: 'column',
                              id: column.id
                            })}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                ))}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={tableData.columns.length + 1}>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No data yet. Click "Add Row" to get started.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                tableData.rows.map((row) => (
                  <TableRow key={row.id}>
                    {tableData.columns.map((column) => (
                      <TableCell key={column.id}>
                        <CellRenderer
                          value={row[column.id]}
                          column={column}
                          onUpdate={(newValue) => updateCell(row.id, column.id, newValue)}
                          disabled={loading}
                        />
                      </TableCell>
                    ))}
                    <TableCell>
                      <Tooltip title="Delete Row">
                        <IconButton
                          size="small"
                          onClick={() => setDeleteConfirm({
                            open: true,
                            type: 'row',
                            id: row.id
                          })}
                          disabled={loading}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Column Dialog */}
      <AddColumnDialog
        open={showAddColumnDialog}
        onClose={() => setShowAddColumnDialog(false)}
        onAdd={handleAddColumn}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, type: null, id: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {deleteConfirm.type}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, type: null, id: null })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <ImportExportDialog
        open={showImportExportDialog}
        onClose={() => setShowImportExportDialog(false)}
        tableId={itemId}
        tableName={`Table-${itemId}`}
        onImportSuccess={handleImportSuccess}
      />
    </Box>
  );
}

export default TableEditor;