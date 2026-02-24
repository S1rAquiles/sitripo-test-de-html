const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Listar solicitudes pendientes
router.get('/admin/pendientes', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.estatus, s.fecha_solicitud, s.fecha_cita,
              u.nombre AS estudiante, u.email, u.cedula,
              a.titulo AS ayuda
         FROM solicitudes s
         JOIN usuarios u ON u.id = s.usuario_id
         JOIN ayudas a ON a.id = s.ayuda_id
        WHERE s.estatus = 'Pendiente'
        ORDER BY s.fecha_solicitud DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error GET /admin/pendientes', err);
    res.status(500).json({ error: 'Error al obtener pendientes' });
  }
});

// Actualizar estatus de solicitud
router.put('/admin/actualizar-estatus', async (req, res) => {
  const { id, estatus, fecha_cita, observaciones } = req.body;
  if (!id || !estatus) {
    return res.status(400).json({ error: 'id y estatus son requeridos' });
  }
  if (!['Pendiente', 'Cita', 'Aprobado', 'Rechazado'].includes(estatus)) {
    return res.status(400).json({ error: 'Estatus inválido' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE solicitudes SET estatus = ?, fecha_cita = ?, observaciones = ? WHERE id = ?',
      [estatus, fecha_cita || null, observaciones || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('Error PUT /admin/actualizar-estatus', err);
    res.status(500).json({ error: 'Error al actualizar estatus' });
  }
});

// Estadísticas simples para dashboard
router.get('/admin/stats', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT estatus, COUNT(*) AS total
         FROM solicitudes
        GROUP BY estatus`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error GET /admin/stats', err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;

