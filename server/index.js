const { Server } = require("socket.io");

const io = new Server(8000,{
    cors:true,
});


io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);
  socket.on("joinRoom", ({Username,RoomId}, callback) => {
  console.log( Username, RoomId);

  if (!Username || !RoomId) {
    return callback({ success: false, error: "Username and RoomId are required" });
  }

  socket.join(RoomId);
  console.log(`${Username} joined room ${RoomId}`);
  return callback({ success: true, roomId: RoomId });

});

socket.on("sendMessage",({roomId, message, Username},)=>{
  if (!roomId || !message) {
    console.log("RoomId and message are required");
    return;
  }

  console.log(`Message received in room ${roomId}: ${message}`);
  io.to(roomId).emit("receiveMessage", { roomId, message, Username });
})
});
