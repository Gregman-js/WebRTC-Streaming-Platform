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
const shortid = require('shortid');

// ports
var httpPort = 3000
var httpsPort = 3001

// args
var args = process.argv.slice(2);
args.forEach(arg => {
    if(arg.includes('--http-port=')) {
        httpPort = parseInt(arg.split('=')[1])
    }
    if(arg.includes('--https-port=')) {
        httpsPort = parseInt(arg.split('=')[1])
    }
})

// redirection
var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'].split(':')[0] + ":3001" + req.url });
    res.end();
}).listen(httpPort);

// ejs
app.set('view engine', 'ejs')
app.use(express.static('public'))

// Peerjs
var ExpressPeerServer = require('peer').ExpressPeerServer
app.use('/peer', ExpressPeerServer(server, {debug:true}))

app.get('/', (req, res) => {
    res.render('home', {
        newRoomId: shortid.generate(),
        rooms: rooms
    })
})

app.get('/new-room', (req, res) => {
    res.redirect('/' + shortid.generate())
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

server.listen(httpsPort)
console.log("Server started, port " + httpsPort);
console.log("Check: https://192.168.1.2:" + httpsPort);