import { io } from 'socket.io-client'

export const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
  autoConnect: false,
  withCredentials: true,
})

export const connectSocket = (token) => {
  socket.auth = { token }
  if (!socket.connected) socket.connect()
}

export const connectSocketAsTable = (tableId) => {
  socket.auth = {}
  socket.io.opts.query = { tableId }
  if (!socket.connected) socket.connect()
}

export const disconnectSocket = () => socket.disconnect()

export const EVENTS = {
  ORDER_NEW:              'order:new',
  ORDER_ITEM_CHANGED:     'order:item:statusChanged',
  ORDER_ITEM_COMPLETED:   'order:item:completed',
  INVOICE_UPDATED:        'invoice:updated',
  INVOICE_LOCKED:         'invoice:locked',
  TABLE_STATUS_CHANGED:   'table:statusChanged',
  // emit from client
  ORDER_SUBMIT:           'order:submit',
  ITEM_START_COOKING:     'orderItem:startCooking',
  ITEM_COMPLETE:          'orderItem:complete',
}
