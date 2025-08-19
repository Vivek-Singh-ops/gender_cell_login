import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Fab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Skeleton,
  Chip,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  TableChart as TableChartIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

function MemberDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createDialog, setCreateDialog] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, tableId: null });

  const loadTables = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const q = query(
        collection(db, 'userTables'),
        where('userId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const tablesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTables(tablesData);
    } catch (err) {
      setError('Failed to load tables: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const handleCreateTable = async () => {
    if (!newTableName.trim()) return;
    
    try {
      const newTable = {
        name: newTableName.trim(),
        userId: currentUser.uid,
        userEmail: currentUser.email,
        createdAt: new Date(),
        updatedAt: new Date(),
        rowCount: 0,
        columnCount: 1
      };
      
      const docRef = await addDoc(collection(db, 'userTables'), newTable);
      setTables(prev => [...prev, { id: docRef.id, ...newTable }]);
      setCreateDialog(false);
      setNewTableName('');
    } catch (err) {
      setError('Failed to create table: ' + err.message);
    }
  };

  const handleDeleteTable = async () => {
    try {
      await deleteDoc(doc(db, 'userTables', deleteConfirm.tableId));
      await deleteDoc(doc(db, 'tableData', deleteConfirm.tableId));
      setTables(prev => prev.filter(table => table.id !== deleteConfirm.tableId));
      setDeleteConfirm({ open: false, tableId: null });
    } catch (err) {
      setError('Failed to delete table: ' + err.message);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString();
  };

  if (!currentUser) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Please log in to access your dashboard.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {currentUser?.email?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4">
              My Tables
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {currentUser?.name || currentUser?.email}
            </Typography>
          </Box>
        </Box>
        <Chip label={currentUser?.role || 'Member'} color="primary" variant="outlined" />
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => setError('')}>
              Dismiss
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="80%" height={32} />
                  <Box sx={{ display: 'flex', gap: 1, my: 2 }}>
                    <Skeleton variant="rectangular" width={60} height={24} />
                    <Skeleton variant="rectangular" width={80} height={24} />
                  </Box>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="70%" />
                </CardContent>
                <CardActions>
                  <Skeleton variant="rectangular" width={80} height={32} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {!loading && tables.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <TableChartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No tables yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create your first dynamic table to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialog(true)}
            size="large"
          >
            Create Table
          </Button>
        </Box>
      )}

      {/* Tables Grid */}
      {!loading && tables.length > 0 && (
        <Grid container spacing={3}>
          {tables.map((table) => (
            <Grid item xs={12} sm={6} md={4} key={table.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <TableChartIcon color="primary" />
                    <Typography variant="h6" component="h2" noWrap>
                      {table.name}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      label={`${table.rowCount || 0} rows`} 
                      size="small" 
                      variant="outlined" 
                    />
                    <Chip 
                      label={`${table.columnCount || 1} columns`} 
                      size="small" 
                      variant="outlined" 
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    Created: {formatDate(table.createdAt)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Updated: {formatDate(table.updatedAt)}
                  </Typography>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button
                    startIcon={<ViewIcon />}
                    onClick={() => navigate(`/table/${table.id}`)}
                    variant="contained"
                    size="small"
                  >
                    Open
                  </Button>
                  <IconButton
                    onClick={() => setDeleteConfirm({ open: true, tableId: table.id })}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Action Button */}
      {!loading && tables.length > 0 && (
        <Fab
          color="primary"
          aria-label="add table"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setCreateDialog(true)}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Create Table Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Table</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Table Name"
            fullWidth
            variant="outlined"
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateTable();
              }
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCreateDialog(false);
            setNewTableName('');
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateTable} 
            variant="contained"
            disabled={!newTableName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, tableId: null })}>
        <DialogTitle>Delete Table</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this table? All data will be permanently lost and cannot be recovered.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, tableId: null })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteTable} color="error" variant="contained">
            Delete Forever
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MemberDashboard;