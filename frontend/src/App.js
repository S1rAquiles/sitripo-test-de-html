import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';

function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const onAuth = () => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setView('login');
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="brand">
          <div className="logo">PA</div>
          <h1>Portal de Pasantías</h1>
        </div>
      </header>
      <main className="app-main">
        {user ? (
          <Dashboard onLogout={logout} />
        ) : (
          <div>
            <div style={{ marginBottom: 12, display:'flex', gap:8, justifyContent:'center' }}>
              <button className="btn secondary" onClick={() => setView('login')}>Iniciar sesión</button>
              <button className="btn" onClick={() => setView('register')}>Crear cuenta</button>
            </div>
            {view === 'login' ? (
              <Login onLogin={onAuth} />
            ) : (
              <Register onRegister={onAuth} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
