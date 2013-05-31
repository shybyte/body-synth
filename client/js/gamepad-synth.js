var socket = io.connect();
socket.on('connect', function () {
    console.log("Connected");
});
var DPAD_POS_BY_BUTTONS = {
    "0010": 0,
    "1010": 1,
    "1000": 2,
    "1001": 3,
    "0001": 4,
    "0101": 5,
    "0100": 6,
    "0110": 7
};
function getDPadPos(gamepadButtons) {
    var TOP_BUTTON = gamepadSupport.BUTTON.DPAD.TOP;
    var dpadButtons = gamepadButtons.slice(TOP_BUTTON, TOP_BUTTON + 4);
    return DPAD_POS_BY_BUTTONS[dpadButtons.join('')];
}
var scale = [
    0, 
    2, 
    3, 
    5, 
    7, 
    8, 
    10, 
    12
];
var scaleSolo = [
    0, 
    2, 
    3, 
    5, 
    7, 
    8, 
    10, 
    12
];
var playSeq = false;
var currentNote;
function onGamepadInput(gamepad, gamepadID) {
    var dpadPos = getDPadPos(gamepad.buttons);
    if(gamepad.buttons[gamepadSupport.BUTTON.X]) {
        if(playSeq) {
            playSeq = false;
            socket.emit('stop', {
                instrument: 1
            });
        } else {
            playSeq = true;
        }
    }
    var inst = playSeq ? 1 : 0;
    if(dpadPos != null) {
        currentNote = 40 + scale[dpadPos];
        socket.emit('play', {
            instrument: inst,
            note: currentNote,
            timeInMs: 400
        });
    }
    if(!playSeq && currentNote && gamepad.buttons[gamepadSupport.BUTTON.LEFT_SHOULDER_TOP]) {
        socket.emit('play', {
            instrument: 0,
            note: currentNote + 7,
            timeInMs: 400
        });
    }
}
var tester = {
    updateGamepads: function (gamepads) {
        console.log(gamepads);
    },
    onInput: onGamepadInput,
    updateButton: function (button, buttonID, buttonName) {
        console.log(button, buttonID, buttonName);
    },
    updateAxis: function (value, gamepadId, labelId, stickId, horizontal) {
    }
};
gamepadSupport.init();
//@ sourceMappingURL=gamepad-synth.js.map
