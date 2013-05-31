var fileServer = new (require('node-static').Server)('client');

var app = require('http').createServer(serveStaticFile).listen(8000)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , sugar = require('sugar');

var bs = require('./body-synth');

function serveStaticFile(request, response) {
  fileServer.serve(request, response);
}

var instruments = [
  new bs.MidiInstrument(0),
  new bs.MidiSequencer(0, [0, 12, 24, 19], 250),
  new bs.MidiInstrument(0),
  new bs.MidiSequencer(2, [0, 19, 24, 12], 250),
  new bs.MidiSequencer(3, [12], 250)
];

io.set('log level', 1); // disables debugging. this is optional. you may remove it if desired.

io.sockets.on('connection', function (socket) {
  socket.on('play', function (msg) {
    console.log("Play", msg);
    instruments[msg.instrument].play(msg.note, 70, msg.timeInMs);
  });
  socket.on('stop', function (msg) {
    console.log("Stop", msg);
    instruments[msg.instrument].stop(msg.note);
  });
  socket.on('disconnect', function () {
    console.log('disconnected');
  });
});


