import React, { useEffect, useState } from 'react';
import RequestForm from './RequestForm';
import './RequestPage.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export default function RequestPage({ onClose, onSubmitted, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [ayudas, setAyudas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        onLogout && onLogout();
        return;
      }
      try {
        const me = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
        if (me && me.user) setProfile(me.user);
        const ayudasList = await fetch(`${API}/ayudas`).then(r => r.json());
        setAyudas(Array.isArray(ayudasList) ? ayudasList : []);
      } catch (err) {
        console.error('Error cargando datos para solicitud', err);
      }
      setLoading(false);
    })();
  }, [onLogout]);

  if (loading) return <div className="auth-card"><p>Cargando formulario...</p></div>;

  return (
    <div className="auth-card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <h3 style={{margin:0}}>Nueva Solicitud</h3>
        <div>
          <button className="btn secondary" onClick={() => { onClose && onClose(); }}>Volver</button>
        </div>
      </div>

      <RequestForm profile={profile} ayudas={ayudas} onClose={() => { onClose && onClose(); }} onSubmitted={() => { onSubmitted && onSubmitted(); }} />
    </div>
  );
}
