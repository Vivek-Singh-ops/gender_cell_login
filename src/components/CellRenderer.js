import React, { useState } from 'react';
import { 
  TextField, 
  Checkbox, 
  Link, 
  Avatar,
  Box,
  Typography
} from '@mui/material';
import { Photo as PhotoIcon, Link as LinkIcon, AttachFile as AttachFileIcon } from '@mui/icons-material';
import { COLUMN_TYPES } from '../config/columnTypes';

function CellRenderer({ value, column, onUpdate, disabled = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    if (COLUMN_TYPES[column.type].validation(editValue)) {
      onUpdate(editValue);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Serial number column (read-only)
  if (column.id === 'serialNo') {
    return <Typography variant="body2">{value}</Typography>;
  }

  // Edit mode
  if (isEditing && !disabled) {
    switch (column.type) {
      case 'boolean':
        return (
          <Checkbox
            checked={editValue}
            onChange={(e) => {
              setEditValue(e.target.checked);
              onUpdate(e.target.checked);
              setIsEditing(false);
            }}
          />
        );
      case 'date':
        return (
          <TextField
            type="date"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyPress}
            size="small"
            autoFocus
          />
        );
      case 'number':
        return (
          <TextField
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(Number(e.target.value))}
            onBlur={handleSave}
            onKeyDown={handleKeyPress}
            size="small"
            autoFocus
          />
        );
      default:
        return (
          <TextField
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyPress}
            size="small"
            autoFocus
            multiline={column.type === 'text' && editValue.length > 50}
          />
        );
    }
  }

  // Display mode
  const handleClick = () => {
    if (!disabled && column.editable) {
      setIsEditing(true);
    }
  };

  switch (column.type) {
    case 'boolean':
      return (
        <Checkbox
          checked={value}
          onChange={(e) => onUpdate(e.target.checked)}
          disabled={disabled}
        />
      );
    case 'image':
      return value ? (
        <Avatar src={value} variant="rounded" sx={{ width: 40, height: 40 }}>
          <PhotoIcon />
        </Avatar>
      ) : (
        <Box onClick={handleClick} sx={{ cursor: disabled ? 'default' : 'pointer' }}>
          <PhotoIcon color="disabled" />
        </Box>
      );
    case 'link':
      return value ? (
        <Link href={value} target="_blank" rel="noopener">
          <LinkIcon />
        </Link>
      ) : (
        <Box onClick={handleClick} sx={{ cursor: disabled ? 'default' : 'pointer' }}>
          <LinkIcon color="disabled" />
        </Box>
      );
    case 'file':
      return value ? (
        <Link href={value} target="_blank">
          <AttachFileIcon />
        </Link>
      ) : (
        <Box onClick={handleClick} sx={{ cursor: disabled ? 'default' : 'pointer' }}>
          <AttachFileIcon color="disabled" />
        </Box>
      );
    case 'email':
      return value ? (
        <Link href={`mailto:${value}`}>{value}</Link>
      ) : (
        <Typography 
          onClick={handleClick} 
          sx={{ cursor: disabled ? 'default' : 'pointer' }}
          color="text.secondary"
        >
          Click to add
        </Typography>
      );
    default:
      return (
        <Typography 
          onClick={handleClick}
          sx={{ 
            cursor: disabled ? 'default' : 'pointer',
            minHeight: '20px',
            '&:hover': !disabled ? { bgcolor: 'action.hover' } : {}
          }}
        >
          {value || 'Click to add'}
        </Typography>
      );
  }
}

export default CellRenderer;