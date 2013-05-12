var bs = require("./body-synth")
var inst = new bs.MidiSequencer(2, [
    0, 
    12, 
    24, 
    19
], 250);
inst.play(40, 100, 50);
setTimeout(function () {
}, 3200);
function playSeq() {
    var seq = [
        60, 
        72, 
        60, 
        75, 
        60, 
        79, 
        60, 
        75
    ];
    var seqPos = 0;
    setInterval(function () {
        inst.play(seq[seqPos], 100, 50);
        seqPos = (seqPos + 1) % seq.length;
    }, 200);
}
//@ sourceMappingURL=body-synth-test.js.map
