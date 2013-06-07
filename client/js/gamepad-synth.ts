///<reference path='../libs/gamepad.d.ts' />
///<reference path='../libs/socket.io.d.ts' />

var socket = io.connect();
socket.on('connect', function () {
  console.log("Connected");
});

function stopNote(instrument, note) {
  socket.emit('stop', {
    instrument: instrument,
    note: note
  });
}

class Stick {
  private velocity:number;
  private currentNote:number;
  private currentShoulderNote:number;
  private lastNote:number;
  private inSequencerMode = false;

  constructor(private stickNumber:number, private instruments:number[], private baseNote:number, private scale:number[]) {
  }

  onInput(gamepad) {
    if (gamepad.buttons[10 + this.stickNumber]) {
      if (this.inSequencerMode) {
        socket.emit('stop', {
          instrument: this.instruments[1]
        });
      }
      this.inSequencerMode = !this.inSequencerMode;
    }
    var instrument = this.instruments[this.inSequencerMode ? 1 : 0];
    var x = gamepad.axes[0 + this.stickNumber * 2];
    var y = gamepad.axes[1 + this.stickNumber * 2];
    this.velocity = Math.sqrt(x * x + y * y);
    if (this.velocity > 0.3) {
      var angle = y < 0 ? Math.acos(x / this.velocity) : Math.PI * 2 - Math.acos(x / this.velocity);
      var pos = Math.round((Math.PI * 5 - angle) % (Math.PI * 2) / (2 * Math.PI) * 8) % 8;
      var note = this.baseNote + this.scale[pos];
      if (note != this.currentNote) {
        stopNote(instrument, this.currentNote);
      }
      this.currentNote = note;
      socket.emit('play', {
        instrument: instrument,
        note: note,
        velocity: 70 * (this.inSequencerMode ? 1 : this.velocity),
        timeInMs: -1
      });
      this.lastNote = this.currentNote;
    } else if (!this.inSequencerMode && this.currentNote) {
      stopNote(instrument, this.currentNote);
      this.currentNote == null;
    }

    var shoulderButton = gamepad.buttons[gamepadSupport.BUTTON.LEFT_SHOULDER_TOP + this.stickNumber];
    if (!this.inSequencerMode && this.lastNote && shoulderButton) {
      var newShoulderNote = this.lastNote + 7;
      if (newShoulderNote != this.lastNote && this.lastNote != null) {
        stopNote(instrument, this.currentShoulderNote);
      }
      this.currentShoulderNote = newShoulderNote;
      socket.emit('play', {
        instrument: instrument,
        note: this.currentShoulderNote,
        velocity: 70,
        timeInMs: -1
      });
    }
    if (!this.inSequencerMode && !shoulderButton && this.currentShoulderNote) {
      stopNote(instrument, this.currentShoulderNote);
      this.currentShoulderNote = null;
    }

    var shoulderButtonBottom = gamepad.buttons[gamepadSupport.BUTTON.LEFT_SHOULDER_TOP + this.stickNumber + 2];
    socket.emit('changeSynthParameter', {
      instrument: instrument,
      parameter: 74,
      value: 127 - shoulderButtonBottom * 120
    });

  }
}

var DPAD_POS_BY_BUTTONS = {"0010": 0, "1010": 1, "1000": 2, "1001": 3, "0001": 4, "0101": 5, "0100": 6, "0110": 7}

function getDPadPos(gamepadButtons:number[]):number {
  var TOP_BUTTON = gamepadSupport.BUTTON.DPAD.TOP;
  var dpadButtons = gamepadButtons.slice(TOP_BUTTON, TOP_BUTTON + 4);
  return DPAD_POS_BY_BUTTONS[dpadButtons.join('')];
}

interface InstrumentPatch {
  channel: number;
  baseNote: number;
  scale: number[];
  sequence?: number[];
  timePerStep?: number;
}

/**
 * 0 1 2 3 4 5 6 7 8 9 10 11 12
 * a b h c   d   e f   g     a
 */

interface Patch {
  name: string;
  instruments: InstrumentPatch[];
}

var bass1:InstrumentPatch = {
  channel: 1,
  baseNote: 33,
  scale: [0, 2, 3, 5, 7, 8, 10, 12 ]
}

var sequencer1:InstrumentPatch = {
  channel: 1,
  baseNote: 33,
  scale: [0, 2, 3, 5, 7, 8, 10, 12 ],
  sequence: [0, 12],
  timePerStep: 500
}

var instrumentPatchViolinSolo = {
  channel: 3,
  baseNote: 69,
  scale: [0, 2, 3, 5, 7, 8, 10, -1]
}


var sequencer2:InstrumentPatch = {
  channel: 4,
  baseNote: 33,
  scale: [0, 2, 3, 5, 7, 8, 10, 12 ],
  sequence: [0, 12, 23, 12],
  timePerStep: 250
}

var instrumentPatchPadSolo = {
  channel: 5,
  baseNote: 69,
  scale: [0, 2, 3, 5, 7, 8, 10, 11]
}

var patches:Patch[] = [
  {name: 'Amazon', instruments: [bass1, sequencer1, instrumentPatchViolinSolo]},
  {name: 'Test', instruments: [bass1, sequencer2, instrumentPatchPadSolo]}
];

var sticks:Stick[];

function initWithPatch(patch:Patch) {
  console.log('Load Patch ' + patch.name);

  socket.emit('patch', patch);

  var instruments = patch.instruments;
  sticks = [
    new Stick(0, [0, 1], instruments[0].baseNote, instruments[0].scale),
    new Stick(1, [2], instruments[2].baseNote, instruments[2].scale)
  ];

}

var currentPatchIndex = 0;
initWithPatch(patches[currentPatchIndex]);

var playSeq = false;
var currentNote;

function onGamepadInput(gamepad, gamepadID) {
  var dTop = gamepad.buttons[gamepadSupport.BUTTON.DPAD.TOP];
  var dBottom = gamepad.buttons[gamepadSupport.BUTTON.DPAD.BOTTOM];
  if (dTop || dBottom) {
    if (dTop) {
      currentPatchIndex = (currentPatchIndex + 1) % patches.length;
    } else if (dBottom) {
      currentPatchIndex = (patches.length + currentPatchIndex - 1) % patches.length;
    }
    initWithPatch(patches[currentPatchIndex]);
  }
  else {
    sticks[0].onInput(gamepad);
    sticks[1].onInput(gamepad);
  }
}

var tester = {
  updateGamepads: function (gamepads) {
    console.log(gamepads);
  },
  onInput: onGamepadInput,
  updateButton: function (button, buttonID, buttonName) {
    //console.log(button, buttonID, buttonName);
  },
  updateAxis: function (value, gamepadId, labelId, stickId, horizontal) {
    //console.log("Axis");
    //console.log(value, gamepadId, labelId, stickId, horizontal);
  }
}

gamepadSupport.init();




