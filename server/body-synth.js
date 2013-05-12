
var midi = require("midi")
var output = new midi.output();
output.openPort(0);
var MidiInstrument = (function () {
    function MidiInstrument(channel) {
        this.channel = channel;
    }
    MidiInstrument.prototype.play = function (note, velocity, timeInMs) {
        if (typeof velocity === "undefined") { velocity = 90; }
        if (typeof timeInMs === "undefined") { timeInMs = 1000; }
        var _this = this;
        output.sendMessage([
            0x90 + this.channel, 
            note, 
            velocity
        ]);
        setTimeout(function () {
            output.sendMessage([
                0x90 + _this.channel, 
                note, 
                0
            ]);
            setTimeout(function () {
            }, 1000);
        }, timeInMs);
    };
    return MidiInstrument;
})();
exports.MidiInstrument = MidiInstrument;
var MidiSequencer = (function () {
    function MidiSequencer(channel, seq, speed) {
        this.channel = channel;
        this.seq = seq;
        this.speed = speed;
        this.pos = 0;
        this.inst = new MidiInstrument(channel);
    }
    MidiSequencer.prototype.play = function (baseNote, velocity, timeInMs) {
        if (typeof velocity === "undefined") { velocity = 90; }
        if (typeof timeInMs === "undefined") { timeInMs = 100; }
        var _this = this;
        if(!this.interval) {
            this.interval = setInterval(function () {
                _this.inst.play(_this.seq[_this.pos] + _this.baseNote, _this.velocity, _this.timeInMs);
                _this.pos = (_this.pos + 1) % _this.seq.length;
            }, this.speed);
        }
        this.baseNote = baseNote;
        this.velocity = velocity;
        this.timeInMs = velocity;
    };
    return MidiSequencer;
})();
exports.MidiSequencer = MidiSequencer;
//@ sourceMappingURL=body-synth.js.map
