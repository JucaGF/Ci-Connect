const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Importar rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const laboratoryRoutes = require('./routes/laboratories');
const opportunityRoutes = require('./routes/opportunities');
const recommendationRoutes = require('./routes/recommendations');
const networkRoutes = require('./routes/network');

// Importar middlewares
const errorHandler = require('./middleware/errorHandler');
const authenticate = require('./middleware/auth');

const app = express();
const server = createServer(app);

// Configuração do Socket.IO para real-time
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middlewares de segurança
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Muitas tentativas. Tente novamente em 15 minutos.',
});
app.use('/api/', limiter);

// Middlewares gerais
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ci-connect', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('📊 Conectado ao MongoDB'))
.catch(err => console.error('❌ Erro ao conectar ao MongoDB:', err));

// Socket.IO para recursos em tempo real
io.on('connection', (socket) => {
  console.log('👤 Usuário conectado:', socket.id);

  // Juntar-se a salas de projetos
  socket.on('join-project', (projectId) => {
    socket.join(`project-${projectId}`);
  });

  // Sair de salas de projetos
  socket.on('leave-project', (projectId) => {
    socket.leave(`project-${projectId}`);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('👋 Usuário desconectado:', socket.id);
  });
});

// Disponibilizar io para as rotas
app.set('io', io);

// Rotas de saúde
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/projects', authenticate, projectRoutes);
app.use('/api/laboratories', authenticate, laboratoryRoutes);
app.use('/api/opportunities', authenticate, opportunityRoutes);
app.use('/api/recommendations', authenticate, recommendationRoutes);
app.use('/api/network', authenticate, networkRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: '🚀 CI-Connect API está funcionando!',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `A rota ${req.originalUrl} não existe nesta API.`
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recebido, fechando servidor...');
  server.close(() => {
    console.log('✅ Servidor fechado');
    mongoose.connection.close(false, () => {
      console.log('📊 Conexão MongoDB fechada');
      process.exit(0);
    });
  });
});

module.exports = app;
