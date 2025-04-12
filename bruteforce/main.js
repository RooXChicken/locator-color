const userInput = document.getElementById("userInput");
const uuidLabel = document.getElementById("uuidLabel");

async function onLoad() {
    userInput.addEventListener("keyup", async function(_event) {
        if(_event.key.toLowerCase() == "enter") {
            await handleInput();
        }
    });
}

async function handleInput() {
    let _desiredColor = userInput.value.toLowerCase();
    let _color = "";
    let _uuid = "";

    while(_color.toLowerCase() != _desiredColor) {
        _uuid = crypto.randomUUID();
        let _hashCode = getHash(_uuid.toLowerCase());
        let _colors = getColors(_hashCode);

        let _hex = getHex(_colors[0], _colors[1], _colors[2]);
        _color = _hex[0] + _hex[1] + _hex[2];
    }

    uuidLabel.innerText = _uuid;
}

function getHex(_r, _g, _b) {
    // a fix because javascript doesn't have a trailing 0 when converting to hex
    let _colors = [_r, _g, _b];
    for(let i = 0; i < 3; i++) {
        let _hex = _colors[i].toString(16);
        if(_hex.length < 2) {
            _hex = "0" + _hex;
        }

        _colors[i] = _hex;
    }

    return _colors;
}

// Minecraft uses the UUID of the player to determine their color
// using the UUID.hashCode() function.

// the following functions are Java reimplementations of UUID in JS (well, only the bits we need)
// to ensure that we get the exact Java equivalent hash code, therefore the exact color

// (yes, i did spend an hour or two porting this to js. feel free to use :D)
function getHash(_uuid) {
    // n means BigInt(X);
    let _most = 0n;
    let _least = 0n;

    let _uuidArr = _uuid.split("-");

    _most = BigInt("0x" + _uuidArr[0]) & 4294967295n;
    _most <<= 16n;
    _most |= BigInt("0x" + _uuidArr[1]) & 65535n;
    _most <<= 16n;
    _most |= BigInt("0x" + _uuidArr[2]) & 65535n;

    _least = BigInt("0x" + _uuidArr[3]) & 65535n;
    _least <<= 48n;
    _least |= BigInt("0x" + _uuidArr[4]) & 281474976710655n;

    return hashUUID(_most ^ _least);
}

function hashUUID(_value) {
    return Number((_value ^ (_value >> 32n)) & 4294967295n) | 0;
}

function getColors(_number) {
    return [(_number >> 16) & 255, (_number >> 8) & 255, _number & 255];
}