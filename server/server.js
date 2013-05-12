var fileServer = new (require('node-static').Server)('client');

var app = require('http').createServer(serveStaticFile).listen(8000)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , sugar = require('sugar');

function serveStaticFile(request, response) {
  fileServer.serve(request, response);
}

var serialport = require("serialport");
var bs = require('./body-synth');
var SerialPort = serialport.SerialPort; // localize object constructor
var portName = '/dev/ttyACM0';
var inst = new bs.MidiSequencer(0, [0, 12, 24, 19], 250);
var inst1 = new bs.MidiSequencer(2, [0, 19, 24, 12], 250);

io.set('log level', 1); // disables debugging. this is optional. you may remove it if desired.

var sp = new SerialPort(portName, {
  baudRate: 9600, // this is synced to what was set for the Arduino Code
  dataBits: 8, // this is the default for Arduino serial communication
  parity: 'none', // this is the default for Arduino serial communication
  stopBits: 1, // this is the default for Arduino serial communication
  flowControl: false, // this is the default for Arduino serial communication
  parser: serialport.parsers.readline("\n")
});


io.sockets.on('connection', function (socket) {
  // If socket.io receives message from the client browser then
  // this call back will be executed.
  socket.on('message', function (msg) {
    console.log(msg);
    console.log("Hossa");
  });
  // If a web browser disconnects from Socket.IO then this callback is called.
  socket.on('disconnect', function () {
    console.log('disconnected');
  });
});

var cleanData = ''; // this stores the clean data
var readData = '';  // this stores the buffer

var fXg = 0.0, fYg = 0.0, fZg = 0.0;
var alpha = 0.5;
var roll;
var pitch;

sp.on('data', function (data) { // call back when data is received
  var xyz = data.toString().split(':').map(function (s) {
    return parseFloat(s) / 256.0;
  });

  if (xyz.length < 3) {
    return;
  }

  //Low Pass Filter
  fXg = xyz[0] * alpha + (fXg * (1.0 - alpha));
  fYg = xyz[1] * alpha + (fYg * (1.0 - alpha));
  fZg = xyz[2] * alpha + (fZg * (1.0 - alpha));

  //Roll & Pitch Equations
  roll = (Math.atan2(-fYg, fZg) * 180.0) / Math.PI;
  pitch = (Math.atan2(fXg, Math.sqrt(fYg * fYg + fZg * fZg)) * 180.0) / Math.PI;
  //console.log(Math.round(roll) + ':' + Math.round(pitch));
  //io.sockets.emit('message', roll + ':' + pitch);
  io.sockets.emit('message', [pitch, roll].join(':'));
});

/**
 * 0 1 2 3 4 5 6 7 8 9 10 11 12
 * a h b c   d   e f   g     a
 */
var scale = [0, 3, 8, 10 ];

function findNearestNote(note, scale) {
  return scale.min(function (scaleNote) {
    return Math.abs(scaleNote - note);
  });
}

setInterval(function () {
  var note = findNearestNote(Math.floor(Math.max(Math.min(pitch, 80), 0) / 80 * 12), scale);
  console.log(note);
  inst.play(note + 40, (90-Math.max(roll, 0))*0.7, 50);
  inst1.play(note + 40,(90-Math.max(-roll, 0))*0.7, 50);
}, 500);
