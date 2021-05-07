const express = require('express');
const app = express();
const server = require('http').Server(app);
const { v4: uuid } = require('uuid');
const { Server } = require('socket.io');
const io = new Server(server);

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, { debug: true });

// Middleware
// use public dir
app.use(express.static('public'));
// use peerjs with express
app.use('/peerjs', peerServer);

// set render engine to ejs
app.set('view engine', 'ejs');

// auto redirect to a room
app.get('/', (req, res) => {
    res.redirect(`/${uuid()}`);
});

// upon redirection render room with provided roomId to setup peer on client-side
app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});

// Socket server (io) connection listener
io.on('connection', (socket) => {
    // listen when a user joins room
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
        socket.on('message', (msg) => {
            io.to(roomId).emit('create-message', msg);
        });
    });
});

server.listen(3000);