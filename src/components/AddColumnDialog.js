import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  Typography
} from '@mui/material';
import { COLUMN_TYPES } from '../config/columnTypes';

function AddColumnDialog({ open, onClose, onAdd }) {
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState('text');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!columnName.trim()) {
      setError('Column name is required');
      return;
    }
    
    if (columnName.toLowerCase() === 'serial no.' || columnName.toLowerCase() === 'serialno') {
      setError('This column name is reserved');
      return;
    }

    onAdd(columnName.trim(), columnType);
    handleClose();
  };

  const handleClose = () => {
    setColumnName('');
    setColumnType('text');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Column</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Column Name"
            value={columnName}
            onChange={(e) => {
              setColumnName(e.target.value);
              setError('');
            }}
            error={!!error}
            helperText={error}
            fullWidth
            autoFocus
          />
          
          <FormControl fullWidth>
            <InputLabel>Data Type</InputLabel>
            <Select
              value={columnType}
              onChange={(e) => setColumnType(e.target.value)}
              label="Data Type"
            >
              {Object.entries(COLUMN_TYPES).map(([type, config]) => (
                <MenuItem key={type} value={type}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="caption" color="text.secondary">
            {COLUMN_TYPES[columnType]?.label} columns will store {columnType} data
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Add Column
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddColumnDialog;