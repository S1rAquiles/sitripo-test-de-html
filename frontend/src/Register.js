import React, { useState } from 'react';
import { registerUser } from './auth';

export default function Register({ onRegister }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('estudiante');
  const [password, setPassword] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [msg, setMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      if (password.length < 8) return setMsg('La contraseña debe tener al menos 8 caracteres');
      const payload = { nombre, email, password, rol, cedula: cedula || null, telefono: telefono || null, direccion: direccion || null };
      const res = await registerUser(payload);
      if (res.error) return setMsg(res.error);
      if (res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify({ id: res.id, nombre }));
        onRegister();
      } else {
        setMsg('Respuesta inesperada');
      }
    } catch (err) {
      setMsg('Error al conectar');
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h3 className="auth-title">Registro — Portal de Pasantías</h3>
        <p className="auth-sub">Crea tu cuenta con tu correo institucional</p>
      </div>
      <form onSubmit={submit}>
        <div className="form-group">
          <label>Nombre completo</label>
          <input className="form-control" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" required />
        </div>
        <div className="form-group">
          <label>Correo institucional</label>
          <input className="form-control" value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="tu@universidad.edu" required />
        </div>
        <div className="form-group">
          <label>Rol</label>
          <select className="form-control" value={rol} onChange={e => setRol(e.target.value)}>
            <option value="estudiante">Estudiante</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div className="form-group">
          <label>Cédula</label>
          <input className="form-control" value={cedula} onChange={e => setCedula(e.target.value)} placeholder="Número de cédula" />
        </div>
        <div className="form-group">
          <label>Teléfono</label>
          <input className="form-control" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="(+57) 300 000 0000" />
        </div>
        <div className="form-group">
          <label>Dirección</label>
          <input className="form-control" value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Dirección" />
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input className="form-control" value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Min. 8 caracteres" required />
        </div>
        <button className="btn" type="submit">Crear cuenta</button>
      </form>
      {msg && <div className="msg">{msg}</div>}
      <div className="small-note">Al registrarte aceptas las políticas de uso de la universidad.</div>
    </div>
  );
}
