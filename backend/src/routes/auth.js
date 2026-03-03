const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const JWT_EXPIRES = '8h';

router.post('/auth/register', async (req, res) => {
  const { nombre, email, password, rol = 'estudiante', cedula = null, telefono = null, direccion = null } = req.body;
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const conn = await pool.getConnection();
  try {
    const [exists] = await conn.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (exists.length) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await conn.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol, cedula, telefono, direccion) VALUES (?,?,?,?,?,?,?)',
      [nombre, email, hash, rol, cedula || null, telefono || null, direccion || null]
    );

    const userId = result.insertId;
    const token = jwt.sign({ id: userId, email, nombre, rol }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.status(201).json({ id: userId, token, nombre, rol });
  } catch (err) {
    console.error('Error POST /auth/register', err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  } finally {
    conn.release();
  }
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Faltan campos' });

  try {
    const [rows] = await pool.query('SELECT id, nombre, password_hash, rol FROM usuarios WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Credenciales inválidas' });

    const user = rows[0];
    if (!user.password_hash || user.password_hash === 'N/A') {
      return res.status(401).json({ error: 'Usuario sin contraseña establecida' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign({ id: user.id, email, nombre: user.nombre, rol: user.rol }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({ token, id: user.id, nombre: user.nombre, rol: user.rol });
  } catch (err) {
    console.error('Error POST /auth/login', err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Middleware simple para verificar token
function verifyToken(req, res, next) {
  const auth = req.headers.authorization || '';
  const parts = auth.split(' ');
  const token = parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : null;
  if (!token) return res.status(401).json({ error: 'No autorizado' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// Obtener perfil del usuario autenticado
router.get('/auth/me', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nombre, email, rol, cedula, telefono, direccion, creado_en FROM usuarios WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    const user = rows[0];
    res.json({ user });
  } catch (err) {
    console.error('Error GET /auth/me', err);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// Obtener solicitudes del usuario autenticado
router.get('/auth/solicitudes', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.estatus, s.fecha_solicitud, s.fecha_cita, s.archivos_json, s.datos_formulario, a.titulo AS ayuda
         FROM solicitudes s
         JOIN ayudas a ON a.id = s.ayuda_id
        WHERE s.usuario_id = ?
        ORDER BY s.fecha_solicitud DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error GET /auth/solicitudes', err);
    res.status(500).json({ error: 'Error al obtener solicitudes' });
  }
});

module.exports = router;
