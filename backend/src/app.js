import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { router } from './routes/index.js'
import { errorHandler } from './middleware/errorHandler.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      imgSrc: ["'self'", 'data:', 'http://localhost:3000', 'https://self-restaurant-managermant-system.vercel.app'],
    },
  },
}))
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://self-restaurant-managermant-system.vercel.app',
    ]
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false }))
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true }))

// Serve static files
app.use(express.static(path.join(__dirname, '../public')))
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')))

// Multer config
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads')),
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.random().toString(36).substr(2, 9)
      cb(null, unique + path.extname(file.originalname))
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp)$/i
    if (allowed.test(file.originalname)) cb(null, true)
    else cb(new Error('Chỉ cho phép ảnh (jpg, png, gif, webp)'))
  },
})

// Upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  console.log('📤 Upload request:', req.file?.filename)
  if (!req.file) return res.status(400).json({ message: 'Không có file' })
  const fileUrl = `/uploads/${req.file.filename}`
  console.log('✅ Upload success:', fileUrl)
  res.json({ url: fileUrl, filename: req.file.filename })
})

// Health check trước khi mount routes
app.get('/api/health', (_, res) => res.json({ ok: true, ts: new Date().toISOString() }))

app.use('/api', router)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} không tồn tại` })
})

app.use(errorHandler)

export default app
