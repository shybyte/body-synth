var midi = require('midi');

// Set up a new output.
var output = new midi.output();

// Count the available output ports.
console.log(output.getPortCount());

// Get the name of a specified output port.
console.log(output.getPortName(0));

// Open the first available output port.
output.openPort(0);

// Send a MIDI message.
//output.sendMessage([0xC0,1]);

setTimeout(function () {
  output.sendMessage([0x90, 68, 127]);
  // output.sendMessage([0x92, 64, 127]);
  setTimeout(function () {
    output.sendMessage([0x90, 68, 0]);
    //output.sendMessage([0x92, 64, 20]);
    setTimeout(function () {
      output.closePort();

    }, 1000)
  }, 1000);
}, 200);






