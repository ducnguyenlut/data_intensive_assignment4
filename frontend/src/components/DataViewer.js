import React, { useState, useEffect, useCallback } from 'react';
import { getEntities, joinEntities, updateEntity, deleteEntity, createEntity } from '../services/api';

const ENTITY_TYPES = [
  { value: 'teachers', label: 'Teachers' },
  { value: 'classes', label: 'Classes' },
  { value: 'students', label: 'Students' },
  { value: 'subjects', label: 'Subjects' },
  { value: 'enrollments', label: 'Enrollments' },
  { value: 'librarybooks', label: 'Library Books' },
  { value: 'events', label: 'Events' },
];

const SIMILAR_ENTITIES = ['teachers', 'classes', 'students'];

function DataViewer({ refreshKey = 0 }) {
  const [selectedEntity, setSelectedEntity] = useState('teachers');
  const [viewMode, setViewMode] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [message, setMessage] = useState(null);
  const [referenceOptions, setReferenceOptions] = useState({
    teacher_id: [],
    class_id: [],
    student_id: [],
    subject_id: [],
  });
  const [newRows, setNewRows] = useState({});

  useEffect(() => {
    fetchData();
  }, [selectedEntity, viewMode, refreshKey]);

  useEffect(() => {
    setNewRows({});
    setEditingItem(null);
    setEditFormData({});
  }, [selectedEntity, viewMode]);

  const loadReferenceOptions = useCallback(async () => {
    try {
      const [teachersRes, classesRes, studentsRes, subjectsRes] = await Promise.all([
        getEntities('teachers', 'postgres'),
        getEntities('classes', 'postgres'),
        getEntities('students', 'postgres'),
        getEntities('subjects', 'postgres'),
      ]);

      const normalize = (res, key) => (res?.data || res?.postgres || res?.[key] || []);

      const teachers = normalize(teachersRes, 'teachers');
      const classes = normalize(classesRes, 'classes');
      const students = normalize(studentsRes, 'students');
      const subjects = normalize(subjectsRes, 'subjects');

      setReferenceOptions({
        teacher_id: teachers.map(teacher => ({
          value: teacher.teacher_id,
          label: `${teacher.first_name} ${teacher.last_name}`,
        })),
        class_id: classes.map(cls => ({
          value: cls.class_id,
          label: cls.class_name,
        })),
        student_id: students.map(student => ({
          value: student.student_id,
          label: `${student.first_name} ${student.last_name}`,
        })),
        subject_id: subjects.map(subject => ({
          value: subject.subject_id,
          label: subject.subject_name,
        })),
      });
    } catch (err) {
      console.error('Failed to load reference options', err);
    }
  }, []);

  useEffect(() => {
    loadReferenceOptions();
  }, [loadReferenceOptions, refreshKey]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (viewMode === 'combined' && SIMILAR_ENTITIES.includes(selectedEntity)) {
        const result = await joinEntities(selectedEntity);
        setData({ combined: result.data });
      } else {
        const result = await getEntities(selectedEntity, viewMode);
        setData(result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    
    const { _id, source, teacher_name, student_name, subject_name, ...itemData } = item;
    
    setEditFormData(itemData);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditFormData({});
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    setLoading(true);
    setMessage(null);
    try {
      const idField = getIdField(selectedEntity);
      const id = editingItem[idField] || editingItem._id;
      
      
      const { [idField]: _, _id, source, teacher_name, student_name, subject_name, ...updateData } = editFormData;
      
      await updateEntity(selectedEntity, id, updateData);
      setMessage({ type: 'success', text: `${selectedEntity} updated successfully!` });
      setEditingItem(null);
      setEditFormData({});
      await fetchData();
      await loadReferenceOptions();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    const idField = getIdField(selectedEntity);
    const id = item[idField] || item._id;
    
    
    if (['teachers', 'classes', 'subjects'].includes(selectedEntity)) {
      const confirmMessage = `Are you sure you want to delete this ${selectedEntity}?`;
      const action = window.confirm(confirmMessage + '\n\nIf this record has dependent records, you can:\n- Cancel and delete them manually\n- Click OK to set references to NULL');
      
      if (!action) {
        return;
      }
      
      setLoading(true);
      setMessage(null);
      try {
        
        await deleteEntity(selectedEntity, id);
        setMessage({ type: 'success', text: `${selectedEntity} deleted successfully!` });
        await fetchData();
        await loadReferenceOptions();
      } catch (err) {
        
        if (err.message.includes('assigned to') || err.message.includes('has')) {
          const cascade = window.confirm(
            err.message + '\n\nWould you like to:\n- Click OK: Set dependent records to NULL and delete\n- Click Cancel: Cancel deletion'
          );
          
          if (cascade) {
            try {
              
              await deleteEntity(selectedEntity, id, { reassignTo: null });
              setMessage({ type: 'success', text: `${selectedEntity} deleted successfully! Dependent records were updated.` });
              await fetchData();
              await loadReferenceOptions();
            } catch (err2) {
              setMessage({ type: 'error', text: err2.message });
            }
          }
        } else {
          setMessage({ type: 'error', text: err.message });
        }
      } finally {
        setLoading(false);
      }
    } else {
      if (!window.confirm(`Are you sure you want to delete this ${selectedEntity}?`)) {
        return;
      }

      setLoading(true);
      setMessage(null);
      try {
        await deleteEntity(selectedEntity, id);
        setMessage({ type: 'success', text: `${selectedEntity} deleted successfully!` });
        await fetchData();
        await loadReferenceOptions();
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setEditFormData({
      ...editFormData,
      [field]: value
    });
  };

  const handleAddNewRow = (tableKey) => {
    setNewRows(prev => ({
      ...prev,
      [tableKey]: {
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        hire_date: ''
      }
    }));
  };

  const handleNewRowChange = (tableKey, field, value) => {
    setNewRows(prev => ({
      ...prev,
      [tableKey]: {
        ...(prev[tableKey] || {}),
        [field]: value,
      }
    }));
  };

  const handleCancelNewRow = (tableKey) => {
    setNewRows(prev => {
      const updated = { ...prev };
      delete updated[tableKey];
      return updated;
    });
  };

  const handleCreateNewRow = async (tableKey) => {
    const newRow = newRows[tableKey];
    if (!newRow) return;

    if (!newRow.first_name || !newRow.last_name || !newRow.hire_date) {
      setMessage({ type: 'error', text: 'Please fill in required fields (first name, last name, hire date).' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
    const normalizeOptional = (value) => {
      if (value === undefined || value === null) return null;
      const trimmed = String(value).trim();
      return trimmed === '' ? null : trimmed;
    };

    const postgresPayload = {
      first_name: newRow.first_name,
      last_name: newRow.last_name,
      email: normalizeOptional(newRow.email),
      phone_number: normalizeOptional(newRow.phone_number),
      hire_date: newRow.hire_date,
    };

      const pgResult = await createEntity('teachers', postgresPayload);
      const newTeacherId = pgResult?.data?.teacher_id;

      if (!newTeacherId) {
        throw new Error('Failed to retrieve new teacher ID from PostgreSQL response.');
      }

    const mongoPayload = {
      __db: 'mongo',
      teacher_id: newTeacherId,
      first_name: newRow.first_name,
      last_name: newRow.last_name,
      email: normalizeOptional(newRow.email),
      phone_number: normalizeOptional(newRow.phone_number),
      hire_date: newRow.hire_date
    };

      await createEntity('teachers', mongoPayload);

      setMessage({ type: 'success', text: 'Teacher created successfully in both databases!' });
      handleCancelNewRow(tableKey);
      await fetchData();
      await loadReferenceOptions();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const getIdField = (entityType) => {
    const idFields = {
      teachers: 'teacher_id',
      classes: 'class_id',
      students: 'student_id',
      subjects: 'subject_id',
      enrollments: 'enrollment_id',
      librarybooks: 'book_id',
      events: 'event_id',
    };
    return idFields[entityType] || 'id';
  };

  const formatDisplayValue = (column, value) => {
    if (value === null || value === undefined) {
      return '-';
    }

    // Format date columns
    if (typeof column === 'string' && column.toLowerCase().includes('date')) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
      }
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  };

  const renderTable = (items, source, tableKey, { allowActions = true, allowCreate = false } = {}) => {
    if (!items || items.length === 0) {
      return <div className="empty-state">No data available</div>;
    }

    let allColumns = Object.keys(items[0]).filter(key => key !== '_id' && key !== 'source');
    const idField = getIdField(selectedEntity);
    let columns = [...allColumns];
    
    
    if (selectedEntity === 'subjects') {
      
      columns = allColumns.filter(col => col !== 'teacher_id');
      
      const orderedCols = [];
      if (columns.includes('subject_id')) orderedCols.push('subject_id');
      if (columns.includes('subject_name')) orderedCols.push('subject_name');
      if (columns.includes('teacher_name')) orderedCols.push('teacher_name');
      if (columns.includes('credits')) orderedCols.push('credits');
      
      columns.forEach(col => {
        if (!orderedCols.includes(col)) orderedCols.push(col);
      });
      columns = orderedCols;
    }
    
    
    if (selectedEntity === 'classes') {
      columns = allColumns.filter(col => col !== 'teacher_id');
      
      const orderedCols = [];
      if (columns.includes('class_id')) orderedCols.push('class_id');
      if (columns.includes('class_name')) orderedCols.push('class_name');
      if (columns.includes('teacher_name')) orderedCols.push('teacher_name');
      if (columns.includes('room_number')) orderedCols.push('room_number');
      columns.forEach(col => {
        if (!orderedCols.includes(col)) orderedCols.push(col);
      });
      columns = orderedCols;
    }
    
    
    if (selectedEntity === 'enrollments') {
      columns = allColumns.filter(col => col !== 'student_id' && col !== 'subject_id');
      
      const orderedCols = [];
      if (columns.includes('enrollment_id')) orderedCols.push('enrollment_id');
      if (columns.includes('student_name')) orderedCols.push('student_name');
      if (columns.includes('subject_name')) orderedCols.push('subject_name');
      if (columns.includes('enrollment_date')) orderedCols.push('enrollment_date');
      if (columns.includes('grade')) orderedCols.push('grade');
      
      columns.forEach(col => {
        if (!orderedCols.includes(col)) orderedCols.push(col);
      });
      columns = orderedCols;
    }

    return (
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col}>{col.replace(/_/g, ' ').toUpperCase()}</th>
              ))}
              {source && <th>SOURCE</th>}
              {(allowActions || allowCreate) && <th>ACTIONS</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const itemId = item[idField] || item._id;
              const isEditing = allowActions && editingItem && (editingItem[idField] === itemId || editingItem._id === itemId);
              
              return (
                <tr key={idx} className={isEditing ? 'editing-row' : ''}>
                  {isEditing ? (
                    <>
                      {columns.map(col => {
                        const isIdField = col === idField;
                        
                        const isNameField = col === 'teacher_name' || col === 'student_name' || col === 'subject_name';
                        
                        let actualCol = col;
                        if (isNameField) {
                          if (col === 'teacher_name' && ['subjects', 'classes'].includes(selectedEntity)) {
                            actualCol = 'teacher_id';
                          } else if (col === 'student_name' && selectedEntity === 'enrollments') {
                            actualCol = 'student_id';
                          } else if (col === 'subject_name' && selectedEntity === 'enrollments') {
                            actualCol = 'subject_id';
                          }
                        }
                        
                        const value = editFormData[actualCol] !== undefined ? editFormData[actualCol] : item[actualCol];
                        const displayValue = value !== null && value !== undefined ? String(value) : '';
                        const optionsForField = referenceOptions[actualCol] || [];
                        
                        // Determine input type based on field name
                        let inputType = 'text';
                        if (col.includes('date') || col.includes('Date')) {
                          inputType = 'date';
                        } else if (col.includes('email')) {
                          inputType = 'email';
                        } else if (actualCol.includes('_id') || col.includes('credits') || col === 'available') {
                          inputType = 'number';
                        }
                        
                        // Format date values for date inputs
                        let formattedValue = displayValue;
                        if (inputType === 'date' && value) {
                          const date = new Date(value);
                          if (!isNaN(date.getTime())) {
                            formattedValue = date.toISOString().split('T')[0];
                          }
                        }
                        
                        return (
                          <td key={col}>
                            {isIdField ? (
                              <span>{item[col] || '-'}</span>
                            ) : optionsForField.length > 0 ? (
                              <select
                                className="inline-edit-input"
                                value={
                                  value === null || value === undefined ? '' : String(value)
                                }
                                onChange={(e) => {
                                  const selectedValue = e.target.value;
                                  const parsedValue = selectedValue === '' ? null : Number(selectedValue);
                                  handleInputChange(actualCol, parsedValue);
                                }}
                              >
                                <option value="">Select {actualCol.replace(/_/g, ' ')}</option>
                                {optionsForField.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={inputType}
                                value={formattedValue}
                                onChange={(e) => {
                                  let newValue = e.target.value;
                                  if (inputType === 'number') {
                                    newValue = newValue === '' ? '' : (isNaN(Number(newValue)) ? newValue : Number(newValue));
                                  }
                                  handleInputChange(col, newValue);
                                }}
                                className="inline-edit-input"
                                placeholder={col.replace(/_/g, ' ')}
                              />
                            )}
                          </td>
                        );
                      })}
                      {source && (
                        <td>
                          <span className={`badge badge-${item.source?.toLowerCase() || 'combined'}`}>
                            {item.source || 'N/A'}
                          </span>
                        </td>
                      )}
                      {allowActions && (
                        <td>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={handleSaveEdit}
                          disabled={loading}
                        >
                          ✓ Save
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={handleCancelEdit}
                          disabled={loading}
                        >
                          ✕ Cancel
                        </button>
                        </td>
                      )}
                    </>
                  ) : (
                    <>
                      {columns.map(col => (
                        <td key={col}>
                          {formatDisplayValue(col, item[col])}
                        </td>
                      ))}
                      {source && (
                        <td>
                          <span className={`badge badge-${item.source?.toLowerCase() || 'combined'}`}>
                            {item.source || 'N/A'}
                          </span>
                        </td>
                      )}
                      {allowActions && (
                        <td>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleEdit(item)}
                            disabled={loading}
                            title="Edit"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(item)}
                            disabled={loading}
                            title="Delete"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      )}
                    </>
                  )}
                </tr>
              );
            })}
        {allowCreate && newRows[tableKey] && (
          <tr className="editing-row new-row">
            {columns.map(col => {
              const isIdField = col === idField;
              if (isIdField) {
                return <td key={col}>Auto</td>;
              }

              const optionsForField = referenceOptions[col] || [];
              if (optionsForField.length > 0) {
                return (
                  <td key={col}>
                    <select
                      className="inline-edit-input"
                      value={
                        newRows[tableKey][col] === null || newRows[tableKey][col] === undefined
                          ? ''
                          : String(newRows[tableKey][col])
                      }
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        const parsedValue = selectedValue === '' ? null : Number(selectedValue);
                        handleNewRowChange(tableKey, col, parsedValue);
                      }}
                    >
                      <option value="">Select {col.replace(/_/g, ' ')}</option>
                      {optionsForField.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                );
              }

              let inputType = 'text';
              if (col.includes('date') || col.includes('Date')) {
                inputType = 'date';
              } else if (col.includes('email')) {
                inputType = 'email';
              } else if (col.includes('_id') || col.includes('credits')) {
                inputType = 'number';
              }

              return (
                <td key={col}>
                  <input
                    type={inputType}
                    value={newRows[tableKey][col] || ''}
                    onChange={(e) => handleNewRowChange(tableKey, col, e.target.value)}
                    className="inline-edit-input"
                    placeholder={col.replace(/_/g, ' ')}
                  />
                </td>
              );
            })}
            {source && <td>-</td>}
            <td>
              <button
                className="btn btn-success btn-sm"
                onClick={() => handleCreateNewRow(tableKey)}
                disabled={loading}
              >
                Create
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleCancelNewRow(tableKey)}
                disabled={loading}
              >
                Cancel
              </button>
            </td>
          </tr>
        )}
          </tbody>
        </table>
    {allowCreate && !newRows[tableKey] && (
      <div style={{ marginTop: '0.5rem' }}>
        <button
          className="btn btn-success btn-sm"
          onClick={() => handleAddNewRow(tableKey)}
          disabled={loading}
        >
          New
        </button>
      </div>
    )}
      </div>
    );
  };

  const actionsDisabled = ['librarybooks', 'events'].includes(selectedEntity);

  return (
    <div className="card">
      <h2>📊 View Data</h2>
      
      <div className="form-group">
        <label>Select Entity Type:</label>
        <select
          value={selectedEntity}
          onChange={(e) => setSelectedEntity(e.target.value)}
        >
          {ENTITY_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="view-selector">
        <button
          className={viewMode === 'all' ? 'active' : ''}
          onClick={() => setViewMode('all')}
        >
          All Views
        </button>
        <button
          className={viewMode === 'postgres' ? 'active' : ''}
          onClick={() => setViewMode('postgres')}
        >
          PostgreSQL Only
        </button>
        <button
          className={viewMode === 'mongodb' ? 'active' : ''}
          onClick={() => setViewMode('mongodb')}
        >
          MongoDB Only
        </button>
        {SIMILAR_ENTITIES.includes(selectedEntity) && (
          <button
            className={viewMode === 'combined' ? 'active' : ''}
            onClick={() => setViewMode('combined')}
          >
            Joined View
          </button>
        )}
      </div>

      {loading && <div className="loading">Loading data...</div>}
      
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      {error && (
        <div className="message error">
          Error: {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          {viewMode === 'all' && (
            <>
              {data.postgres && data.postgres.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ marginBottom: '1rem', color: '#336791' }}>
                    PostgreSQL Data ({data.postgres.length} records)
                  </h3>
                  {renderTable(
                    data.postgres,
                    undefined,
                    `${selectedEntity}-postgres-all`,
                    { allowActions: !actionsDisabled, allowCreate: selectedEntity === 'teachers' }
                  )}
                </div>
              )}
              
              {data.mongodb && data.mongodb.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ marginBottom: '1rem', color: '#4db33d' }}>
                    MongoDB Data ({data.mongodb.length} records)
                  </h3>
                  {renderTable(
                    data.mongodb,
                    undefined,
                    `${selectedEntity}-mongodb-all`,
                    { allowActions: !actionsDisabled, allowCreate: selectedEntity === 'teachers' }
                  )}
                </div>
              )}
              
              {data.combined && data.combined.length > 0 && (
                <div>
                  <h3 style={{ marginBottom: '1rem', color: '#764ba2' }}>
                    Combined Data ({data.combined.length} records)
                  </h3>
                  {renderTable(
                    data.combined,
                    true,
                    `${selectedEntity}-combined-all`,
                    { allowActions: !actionsDisabled, allowCreate: false }
                  )}
                </div>
              )}
            </>
          )}
          
          {(viewMode === 'postgres' || viewMode === 'mongodb' || viewMode === 'combined') && (
            <>
              {data.data && data.data.length > 0 ? (
                <>
                  <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>
                    {data.source || 'Data'} ({data.data.length} records)
                  </h3>
                  {renderTable(
                    data.data,
                    viewMode === 'combined',
                    `${selectedEntity}-${viewMode}-single`,
                    { allowActions: !actionsDisabled, allowCreate: selectedEntity === 'teachers' }
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <p>No data found for this view</p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default DataViewer;


