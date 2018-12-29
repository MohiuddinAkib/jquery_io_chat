const express = require('express'),
  socket = require('socket.io'),
  debug = require('debug')('app:heart'),
  morgan = require('morgan'),
  app = express();

// Middlewares
if (app.get('env') === 'development') {
  app.use(morgan('dev'));
  debug('Morgan enabled...');
}

// Index route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// PORT
const PORT = process.env.PORT || 8000;
// Listen for request
const server = app.listen(PORT, () => {
  debug(`Server running on port ${PORT}`);
});

// Socket
const users = [];
const connections = [];
const io = socket(server);
io.sockets.on('connection', socket => {
  connections.push(socket);
  debug('Connected: %s sockets connected', connections.length);

  // Disconnect
  socket.on('disconnect', data => {
    users.splice(users.indexOf(socket.username), 1);
    updateUsernames();
    connections.splice(connections.indexOf(socket), 1);
    debug('Disconnected: %s sockets connected', connections.length);
  });

  // Send message event
  socket.on('send message', data => {
    io.sockets.emit('new message', { msg: data, user: socket.username });
  });

  // Send username event
  socket.on('new user', (data, cb) => {
    cb(true);
    socket.username = data;
    users.push(socket.username);
    updateUsernames();
  });

  function updateUsernames() {
    io.sockets.emit('get users', users);
  }
});
