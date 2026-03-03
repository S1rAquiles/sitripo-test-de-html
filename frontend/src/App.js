import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';
import RequestPage from './RequestPage';

function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  const [studentView, setStudentView] = useState('dashboard');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#solicitar') setStudentView('solicitar');
      else setStudentView('dashboard');
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
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
      {/* Solo mostramos el header si NO estamos logueados o si queremos un header global */}
      {!user && (
        <header className="App-header">
          <div className="brand">
            <div className="logo">PA</div>
            <h1>Portal de becas</h1>
          </div>
        </header>
      )}
      <main className="app-main">
        {user ? (
          (user.rol === 'admin') ? (
            <AdminDashboard onLogout={logout} />
          ) : (
            studentView === 'dashboard' ? (
              <Dashboard onLogout={logout} onOpenRequest={() => setStudentView('solicitar')} />
            ) : (
              <RequestPage onClose={() => setStudentView('dashboard')} onSubmitted={() => setStudentView('dashboard')} onLogout={logout} />
            )
          )
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
