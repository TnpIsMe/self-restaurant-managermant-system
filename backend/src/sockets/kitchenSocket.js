export function registerKitchenHandlers(io, socket) {
  // Đầu bếp bắt đầu làm → notify table
  socket.on('orderItem:startCooking', ({ orderId, itemId, tableId }) => {
    io.to(`table:${tableId}`).emit('order:item:statusChanged', {
      orderId, itemId, newStatus: 'DANG_LAM',
    })
  })

  // Đầu bếp hoàn tất → notify table + cashier
  socket.on('orderItem:complete', ({ orderId, itemId, tableId }) => {
    io.to(`table:${tableId}`).emit('order:item:completed', { orderId, itemId })
    io.to(`table:${tableId}`).emit('invoice:updated', { tableId })
    io.to('cashier').emit('invoice:updated', { tableId })
  })
}
