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
  new bs.MidiInstrument(1),
  new bs.MidiSequencer(1, [0], 500),
  new bs.MidiInstrument(3)
];

io.set('log level', 1); // disables debugging. this is optional. you may remove it if desired.

io.sockets.on('connection', function (socket) {
  socket.on('play', function (msg) {
    console.log("Play", msg);
    instruments[msg.instrument].play(msg.note, msg.velocity || 70, msg.timeInMs);
  });
  socket.on('changeSynthParameter', function (msg) {
    console.log("changeSynthParameter", msg);
    instruments[msg.instrument].changeController(msg.parameter, msg.value)
  });
  socket.on('stop', function (msg) {
    console.log("Stop", msg);
    instruments[msg.instrument].stop(msg.note);
  });
  socket.on('patch', function (patch) {
    console.log(patch.name);
    instruments.forEach(function (instrument) {
      instrument.stop();
    });

    instruments = patch.instruments.map(function (instrumentPatch) {
      if (instrumentPatch.sequence) {
        return new bs.MidiSequencer(instrumentPatch.channel, instrumentPatch.sequence, instrumentPatch.timePerStep);
      } else {
        return new bs.MidiInstrument(instrumentPatch.channel);
      }
    });

    console.log(instruments);
  });
  socket.on('disconnect', function () {
    console.log('disconnected');
  });
});


