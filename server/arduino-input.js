var bs = require('./body-synth')
var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var portName = '/dev/ttyACM0';
var sp = new SerialPort(portName, {
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
    parser: serialport.parsers.readline("\n")
});
var inputs = [
    new bs.Accelerometer(), 
    new bs.Accelerometer()
];
var lastData = '';
sp.on('data', function (data) {
    lastData = data;
    var xyz = data.toString().split(';').forEach(function (singleInputData, i) {
        inputs[i].updateFromInputData(singleInputData);
    });
    var input = inputs[1];
});
var inst = new bs.MidiSequencer(0, [
    0, 
    12, 
    24, 
    19
], 250);
var inst1 = new bs.MidiSequencer(2, [
    0, 
    19, 
    24, 
    12
], 250);
var instSolo = new bs.MidiSequencer(3, [
    12
], 250);
var scale = [
    0, 
    3, 
    8, 
    10
];
var scaleSolo = [
    0, 
    2, 
    3, 
    5, 
    7, 
    8, 
    10, 
    12
];
function findNearestNote(note, scale) {
    return scale.min(function (scaleNote) {
        return Math.abs(scaleNote - note);
    });
}
setInterval(function () {
    console.log(lastData);
    var input = inputs[0];
    var note = findNearestNote(Math.floor(Math.max(Math.min(input.pitch, 80), 0) / 80 * 12), scale);
    console.log(note);
    inst.play(note + 40, (90 - Math.max(input.roll, 0)) * 0.7, 50);
    inst1.play(note + 40, (90 - Math.max(-input.roll, 0)) * 0.7, 50);
    var noteSolo = findNearestNote(Math.floor(Math.max(Math.min(inputs[1].pitch, 80), 0) / 80 * 12), scaleSolo);
    console.log(noteSolo);
    instSolo.play(noteSolo + 40, 100, 50);
}, 500);
//@ sourceMappingURL=arduino-input.js.map
