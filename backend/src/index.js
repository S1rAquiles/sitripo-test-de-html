const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

// Asegurar directorio de uploads
const uploadsPath = path.join(__dirname, '..', UPLOAD_DIR);
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Configurar Multer para recibir múltiples archivos opcionales
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsPath),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${unique}-${safeName}`);
  }
});
const upload = multer({ storage });

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(`/${UPLOAD_DIR}`, express.static(uploadsPath));

// Rutas
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');

// Inyección de multer en la ruta de crear solicitud (para campos + archivos)
app.post('/solicitar', upload.any(), (req, res, next) => {
  // Reenviar a la ruta real una vez que multer haya procesado los archivos
  req.url = '/solicitar';
  publicRoutes.handle(req, res, next);
});

app.use(publicRoutes);
app.use(authRoutes);
app.use(adminRoutes);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});

