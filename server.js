const express = require('express')
const app = express()
const fs = require('fs')

// https
const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};
const server = require('https').Server(options, app)


const io = require('socket.io')(server)
const uuid = require('uuid')

// redirection
var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'].split(':')[0] + ":3001" + req.url });
    res.end();
}).listen(3000);

// ejs
app.set('view engine', 'ejs')
app.use(express.static('public'))

// Peerjs
var ExpressPeerServer = require('peer').ExpressPeerServer
app.use('/peer', ExpressPeerServer(server, {debug:true}))

app.get('/', (req, res) => {
    res.render('home', {
        newRoomId: uuid.v4(),
        rooms: rooms
    })
})

app.get('/new-room', (req, res) => {
    res.redirect('/' + uuid.v4())
})

app.get('/:room', (req, res) => {
    res.render('room', {roomId: req.params.room})
})

// mechanics
var rooms = {}

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        console.log(roomId, userId)
        socket.join(roomId)
        if(!(roomId in rooms)) {
            rooms[roomId] = []
        }
        rooms[roomId].push(userId)

        socket.to(roomId).broadcast.emit('user-connected', userId)
        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
            if(roomId in rooms && rooms[roomId].includes(userId)) {
                rooms[roomId].splice(rooms[roomId].indexOf(userId), 1)
                if(rooms[roomId].length == 0) {
                    delete rooms[roomId];
                }
            }
        })
    })
})

server.listen(3001)