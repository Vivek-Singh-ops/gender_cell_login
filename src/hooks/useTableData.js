import { useState, useCallback } from 'react';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useErrorHandler } from './useErrorHandler';
import { COLUMN_TYPES } from '../config/columnTypes';

export function useTableData(itemId) {
  const [tableData, setTableData] = useState({
    columns: [
      { id: 'serialNo', name: 'Serial No.', type: 'number', editable: false }
    ],
    rows: []
  });
  const { error, loading, executeAsync, clearError } = useErrorHandler();

  const loadTableData = useCallback(async () => {
    await executeAsync(async () => {
      const docRef = doc(db, 'tableData', itemId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTableData({
          columns: data.columns || [
            { id: 'serialNo', name: 'Serial No.', type: 'number', editable: false }
          ],
          rows: data.rows || []
        });
      } else {
        // Initialize with default structure
        const defaultData = {
          columns: [
            { id: 'serialNo', name: 'Serial No.', type: 'number', editable: false }
          ],
          rows: []
        };
        await setDoc(docRef, defaultData);
        setTableData(defaultData);
      }
    });
  }, [itemId, executeAsync]);

  const saveTableData = useCallback(async (newData) => {
    await executeAsync(async () => {
      const docRef = doc(db, 'tableData', itemId);
      await updateDoc(docRef, newData);
      setTableData(newData);
    });
  }, [itemId, executeAsync]);

  const addColumn = useCallback(async (columnName, columnType) => {
    const newColumn = {
      id: `col_${Date.now()}`,
      name: columnName,
      type: columnType,
      editable: true
    };

    const updatedData = {
      ...tableData,
      columns: [...tableData.columns, newColumn],
      rows: tableData.rows.map(row => ({
        ...row,
        [newColumn.id]: COLUMN_TYPES[columnType].defaultValue
      }))
    };

    await saveTableData(updatedData);
  }, [tableData, saveTableData]);

  const deleteColumn = useCallback(async (columnId) => {
    if (columnId === 'serialNo') return; // Prevent deleting serial number

    const updatedData = {
      ...tableData,
      columns: tableData.columns.filter(col => col.id !== columnId),
      rows: tableData.rows.map(row => {
        const { [columnId]: deleted, ...rest } = row;
        return rest;
      })
    };

    await saveTableData(updatedData);
  }, [tableData, saveTableData]);

  const addRow = useCallback(async () => {
    const newRow = {
      id: `row_${Date.now()}`,
      serialNo: tableData.rows.length + 1
    };

    // Initialize with default values for each column
    tableData.columns.forEach(col => {
      if (col.id !== 'serialNo') {
        newRow[col.id] = COLUMN_TYPES[col.type].defaultValue;
      }
    });

    const updatedData = {
      ...tableData,
      rows: [...tableData.rows, newRow]
    };

    await saveTableData(updatedData);
  }, [tableData, saveTableData]);

  const deleteRow = useCallback(async (rowId) => {
    const updatedRows = tableData.rows
      .filter(row => row.id !== rowId)
      .map((row, index) => ({ ...row, serialNo: index + 1 })); // Re-number serial numbers

    const updatedData = {
      ...tableData,
      rows: updatedRows
    };

    await saveTableData(updatedData);
  }, [tableData, saveTableData]);

  const updateCell = useCallback(async (rowId, columnId, value) => {
    const updatedData = {
      ...tableData,
      rows: tableData.rows.map(row => 
        row.id === rowId ? { ...row, [columnId]: value } : row
      )
    };

    await saveTableData(updatedData);
  }, [tableData, saveTableData]);

  return {
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
  };
}