const locatorIcon = document.getElementById("icon");
const locatorIconOutline = document.getElementById("iconOutline");
const locatorIconTint = document.getElementById("iconTint");
const locatorBar = document.getElementById("bar");

const userInput = document.getElementById("userInput");
const colorLabel = document.getElementById("color");

const apiURL = "https://playerdb.co/api/player/minecraft/";

const barWidth = 74*4; // in pixels
var mouseX = 0;

async function onLoad() {
    window.addEventListener("mousemove", (_event) => {
        mouseX = _event.clientX;
        positionLocatorIcon();
    });

    window.visualViewport.addEventListener("resize", positionLocatorIcon);
    positionLocatorIcon();

    userInput.addEventListener("keyup", async function(_event) {
        if(_event.key.toLowerCase() == "enter") {
            await handleInput();
        }
    });
}

function positionLocatorIcon() {
    locatorIconTint.style.top = (locatorBar.getBoundingClientRect().top - 2) + "px";

    let _viewWidth = window.visualViewport.width;
    let _barCenter = locatorBar.getBoundingClientRect().left + barWidth/2 + 16;
    let _mousePosRel = (mouseX - (_viewWidth / 2)) * (barWidth / _viewWidth);

    locatorIconTint.style.left = (_barCenter + _mousePosRel) + "px";

    locatorIconOutline.style.top = locatorIconTint.style.top;
    locatorIconOutline.style.left = locatorIconTint.style.left;
}

async function handleInput() {
    let _uuid = "";
    if(userInput.value.length < 17) {
        const url = apiURL + userInput.value;
        const response = JSON.parse(await (await fetch(url)).text());
        
        if(response.code != "player.found") {
            alert("This player does not exist!");
            return;
        }
        
        _uuid = response.data.player.id;
    }
    else {
        _uuid = userInput.value;
    }

    let _hashCode = getHash(_uuid.toLowerCase());
    let _colors = getColors(_hashCode);

    setColor(_colors[0], _colors[1], _colors[2]);
}

function setColor(_r, _g, _b) {
    document.body.style.setProperty("--icon-color", `rgb(${_r}, ${_g}, ${_b})`);

    // set text color to the depend on the brightness of the color
    // helps text be more readable

    let _textColor = Math.floor((_r + _g + _b) / 3);
    if(_textColor > 128) {
        _textColor = 0;
    }
    else {
        _textColor = 255;
    }

    document.body.style.setProperty("--text-color", `rgb(${_textColor}, ${_textColor}, ${_textColor})`);

    let _colors = getHex(_r, _g, _b);
    colorLabel.innerText = `#${_colors[0]}${_colors[1]}${_colors[2]}`;
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