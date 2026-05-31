import 'dotenv/config'
import http from 'http'
import app from './app.js'
import { initSocket } from './config/socket.js'
import prisma from './config/database.js'

const PORT = process.env.PORT || 5000

async function start() {
  try {
    // Test DB connection
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connected')

    const server = http.createServer(app)
    initSocket(server)

    server.listen(PORT, () => {
      console.log(`🚀 Backend running → http://localhost:${PORT}`)
      console.log(`   Health check  → http://localhost:${PORT}/api/health`)
      console.log(`   Environment   → ${process.env.NODE_ENV || 'development'}`)
    })

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n${signal} received — shutting down...`)
      await prisma.$disconnect()
      server.close(() => { console.log('Server closed'); process.exit(0) })
    }
    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT',  () => shutdown('SIGINT'))

  } catch (err) {
    console.error('❌ Failed to start server:', err.message)
    console.error('   Kiểm tra lại DATABASE_URL trong file .env')
    process.exit(1)
  }
}

start()
