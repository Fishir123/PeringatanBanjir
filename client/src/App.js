import React from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
