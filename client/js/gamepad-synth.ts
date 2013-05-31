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

var lastDPadPos;
function onGamepadInput(gamepad, gamepadID) {
  var dpadPos = getDPadPos(gamepad.buttons);

  if (lastDPadPos != null && dpadPos != lastDPadPos) {
    socket.emit('stop', {
      instrument: 0,
      note: 40 + lastDPadPos
    });
  }

  if (dpadPos != null) {
    socket.emit('play', {
      instrument: 0,
      note: 40 + dpadPos
    });
  }

  lastDPadPos = dpadPos;
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
    //console.log(value, gamepadId, labelId, stickId, horizontal);
  }
}

gamepadSupport.init();




