import React, { useEffect, useState } from 'react';
import './Dashboard.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export default function Dashboard({ onLogout, onOpenRequest }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [solicitudes, setSolicitudes] = useState([]);
  

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      onLogout();
      return;
    }

    (async () => {
      const res = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
      if (res.error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        onLogout();
        return;
      }
      setProfile(res.user);

      const sols = await fetch(`${API}/auth/solicitudes`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
      setSolicitudes(Array.isArray(sols) ? sols : []);

      setLoading(false);
    })();
  }, [onLogout]);

  const refreshSolicitudes = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const sols = await fetch(`${API}/auth/solicitudes`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
      setSolicitudes(Array.isArray(sols) ? sols : []);
    } catch (err) {
      console.error('Error refrescando solicitudes', err);
    }
  };

  if (loading) return <div className="auth-card"><p>Cargando tablero...</p></div>;
  if (!profile) return null;

  return (
    <div className="dashboard-container">
      {/* Sidebar / Navegación Izquierda */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="logo-small">PA</div>
          <span>Portal Académico</span>
        </div>
        
        <nav className="sidebar-nav">
          <button className="nav-item active">
            <span className="icon">🏠</span> Inicio
          </button>
          <button className="nav-item" onClick={() => onOpenRequest && onOpenRequest()}>
            <span className="icon">📝</span> Nueva Solicitud
          </button>
          <button className="nav-item">
            <span className="icon">📄</span> Mis Documentos
          </button>
          <button className="nav-item">
            <span className="icon">⚙️</span> Configuración
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={() => { localStorage.clear(); onLogout(); }}>
             Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="dashboard-content">
        <header className="content-header">
          <div className="header-search">
            <input type="text" placeholder="Buscar solicitidudes..." />
          </div>
          <div className="user-profile-header">
            <span className="user-name">{profile.nombre}</span>
            <div className="avatar-small">{(profile.nombre || 'U').slice(0,1).toUpperCase()}</div>
          </div>
        </header>

        <section className="welcome-section">
          <div className="welcome-text">
            <h1>¡Bienvenido de nuevo, {profile.nombre.split(' ')[0]}! 👋</h1>
            <p>Aquí tienes un resumen de tus solicitudes de becas.</p>
          </div>
          <button className="primary-btn pulse" onClick={() => onOpenRequest && onOpenRequest()}>
            + Iniciar nueva solicitud
          </button>
        </section>

        <div className="dashboard-stats-row">
          <div className="stat-card-new indigo">
            <div className="stat-icon">📑</div>
            <div className="stat-info">
              <h3>{solicitudes.length}</h3>
              <p>Total Postulaciones</p>
            </div>
          </div>
          <div className="stat-card-new green">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{solicitudes.filter(s=>s.estatus==='Aprobado').length}</h3>
              <p>Aprobadas</p>
            </div>
          </div>
          <div className="stat-card-new orange">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{solicitudes.filter(s=>s.estatus==='Pendiente').length}</h3>
              <p>En Revisión</p>
            </div>
          </div>
        </div>

        <section className="recent-activity">
          <div className="section-header">
            <h2>Actividad Reciente</h2>
            <button className="text-btn" onClick={() => refreshSolicitudes()}>Actualizar lista</button>
          </div>
          
          <div className="activity-table-container">
            {solicitudes.length === 0 ? (
              <div className="empty-state">
                <p>No tienes solicitudes activas en este momento.</p>
              </div>
            ) : (
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>Convocatoria</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Documentos</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.ayuda}</strong></td>
                      <td>{new Date(s.fecha_solicitud).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-tag ${s.estatus.toLowerCase()}`}>
                          {s.estatus}
                        </span>
                      </td>
                      <td>
                        {s.archivos_json && JSON.parse(s.archivos_json).length > 0 ? (
                           <span className="file-count">📎 {JSON.parse(s.archivos_json).length} archivo(s)</span>
                        ) : '---'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}