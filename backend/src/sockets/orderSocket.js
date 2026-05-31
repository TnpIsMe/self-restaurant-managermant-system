export function registerOrderHandlers(io, socket) {
  // Table tablet gửi order lên → bếp được thông báo
  socket.on('order:submit', ({ tableId, orderId, banMa }) => {
    io.to('kitchen').emit('order:new', { tableId, orderId, banMa })
    io.to('cashier').emit('invoice:updated', { tableId })
  })

  // Table tham gia room của mình
  socket.on('table:join', ({ tableId }) => {
    socket.join(`table:${tableId}`)
  })
}
