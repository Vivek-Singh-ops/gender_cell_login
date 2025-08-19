import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Chip,
  Divider
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import { exportToCSV, exportToJSON, importFromCSV, importFromJSON, importFromExcel } from '../utils/exportUtils';

function ImportExportDialog({ open, onClose, tableId, tableName, onImportSuccess }) {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleExport = async (format) => {
    try {
      setLoading(true);
      setError('');
      
      switch (format) {
        case 'csv':
          await exportToCSV(tableId, tableName);
          setSuccess('CSV exported successfully!');
          break;
        case 'json':
          await exportToJSON(tableId, tableName);
          setSuccess('JSON exported successfully!');
          break;
        default:
          throw new Error('Unsupported format');
      }
    } catch (err) {
      setError('Export failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileImport = async (file) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const fileExtension = file.name.split('.').pop().toLowerCase();
      let result;
      
      switch (fileExtension) {
        case 'csv':
          result = await importFromCSV(file, tableId);
          break;
        case 'json':
          result = await importFromJSON(file, tableId);
          break;
        case 'xlsx':
        case 'xls':
          result = await importFromExcel(file, tableId);
          break;
        default:
          throw new Error('Unsupported file format. Please use CSV, JSON, or Excel files.');
      }
      
      setSuccess(`Successfully imported ${result.imported} rows!`);
      onImportSuccess(result);
      
    } catch (err) {
      setError('Import failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileImport(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileImport(files[0]);
    }
    e.target.value = ''; // Reset input
  };

  const handleClose = () => {
    setError('');
    setSuccess('');
    setTab(0);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Import & Export Data</DialogTitle>
      
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
            <Tab icon={<DownloadIcon />} label="Export" />
            <Tab icon={<UploadIcon />} label="Import" />
          </Tabs>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Export Tab */}
        {tab === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Export Table Data
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Download your table data in various formats
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<FileIcon />}
                onClick={() => handleExport('csv')}
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                Export CSV
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<FileIcon />}
                onClick={() => handleExport('json')}
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                Export JSON
              </Button>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="body2" color="text.secondary">
              <strong>CSV:</strong> Compatible with Excel, Google Sheets<br/>
              <strong>JSON:</strong> Complete data structure with column types
            </Typography>
          </Box>
        )}

        {/* Import Tab */}
        {tab === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Import Table Data
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload a file to replace current table data
            </Typography>
            
            <Alert severity="warning" sx={{ mb: 3 }}>
              <strong>Warning:</strong> Importing will replace all existing data in this table.
            </Alert>
            
            {/* Drag & Drop Area */}
            <Box
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              sx={{
                border: '2px dashed',
                borderColor: dragOver ? 'primary.main' : 'grey.300',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                bgcolor: dragOver ? 'action.hover' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                mb: 3
              }}
              onClick={() => document.getElementById('file-input').click()}
            >
              <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Drop files here or click to browse
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supports CSV, JSON, and Excel files
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2 }}>
                <Chip label="CSV" size="small" variant="outlined" />
                <Chip label="JSON" size="small" variant="outlined" />
                <Chip label="Excel" size="small" variant="outlined" />
              </Box>
            </Box>
            
            <input
              id="file-input"
              type="file"
              accept=".csv,.json,.xlsx,.xls"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="body2" color="text.secondary">
              <strong>Supported formats:</strong><br/>
              • CSV files with headers<br/>
              • JSON files with columns and rows structure<br/>
              • Excel files (.xlsx, .xls)<br/>
              • Column types will be auto-detected
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ImportExportDialog;