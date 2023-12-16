let gridSize = 16;
let gridLines = false;
let darkMode = localStorage.getItem('darkMode');
const modes = {
    color: false,
    rainbow: false,
    darken: false,
    lighten: false,
    eraser: false,
};

const body = document.querySelector('body');
const gridContainer = document.querySelector('#grid');
const darkModeCheckbox = document.querySelector("#dark-mode-checkbox");
const colorPicker = document.querySelector('#colors');
const eraserIcon = document.querySelector('#eraser');
const rainbowButton = document.querySelector('#rainbow');
const darkenButton = document.querySelector('#darken');
const lightenButton = document.querySelector('#lighten');
const toggleGridLinesButton = document.querySelector('#toggle-grid-lines');
const resetButton = document.querySelector('#reset');
const resizeSlider = document.querySelector('#resize-slider');
const resizeSliderLabel = document.querySelector('.resize-slider-label');
const sliderIncrease = document.querySelector('#increase');
const sliderDecrease = document.querySelector('#decrease');

const getColor = colorInitializer();


// Last user-preference for darkmode

function enableDarkMode () {
    localStorage.setItem('darkMode', 'enabled');

    darkModeCheckbox.checked = true;
    body.classList.add('dark-mode');
}

function disableDarkMode () {
    localStorage.setItem('darkMode', null);

    darkModeCheckbox.checked = false;
    body.classList.remove('dark-mode');
}

function createGrid (size) {
    const tileSize = ((gridContainer.clientWidth / size) / gridContainer.clientHeight) * 100;

    let newGrid = [];
    for (let i = 0 ; i < size ; i++) {
        for (let j = 0 ; j < size ; j++) {

            let tile = document.createElement('div');

            tile.classList.add('tile');

            if (j === (size - 1)) tile.classList.add('right-end-tile');
            if (i === (size - 1)) tile.classList.add('bottom-tile');

            tile.style.cssText = `width: ${tileSize}%;
                                  height: ${tileSize}%;`;

            tile.addEventListener('mousedown', setTileColor);
            tile.addEventListener('mouseenter', setTileColor);
            tile.addEventListener('touchstart', setTileColor);

            newGrid.push(tile);
        }
    }

    gridContainer.replaceChildren(...newGrid);
    if (gridLines) toggleGridLines(true);
}

function updateGrid (value) {
    gridSize = value;
    resizeSliderLabel.textContent = `${gridSize} x ${gridSize}`;
    createGrid(gridSize);
}

function enableTransitions () {
    body.style.setProperty('--transition-time', '0.4s');
}

function colorInitializer () {
    const colorMode = {
        initial: getComputedStyle(gridContainer).color,
        rainbow: 0,
    };

    return function (pick, currentColor) {
        let RGBArray = currentColor.split('(')[1].split(')')[0].split(',');
        let r = +RGBArray[0];
        let g = +RGBArray[1];
        let b = +RGBArray[2];
        let tenPercent = (255 * 0.1);

        if (!pick) return colorMode.initial;
        else if (pick === 'color') return colorPicker.value;
        else if (pick === 'rainbow') {
            colorMode.rainbow = (colorMode.rainbow + 8) % 360;
            return `hsl(${colorMode.rainbow}, 100%, 50%)`;
        }
        else if (pick === 'darken') {
            return `rgb(${r - tenPercent}, ${g - tenPercent}, ${b - tenPercent})`;
        }
        else if (pick === 'lighten') {
            return `rgb(${r + tenPercent}, ${g + tenPercent}, ${b + tenPercent})`;
        }
        else if (pick === 'eraser') {
            return getComputedStyle(gridContainer).backgroundColor;
        }
    };
}

function toggleGridLines (incoming) {
    const tiles = document.querySelectorAll('.tile');

    tiles.forEach(tile => {
        tile.classList.toggle('tile-border');
        if (tile.classList.contains('right-end-tile')) {
            tile.classList.toggle('right-tile-border');
        }
        if (tile.classList.contains('bottom-tile')) {
            tile.classList.toggle('bottom-tile-border');
        }
    });

    if (gridLines === true) {
        if (incoming) return;
        gridLines = false;
    }
    else gridLines = true;
}

function resetModes () {
    for (let mode in modes) {
        modes[mode] = false;
    }
    colorPicker.classList.add('color-picker-default');
}

function getMode () {
    for (let mode in modes) {
        if (modes[mode] === true) return mode;
    }
    return null;
}

function setTileColor (event) {
    let div = event;
    if (event instanceof Event) {
        if ((event.type === 'mouseenter' || event.type === 'mousedown') && event.buttons !== 1) return;
        event.preventDefault();

        div = event.target;
    }

    if (!div.classList.contains('tile')) return;
    prevDiv = div;

    let currentMode = getMode();
    let currentTileColor = getComputedStyle(div).backgroundColor;

    let color = getColor(currentMode, currentTileColor);

    div.style.backgroundColor = color;
}


// Event Listeners

darkModeCheckbox.addEventListener('change', event => {
    if (darkModeCheckbox.checked) {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
});

let prevDiv = null;
gridContainer.addEventListener('touchmove', event => {
    for (let i = 0 ; i < event.changedTouches.length ; i++) {
        let pX = event.changedTouches[i].pageX;
        let pY = event.changedTouches[i].pageY;
        let div = document.elementFromPoint(pX, pY);

        if (div === prevDiv) return;
        prevDiv = div;

        setTileColor(div);
    }
});

gridContainer.addEventListener('touchend', () => {
    prevDiv = null;
});

resizeSlider.addEventListener('change', event => {
    updateGrid(+event.target.value);
});

resizeSlider.addEventListener('input', event => {
    resizeSliderLabel.textContent = `${event.target.value} x ${event.target.value}`;
});

resetButton.addEventListener('click', () => {
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => tile.style.backgroundColor = getComputedStyle(gridContainer).backgroundColor);
});

colorPicker.addEventListener('change', () => {
    resetModes();
    colorPicker.classList.remove('color-picker-default');
    modes.color = true;
});

sliderIncrease.addEventListener('click', () => {
    resizeSlider.value = Math.min(64, +resizeSlider.value + 1);
    updateGrid(resizeSlider.value);
});

sliderDecrease.addEventListener('click', () => {
    resizeSlider.value = Math.max(4, +resizeSlider.value - 1);
    updateGrid(resizeSlider.value);
});

toggleGridLinesButton.addEventListener('click', () => {
    toggleGridLines();
});

rainbowButton.addEventListener('click', () => {
    resetModes();
    modes.rainbow = true;
});

darkenButton.addEventListener('click', () => {
    resetModes();
    modes.darken = true;
});

lightenButton.addEventListener('click', () => {
    resetModes();
    modes.lighten = true;
});

eraserIcon.addEventListener('click', () => {
    resetModes();
    modes.eraser = true;
});


// Start

if (darkMode === 'enabled') {
    enableDarkMode();
} else {
    disableDarkMode();
}

createGrid(gridSize);
enableTransitions();
