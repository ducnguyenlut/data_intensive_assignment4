import React, { useState, useEffect } from 'react';
import { getEntities, joinEntities } from '../services/api';

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

function DataViewer() {
  const [selectedEntity, setSelectedEntity] = useState('teachers');
  const [viewMode, setViewMode] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedEntity, viewMode]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
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

  const renderTable = (items, source) => {
    if (!items || items.length === 0) {
      return <div className="empty-state">No data available</div>;
    }

    const columns = Object.keys(items[0]).filter(key => key !== '_id' && key !== 'source');

    return (
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col}>{col.replace(/_/g, ' ').toUpperCase()}</th>
              ))}
              {source && <th>SOURCE</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                {columns.map(col => (
                  <td key={col}>
                    {typeof item[col] === 'object' && item[col] !== null
                      ? JSON.stringify(item[col])
                      : String(item[col] || '-')}
                  </td>
                ))}
                {source && (
                  <td>
                    <span className={`badge badge-${item.source?.toLowerCase() || 'combined'}`}>
                      {item.source || 'N/A'}
                    </span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

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
                  {renderTable(data.postgres)}
                </div>
              )}
              
              {data.mongodb && data.mongodb.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ marginBottom: '1rem', color: '#4db33d' }}>
                    MongoDB Data ({data.mongodb.length} records)
                  </h3>
                  {renderTable(data.mongodb)}
                </div>
              )}
              
              {data.combined && data.combined.length > 0 && (
                <div>
                  <h3 style={{ marginBottom: '1rem', color: '#764ba2' }}>
                    Combined Data ({data.combined.length} records)
                  </h3>
                  {renderTable(data.combined, true)}
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
                  {renderTable(data.data, viewMode === 'combined')}
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

