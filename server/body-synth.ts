///<reference path='./libs/node.d.ts' />
///<reference path='./libs/midi.d.ts' />

import http = module('http');
import midi = module('midi');

var output = new midi.output();
output.openPort(0);

export interface Instrument {
  play(note:number, velocity:number, timeInMs:number);
  changeController(controller:number, value:number);
}

export class MidiInstrument implements Instrument {
  constructor(public channel:number) {
  }

  play(note:number, velocity?:number = 90, timeInMs?:number = 1000) {
    output.sendMessage([0x90 + this.channel - 1, note, velocity]);
    //console.log('Play ' + note);
    if (timeInMs > 0) {
      setTimeout(() => {
        output.sendMessage([0x90 + this.channel - 1, note, 0]);
      }, timeInMs);
    }
  }

  changeController(controller:number, value:number) {
    output.sendMessage([0xB0 + this.channel - 1, controller, value]);
  }

  stop(note:number) {
    output.sendMessage([0x90 + this.channel - 1, note, 0]);
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
    this.baseNote = baseNote;
    this.velocity = velocity;
    this.timeInMs = velocity;

    var playInternal = () => {
      this.inst.play(this.seq[this.pos] + this.baseNote, this.velocity * 1.2, this.timeInMs);
      this.pos = (this.pos + 1) % this.seq.length;
    };

    if (!this.interval) {
      this.interval = setInterval(playInternal, this.speed);
      playInternal();
    }
  }

  changeController(controller:number, value:number) {
    this.inst.changeController(controller, value);
  }

  stop(note?:number) {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.pos = 0;
  }

}


export class Accelerometer {
  alpha:number = 0.5;
  fg:number[] = [0, 0, 0]; // filtered Acceleration values
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