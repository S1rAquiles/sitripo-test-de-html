import React, { useEffect, useState } from 'react';
import { getProfile } from './auth';
import './AdminDashboard.css';

export default function AdminDashboard({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      onLogout();
      return;
    }
    (async () => {
      const res = await getProfile(token);
      if (res.error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        onLogout();
      } else {
        setProfile(res.user);
      }
      setLoading(false);
    })();
  }, [onLogout]);

  if (loading) return <div className="auth-card"><p>Cargando panel de administrador...</p></div>;
  if (!profile) return null;

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="logo">PA</div>
        <div className="admin-subtitle" style={{marginTop:8,color:'#9aa9bd'}}>Panel Admin</div>
        <nav className="admin-nav">
          <button>Resumen</button>
          <button>Convocatorias</button>
          <button>Usuarios</button>
          <button>Solicitudes</button>
          <button>Configuración</button>
        </nav>
      </aside>

      <main className="admin-main-area">
        <div className="auth-card admin-dashboard">
          <div className="admin-header">
            <div>
              <h3 className="auth-title">Panel de Administración</h3>
              <p className="auth-sub">Administrador: {profile.nombre}</p>
            </div>
            <div className="btn-group">
              <button className="btn ghost" onClick={() => { localStorage.clear(); onLogout(); }}>Cerrar sesión</button>
              <button className="btn primary" onClick={() => { /* acción rápida */ }}>Crear Convocatoria</button>
            </div>
          </div>

          <div className="admin-actions-row">
            <div className="stat-card">
              <div className="stat-icon">📑</div>
              <div className="stat-info"><h3>12</h3><p>Convocatorias activas</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info"><h3>1,234</h3><p>Usuarios registrados</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📬</div>
              <div className="stat-info"><h3>56</h3><p>Solicitudes pendientes</p></div>
            </div>
          </div>

          <div className="admin-main">
            <div className="panel admin-table">
              <h4>Solicitudes recientes</h4>
              <table>
                <thead>
                  <tr><th>Usuario</th><th>Convocatoria</th><th>Fecha</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  <tr><td>Juan Pérez</td><td>Beca X</td><td>2026-02-10</td><td>Pendiente</td></tr>
                  <tr><td>María Gómez</td><td>quiere money Y</td><td>2026-02-08</td><td>Aprobado</td></tr>
                </tbody>
              </table>
            </div>

            <div className="panel">
              <h4>Acciones rápidas</h4>
              <div className="panel-grid">
                <div className="action">Gestionar convocatorias</div>
                <div className="action">Revisar documentos</div>
                <div className="action">Enviar notificación</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
