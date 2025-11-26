import React, { useState } from 'react';
import './App.css';
import DataViewer from './components/DataViewer';
import DataForm from './components/DataForm';
import { restoreData } from './services/api';

function App() {
  const [restoring, setRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRestore = async () => {
    const confirmed = window.confirm('This will reset PostgreSQL and MongoDB data to the default sample set. Continue?');
    if (!confirmed) return;

    setRestoring(true);
    setRestoreMessage(null);
    try {
      await restoreData('all');
      setRestoreMessage({ type: 'success', text: 'Data restored successfully!' });
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 1000);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      setRestoreMessage({ type: 'error', text: error.message });
      setShowPopup(false);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏫 School Management System</h1>
        
        <button
          className="btn btn-secondary"
          onClick={handleRestore}
          disabled={restoring}
        >
          {restoring ? 'Restoring data...' : 'Restore Data'}
        </button>
        {showPopup && restoreMessage?.type === 'success' && (
          <div className="popup-message">
            {restoreMessage.text}
          </div>
        )}
      </header>
      
      <main className="App-main">
        <DataViewer refreshKey={refreshKey} />
      </main>
    </div>
  );
}

export default App;





