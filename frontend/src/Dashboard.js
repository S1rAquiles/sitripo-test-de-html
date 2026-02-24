import React, { useEffect, useState } from 'react';
import { getProfile } from './auth';

export default function Dashboard({ onLogout }) {
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

  if (loading) return <div className="auth-card"><p>Cargando tablero...</p></div>;
  if (!profile) return null;

  return (
    <div className="auth-card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <h3 className="auth-title">Tablero — Portal de Pasantías</h3>
          <p className="auth-sub">Bienvenido, {profile.nombre}</p>
        </div>
        <div>
          <button className="btn secondary" onClick={() => { localStorage.clear(); onLogout(); }}>Cerrar sesión</button>
        </div>
      </div>

      <section style={{marginTop:16}}>
        <h4 style={{margin:'8px 0'}}>Resumen</h4>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <div style={{padding:12,background:'#f8fafc',borderRadius:8}}>Postulaciones: <strong>0</strong></div>
          <div style={{padding:12,background:'#f8fafc',borderRadius:8}}>Entrevistas: <strong>0</strong></div>
        </div>
        <p className="small-note" style={{marginTop:12}}>Este tablero es una vista inicial. Integra más métricas y links según la necesidad.</p>
      </section>
    </div>
  );
}
