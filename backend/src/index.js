require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const authRoutes = require('./routes/auth');
const productosRoutes = require('./routes/productos');
const pedidosRoutes = require('./routes/pedidos');
const vouchersRoutes = require('./routes/vouchers');
const almacenRoutes = require('./routes/almacen');
const notificacionesRoutes = require('./routes/notificaciones');

const app = express();
const server = http.createServer(app);

// Socket.io para notificaciones en tiempo real
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Almacenamos io en app para usarlo en los controladores
app.set('io', io);

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// NOTA DE SEGURIDAD: /uploads NO se expone como ruta estática pública.
// Los archivos de voucher se sirven solo a través del endpoint protegido
// GET /api/vouchers/archivo/:filename (requiere token JWT válido).

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/vouchers', vouchersRoutes);
app.use('/api/almacen', almacenRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ELG API corriendo', timestamp: new Date().toISOString() });
});

// Socket.io eventos
io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`);

  // El cliente se une a su sala según su rol
  socket.on('join-room', (rol) => {
    socket.join(rol);
    console.log(`👤 Usuario unido a sala: ${rol}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Cliente desconectado: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor ELG corriendo en http://localhost:${PORT}`);
  console.log(`📦 Base de datos: SQLite (dev.db)`);
});
