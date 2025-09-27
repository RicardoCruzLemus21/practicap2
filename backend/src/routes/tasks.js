const express = require('express');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Crear tarea
router.post('/', authMiddleware, async (req, res) => {
  const { title, description } = req.body;
  const userId = req.userId;
  try {
    const newTask = await pool.query(
      'INSERT INTO tasks (user_id, title, description, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, title, description, 'pending']
    );
    res.status(201).json(newTask.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear tarea', details: err.message });
  }
});

// Listar tareas de un usuario
router.get('/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  if (req.userId !== parseInt(userId)) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  try {
    const tasks = await pool.query('SELECT * FROM tasks WHERE user_id = $1', [userId]);
    res.json(tasks.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener tareas', details: err.message });
  }
});

// Actualizar estado de tarea
router.put('/:id/status', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['pending', 'in_progress', 'done'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }
  try {
    const task = await pool.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (task.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada o no autorizada' });
    }
    const updatedTask = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    res.json(updatedTask.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar tarea', details: err.message });
  }
});

module.exports = router;