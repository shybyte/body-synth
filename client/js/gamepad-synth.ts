///<reference path='../libs/gamepad.d.ts' />
///<reference path='../libs/socket.io.d.ts' />

var socket = io.connect();
socket.on('connect', function () {
  console.log("Connected");
});

var DPAD_POS_BY_BUTTONS = {"0010": 0, "1010": 1, "1000": 2, "1001": 3, "0001": 4, "0101": 5, "0100": 6, "0110": 7}

function getDPadPos(gamepadButtons:number[]):number {
  var TOP_BUTTON = gamepadSupport.BUTTON.DPAD.TOP;
  var dpadButtons = gamepadButtons.slice(TOP_BUTTON, TOP_BUTTON + 4);
  return DPAD_POS_BY_BUTTONS[dpadButtons.join('')];
}

/**
 * 0 1 2 3 4 5 6 7 8 9 10 11 12
 * a b h c   d   e f   g     a
 */
var scale = [0, 2, 3, 5, 7, 8, 10, 12 ];
var scaleSolo = [0, 2, 3, 5, 7, 8, 10, 12];

var playSeq = false;
var currentNote;
var currentNoteSolo;
function onGamepadInput(gamepad, gamepadID) {
  var dpadPos = getDPadPos(gamepad.buttons);

  if (gamepad.buttons[gamepadSupport.BUTTON.X]) {
    if (playSeq) {
      playSeq = false;
      socket.emit('stop', {
        instrument: 1
      });
    } else {
      playSeq = true;
    }
  }

  var inst = playSeq ? 1 : 0

  if (dpadPos != null) {
    currentNote = 40 + scale[dpadPos];
    socket.emit('play', {
      instrument: inst,
      note: currentNote,
      velocity: 60,
      timeInMs: 400
    });
  }

  if (!playSeq && currentNote && gamepad.buttons[gamepadSupport.BUTTON.LEFT_SHOULDER_TOP]) {
    socket.emit('play', {
      instrument: 0,
      note: currentNote + 7,
      velocity: 30,
      timeInMs: 400
    });
  }

  var ux = gamepad.axes[2];
  var uy = -gamepad.axes[3];
  var ul = Math.sqrt(ux * ux + uy * uy);
  if (ul > 0.5) {
    var angle = uy > 0 ? Math.acos(ux / ul) : Math.PI * 2 - Math.acos(ux / ul);
    var stick2Pos = Math.round((Math.PI * 5 - angle) % (Math.PI * 2) / (2 * Math.PI) * 8) % 8;
    console.log(angle, stick2Pos);
    currentNoteSolo = 52 + scale[stick2Pos];
    socket.emit('play', {
      instrument: 2,
      note: currentNoteSolo,
      velocity: 50,
      timeInMs: 1000
    });
  } else {

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




