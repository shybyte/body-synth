var midi = require("midi");

var output = new midi.output();
output.openVirtualPort("node-midi Virtual Output");

function play() {
    output.sendMessage([144,64,90]);
    console.log("Played");
    setTimeout(function() {
        play();
    }, 2000);
}

play();
//setTimeout(function() {
//  output.closePort();
//}, 20000);
