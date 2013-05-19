///<reference path='./libs/node.d.ts' />
///<reference path='./libs/midi.d.ts' />

import http = module('http');
import midi = module('midi');

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


export class Accelerometer {
  alpha:number = 0.5;
  fg:number[] = [0,0,0]; // filtered Acceleration values
  roll:number;
  pitch:number;

  updateFromAcceleration(acc:number[]) {
    var fg = this.fg;
    fg.forEach((g, i) => {
      fg[i] = acc[i] * this.alpha + (g * (1.0 - this.alpha));
    });

    var fXg = fg[0], fYg = fg[1], fZg = fg[2];
    this.roll = (Math.atan2(-fYg, fZg) * 180.0) / Math.PI;
    this.pitch = (Math.atan2(fXg, Math.sqrt(fYg * fYg + fZg * fZg)) * 180.0) / Math.PI;
  }

  updateFromInputData(inputData:string) {
    this.updateFromAcceleration(inputData.split(':').map(parseFloat));
  }

}


// output.closePort();