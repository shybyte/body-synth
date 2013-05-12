///<reference path='./libs/node.d.ts' />
///<reference path='./libs/midi.d.ts' />

import http = module("http");
import midi = module("midi");

var output = new midi.output();
output.openPort(0);

export interface Instrument {
  play(note:number, velocity:number, timeInMs:number);
}

export class MidiInstrument implements Instrument {
  constructor(public channel:number) {
  }

  play(note:number, velocity?:number = 90, timeInMs?:number = 1000) {
    output.sendMessage([0x90 + this.channel, note, velocity]);
    //console.log('Play ' + note);
    setTimeout(() => {
      output.sendMessage([0x90 + this.channel, note, 0]);
      setTimeout(function () {
      }, 1000);
    }, timeInMs);
  }
}


export class MidiSequencer implements Instrument {
  inst:Instrument;
  pos:number = 0;
  baseNote:number;
  velocity:number;
  timeInMs:number;
  interval;

  constructor(private channel:number, private seq:number[], private speed:number) {
    this.inst = new MidiInstrument(channel);
  }

  play(baseNote:number, velocity?:number = 90, timeInMs?:number = 100) {
    if (!this.interval) {
      this.interval = setInterval(() => {
        this.inst.play(this.seq[this.pos] + this.baseNote, this.velocity, this.timeInMs);
        this.pos = (this.pos + 1) % this.seq.length;
      }, this.speed);
    }
    this.baseNote = baseNote;
    this.velocity = velocity;
    this.timeInMs = velocity;
  }
}


// output.closePort();