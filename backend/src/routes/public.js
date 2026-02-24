const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Listado de ayudas activas (para landing)
router.get('/ayudas', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, titulo, descripcion, fecha_inicio, fecha_fin FROM ayudas WHERE activa = 1 ORDER BY fecha_inicio DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error GET /ayudas', err);
    res.status(500).json({ error: 'Error al obtener ayudas' });
  }
});

// Crear solicitud (estudiante)
router.post('/solicitar', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    // Campos básicos del cuerpo (para JSON requests)
    const {
      nombre,
      email,
      cedula,
      telefono,
      direccion,
      ayuda_id
    } = req.body;

    if (!nombre || !email || !ayuda_id) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Insertar o encontrar usuario
    await conn.beginTransaction();
    const [uExist] = await conn.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    let usuarioId;
    if (uExist.length) {
      usuarioId = uExist[0].id;
      await conn.query(
        'UPDATE usuarios SET nombre = ?, cedula = ?, telefono = ?, direccion = ? WHERE id = ?',
        [nombre, cedula || null, telefono || null, direccion || null, usuarioId]
      );
    } else {
      const [uRes] = await conn.query(
        'INSERT INTO usuarios(nombre, email, password_hash, rol, cedula, telefono, direccion) VALUES (?,?,?,?,?,?,?)',
        [nombre, email, 'N/A', 'estudiante', cedula || null, telefono || null, direccion || null]
      );
      usuarioId = uRes.insertId;
    }

    // Archivos subidos por multer (si vienen)
    let archivos = [];
    if (Array.isArray(req.files) && req.files.length) {
      archivos = req.files.map(f => ({
        field: f.fieldname,
        name: f.originalname,
        path: f.path.replace(/\\\\/g, '/')
      }));
    }

    const datosFormulario = {
      nombre,
      email,
      cedula,
      telefono,
      direccion
    };

    const [sRes] = await conn.query(
      'INSERT INTO solicitudes (usuario_id, ayuda_id, estatus, archivos_json, datos_formulario) VALUES (?,?,?,?,?)',
      [usuarioId, ayuda_id, 'Pendiente', JSON.stringify(archivos), JSON.stringify(datosFormulario)]
    );

    await conn.commit();
    res.status(201).json({ id: sRes.insertId, mensaje: 'Solicitud creada' });
  } catch (err) {
    await conn.rollback();
    console.error('Error POST /solicitar', err);
    res.status(500).json({ error: 'Error al crear la solicitud' });
  } finally {
    conn.release();
  }
});

module.exports = router;

