const express = require('express');
const cors = require('cors');
const userRoutes = require('./src/routes/users');
const taskRoutes = require('./src/routes/tasks');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});