import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { COLUMN_TYPES } from '../config/columnTypes';

// Export as CSV
export const exportToCSV = async (tableId, tableName) => {
  try {
    const docRef = doc(db, 'tableData', tableId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Table data not found');
    }
    
    const data = docSnap.data();
    const { columns, rows } = data;
    
    // Create CSV headers
    const headers = columns.map(col => col.name).join(',');
    
    // Create CSV rows
    const csvRows = rows.map(row => 
      columns.map(col => {
        const value = row[col.id] || '';
        // Escape quotes and wrap in quotes if contains comma
        return typeof value === 'string' && (value.includes(',') || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(',')
    );
    
    const csvContent = [headers, ...csvRows].join('\n');
    
    // Download CSV
    downloadFile(csvContent, `${tableName || 'table'}.csv`, 'text/csv');
    
    return csvContent;
  } catch (error) {
    console.error('Export to CSV failed:', error);
    throw error;
  }
};

// Export as JSON
export const exportToJSON = async (tableId, tableName) => {
  try {
    const docRef = doc(db, 'tableData', tableId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Table data not found');
    }
    
    const data = docSnap.data();
    const exportData = {
      tableName,
      exportDate: new Date().toISOString(),
      columns: data.columns,
      rows: data.rows,
      metadata: {
        totalRows: data.rows.length,
        totalColumns: data.columns.length
      }
    };
    
    const jsonContent = JSON.stringify(exportData, null, 2);
    downloadFile(jsonContent, `${tableName || 'table'}.json`, 'application/json');
    
    return exportData;
  } catch (error) {
    console.error('Export to JSON failed:', error);
    throw error;
  }
};

// Import from CSV
export const importFromCSV = async (file, tableId) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const csvContent = e.target.result;
        const lines = csvContent.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
          throw new Error('CSV file is empty');
        }
        
        // Parse headers
        const headers = parseCSVLine(lines[0]);
        
        // Parse data rows
        const dataRows = lines.slice(1).map(line => parseCSVLine(line));
        
        // Create columns based on headers (excluding serial number)
        const columns = [
          { id: 'serialNo', name: 'Serial No.', type: 'number', editable: false }
        ];
        
        headers.forEach((header, index) => {
          if (header.toLowerCase() !== 'serial no.' && header.toLowerCase() !== 'serialno') {
            columns.push({
              id: `col_${Date.now()}_${index}`,
              name: header,
              type: detectColumnType(dataRows, index),
              editable: true
            });
          }
        });
        
        // Create rows with proper column mapping
        const rows = dataRows.map((rowData, rowIndex) => {
          const row = {
            id: `row_${Date.now()}_${rowIndex}`,
            serialNo: rowIndex + 1
          };
          
          headers.forEach((header, colIndex) => {
            if (header.toLowerCase() !== 'serial no.' && header.toLowerCase() !== 'serialno') {
              const column = columns.find(col => col.name === header);
              if (column) {
                row[column.id] = convertValue(rowData[colIndex], column.type);
              }
            }
          });
          
          return row;
        });
        
        // Update Firebase
        const docRef = doc(db, 'tableData', tableId);
        await updateDoc(docRef, { columns, rows });
        
        resolve({ columns, rows, imported: rows.length });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Import from JSON
export const importFromJSON = async (file, tableId) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const jsonContent = JSON.parse(e.target.result);
        
        // Validate JSON structure
        if (!jsonContent.columns || !jsonContent.rows) {
          throw new Error('Invalid JSON format. Expected columns and rows properties.');
        }
        
        // Ensure serial number column exists
        let columns = jsonContent.columns;
        if (!columns.find(col => col.id === 'serialNo')) {
          columns = [
            { id: 'serialNo', name: 'Serial No.', type: 'number', editable: false },
            ...columns
          ];
        }
        
        // Update serial numbers
        const rows = jsonContent.rows.map((row, index) => ({
          ...row,
          id: row.id || `row_${Date.now()}_${index}`,
          serialNo: index + 1
        }));
        
        // Update Firebase
        const docRef = doc(db, 'tableData', tableId);
        await updateDoc(docRef, { columns, rows });
        
        resolve({ columns, rows, imported: rows.length });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Import from Excel - Disabled (xlsx library not installed)
export const importFromExcel = async (file, tableId) => {
  throw new Error('Excel import is not available. Please install the xlsx library or use CSV/JSON import instead.');
};

// Helper functions
const downloadFile = (content, filename, type) => {
  const blob = new Blob([content], { type });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

const detectColumnType = (rows, colIndex) => {
  const sampleValues = rows.slice(0, 10).map(row => row[colIndex]).filter(val => val !== undefined && val !== '');
  
  if (sampleValues.length === 0) return 'text';
  
  // Check if all values are numbers
  if (sampleValues.every(val => !isNaN(val) && val !== '')) {
    return 'number';
  }
  
  // Check if all values are booleans
  if (sampleValues.every(val => val === 'true' || val === 'false' || val === true || val === false)) {
    return 'boolean';
  }
  
  // Check if all values are dates
  if (sampleValues.every(val => !isNaN(Date.parse(val)))) {
    return 'date';
  }
  
  // Check if values look like URLs
  if (sampleValues.every(val => typeof val === 'string' && (val.startsWith('http') || val.startsWith('www')))) {
    return 'link';
  }
  
  // Check if values look like emails
  if (sampleValues.every(val => typeof val === 'string' && val.includes('@'))) {
    return 'email';
  }
  
  return 'text';
};

const convertValue = (value, type) => {
  if (value === undefined || value === null || value === '') {
    return COLUMN_TYPES[type]?.defaultValue || '';
  }
  
  switch (type) {
    case 'number':
      return Number(value) || 0;
    case 'boolean':
      return value === 'true' || value === true;
    case 'date':
      const date = new Date(value);
      return isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0];
    default:
      return String(value);
  }
};