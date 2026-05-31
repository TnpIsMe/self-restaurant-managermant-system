import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { registerOrderHandlers } from '../sockets/orderSocket.js'
import { registerKitchenHandlers } from '../sockets/kitchenSocket.js'

let io

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:3000', 'https://self-restaurant-managermant-system.vercel.app'],
      credentials: true
    },
    pingTimeout: 60000,
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    const tableId = socket.handshake.query?.tableId
    if (tableId) { socket.tableId = tableId; return next() }
    if (!token) return next(new Error('Authentication error'))
    try {
      socket.user = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
      next()
    } catch { next(new Error('Invalid token')) }
  })

  io.on('connection', (socket) => {
    if (socket.tableId) socket.join(`table:${socket.tableId}`)
    if (socket.user?.vaiTro === 'DAU_BEP' || socket.user?.vaiTro === 'BEP_TRUONG') socket.join('kitchen')
    if (socket.user?.vaiTro === 'THU_NGAN') socket.join('cashier')
    registerOrderHandlers(io, socket)
    registerKitchenHandlers(io, socket)
  })

  return io
}

export const getIO = () => io
