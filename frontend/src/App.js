import React, { useState } from 'react';
import './App.css';
import DataViewer from './components/DataViewer';
import DataForm from './components/DataForm';

function App() {
  const [activeTab, setActiveTab] = useState('view');

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏫 School Management System</h1>
        <p>Manage your school data seamlessly</p>
      </header>
      
      <nav className="App-nav">
        <button 
          className={activeTab === 'view' ? 'active' : ''}
          onClick={() => setActiveTab('view')}
        >
          View Data
        </button>
        <button 
          className={activeTab === 'manage' ? 'active' : ''}
          onClick={() => setActiveTab('manage')}
        >
          Manage Data
        </button>
      </nav>

      <main className="App-main">
        {activeTab === 'view' ? <DataViewer /> : <DataForm />}
      </main>
    </div>
  );
}

export default App;

