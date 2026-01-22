import http from 'http';
import express from 'express';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    credentials: true,
    origin: "http://localhost:5173",
    methods:['GET','POST']
  },
});

const onlineUsers = {};

function getReceiverSocketId(receiverId) {
    return onlineUsers[receiverId];
}
io.on("connection", (socket) => {

    console.log("User connected", socket.id);
    const userId = socket.handshake.query.userId;
    if(userId){
        onlineUsers[userId] = socket.id;
    }

    io.emit('send-online-users', Object.keys(onlineUsers));
    socket.on('disconnect', () => {
        delete onlineUsers[userId];
        console.log('User disconnected!!!');
    })
})
export { app, server, io , getReceiverSocketId};