import React, { useState, useEffect } from 'react';
import { getEntities, createEntity, updateEntity, deleteEntity } from '../services/api';

const ENTITY_TYPES = [
  { value: 'teachers', label: 'Teachers' },
  { value: 'classes', label: 'Classes' },
  { value: 'students', label: 'Students' },
  { value: 'subjects', label: 'Subjects' },
  { value: 'enrollments', label: 'Enrollments' },
  { value: 'librarybooks', label: 'Library Books' },
  { value: 'events', label: 'Events' },
];

function DataForm() {
  const [selectedEntity, setSelectedEntity] = useState('teachers');
  const [action, setAction] = useState('create');
  const [formData, setFormData] = useState({});
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (action === 'update' || action === 'delete') {
      fetchItems();
    }
  }, [selectedEntity, action]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const result = await getEntities(selectedEntity, 'all');
      const allItems = [
        ...(result.postgres || []),
        ...(result.mongodb || []),
      ];
      setItems(allItems);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getFormFields = () => {
    const fields = {
      teachers: [
        { name: 'first_name', label: 'First Name', type: 'text', required: true },
        { name: 'last_name', label: 'Last Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: false },
        { name: 'phone_number', label: 'Phone Number', type: 'text', required: false },
        { name: 'hire_date', label: 'Hire Date', type: 'date', required: true },
      ],
      classes: [
        { name: 'class_name', label: 'Class Name', type: 'text', required: true },
        { name: 'teacher_id', label: 'Teacher ID', type: 'number', required: false },
        { name: 'room_number', label: 'Room Number', type: 'text', required: false },
      ],
      students: [
        { name: 'first_name', label: 'First Name', type: 'text', required: true },
        { name: 'last_name', label: 'Last Name', type: 'text', required: true },
        { name: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true },
        { name: 'gender', label: 'Gender', type: 'select', options: ['M', 'F'], required: false },
        { name: 'email', label: 'Email', type: 'email', required: false },
        { name: 'phone_number', label: 'Phone Number', type: 'text', required: false },
        { name: 'class_id', label: 'Class ID', type: 'number', required: false },
      ],
      subjects: [
        { name: 'subject_name', label: 'Subject Name', type: 'text', required: true },
        { name: 'credits', label: 'Credits', type: 'number', required: false },
        { name: 'teacher_id', label: 'Teacher ID', type: 'number', required: false },
      ],
      enrollments: [
        { name: 'student_id', label: 'Student ID', type: 'number', required: true },
        { name: 'subject_id', label: 'Subject ID', type: 'number', required: true },
        { name: 'enrollment_date', label: 'Enrollment Date', type: 'date', required: false },
        { name: 'grade', label: 'Grade', type: 'text', required: false },
      ],
      librarybooks: [
        { name: 'book_id', label: 'Book ID', type: 'number', required: true },
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'author', label: 'Author', type: 'text', required: true },
        { name: 'isbn', label: 'ISBN', type: 'text', required: false },
        { name: 'available', label: 'Available', type: 'select', options: [true, false], required: false },
      ],
      events: [
        { name: 'event_id', label: 'Event ID', type: 'number', required: true },
        { name: 'event_name', label: 'Event Name', type: 'text', required: true },
        { name: 'event_date', label: 'Event Date', type: 'date', required: true },
        { name: 'location', label: 'Location', type: 'text', required: false },
        { name: 'organizer_id', label: 'Organizer ID', type: 'number', required: false },
      ],
    };
    return fields[selectedEntity] || [];
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value) || value : 
              type === 'checkbox' ? e.target.checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (action === 'create') {
        await createEntity(selectedEntity, formData);
        setMessage({ type: 'success', text: `${selectedEntity} created successfully!` });
        setFormData({});
      } else if (action === 'update' && editingId) {
        const idField = getEntityIdField();
        await updateEntity(selectedEntity, editingId, formData);
        setMessage({ type: 'success', text: `${selectedEntity} updated successfully!` });
        setFormData({});
        setEditingId(null);
        fetchItems();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete this ${selectedEntity}?`)) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const idField = getEntityIdField();
      const id = item[idField] || item._id;
      await deleteEntity(selectedEntity, id);
      setMessage({ type: 'success', text: `${selectedEntity} deleted successfully!` });
      fetchItems();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    const idField = getEntityIdField();
    setEditingId(item[idField] || item._id);
    const { _id, ...data } = item;
    setFormData(data);
    setAction('update');
  };

  const getEntityIdField = () => {
    const idFields = {
      teachers: 'teacher_id',
      classes: 'class_id',
      students: 'student_id',
      subjects: 'subject_id',
      enrollments: 'enrollment_id',
      librarybooks: 'book_id',
      events: 'event_id',
    };
    return idFields[selectedEntity] || 'id';
  };

  const renderFormField = (field) => {
    if (field.type === 'select') {
      return (
        <select
          name={field.name}
          value={formData[field.name] || ''}
          onChange={handleInputChange}
          required={field.required}
        >
          <option value="">Select {field.label}</option>
          {field.options.map(option => (
            <option key={option} value={option}>
              {String(option)}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={field.type}
        name={field.name}
        value={formData[field.name] || ''}
        onChange={handleInputChange}
        required={field.required}
      />
    );
  };

  return (
    <div>
      <div className="card">
        <h2>✏️ Manage Data</h2>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          Create, update, or delete data. The system automatically routes to the appropriate database.
        </p>

        <div className="form-group">
          <label>Select Entity Type:</label>
          <select
            value={selectedEntity}
            onChange={(e) => {
              setSelectedEntity(e.target.value);
              setFormData({});
              setEditingId(null);
              setAction('create');
            }}
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
            className={action === 'create' ? 'active' : ''}
            onClick={() => {
              setAction('create');
              setFormData({});
              setEditingId(null);
            }}
          >
            Create New
          </button>
          <button
            className={action === 'update' ? 'active' : ''}
            onClick={() => {
              setAction('update');
              fetchItems();
            }}
          >
            Update Existing
          </button>
          <button
            className={action === 'delete' ? 'active' : ''}
            onClick={() => {
              setAction('delete');
              fetchItems();
            }}
          >
            Delete
          </button>
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {(action === 'create' || action === 'update') && (
          <form onSubmit={handleSubmit}>
            {getFormFields().map(field => (
              <div key={field.name} className="form-group">
                <label>
                  {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
                </label>
                {renderFormField(field)}
              </div>
            ))}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {action === 'create' ? 'Create' : 'Update'} {selectedEntity}
            </button>
            {action === 'update' && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setFormData({});
                  setEditingId(null);
                  setAction('create');
                }}
              >
                Cancel
              </button>
            )}
          </form>
        )}

        {action === 'delete' && (
          <div>
            {loading ? (
              <div className="loading">Loading items...</div>
            ) : items.length === 0 ? (
              <div className="empty-state">
                <p>No items available to delete</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Details</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const idField = getEntityIdField();
                      const id = item[idField] || item._id;
                      const nameField = getFormFields().find(f => f.name.includes('name') || f.name.includes('title'));
                      const name = nameField ? item[nameField.name] : `Item ${idx + 1}`;
                      return (
                        <tr key={idx}>
                          <td>{id}</td>
                          <td>{name || JSON.stringify(item).substring(0, 50)}</td>
                          <td>
                            <button
                              className="btn btn-danger"
                              onClick={() => handleDelete(item)}
                              disabled={loading}
                            >
                              Delete
                            </button>
                            <button
                              className="btn btn-success"
                              onClick={() => handleEdit(item)}
                              disabled={loading}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DataForm;

