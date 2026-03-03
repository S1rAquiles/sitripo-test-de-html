import React, { useState } from 'react';
import { loginUser } from './auth';
import './Login.css';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await loginUser({ email, password });
      if (res.error) return setMsg(res.error);
      if (res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify({ id: res.id, nombre: res.nombre, rol: res.rol }));
        onLogin();
      } else {
        setMsg('Respuesta inesperada');
      }
    } catch (err) {
      setMsg('Error al conectar');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Portal de  </h2>
        <p>Accede con tu correo institucional para gestionar postulaciones</p>
        <form onSubmit={submit} className="login-form">
          <div className="form-group">
            <label>Correo</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="tu@universidad.edu" required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Contraseña" required />
          </div>
          <button className="btn-login" type="submit">Entrar</button>
        </form>
        {msg && <div className="error-message">{msg}</div>}
        <p className="small-note">¿Problemas para entrar? Contacta a soporte@universidad.edu</p>
      </div>
    </div>
  );
}
