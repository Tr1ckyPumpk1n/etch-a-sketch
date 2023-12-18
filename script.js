let gridSize = 16;
let gridLines = false;
let rainbow = 0;
let darkMode = localStorage.getItem('darkMode');        // Last user-preference for darkmode. Doesn't store in form of cookies or anything, only stores locally in browser
const modes = {
    color: false,
    rainbow: false,
    darken: false,
    lighten: false,
    eraser: false,
};

const body = document.querySelector('body');
const allContainer = document.querySelector('.container');
const gridContainer = document.querySelector('#grid');
const darkModeCheckbox = document.querySelector("#dark-mode-checkbox");
const colorPicker = document.querySelector('#colors');
const eraserContainer = document.querySelector('.rubber');
const rainbowButton = document.querySelector('#rainbow');
const darkenButton = document.querySelector('#darken');
const lightenButton = document.querySelector('#lighten');
const toggleGridLinesButton = document.querySelector('#toggle-grid-lines');
const resetButton = document.querySelector('#reset');
const resizeSlider = document.querySelector('#resize-slider');
const resizeSliderLabel = document.querySelector('.resize-slider-label');
const sliderIncrease = document.querySelector('#increase');
const sliderDecrease = document.querySelector('#decrease');
const risingSun = document.querySelector('.rising-sun');
const risingMoon = document.querySelector('.rising-moon');


function enableDarkMode () {
    localStorage.setItem('darkMode', 'enabled');        // Storing user's dark mode preference for next page load

    darkModeCheckbox.checked = true;                // Activating dark mode checbox to trigger the switching to dark mode
    body.classList.add('body-dark-mode');
    allContainer.classList.add('container-dark-mode');
    gridContainer.classList.add('grid-dark-mode');

    risingMoon.classList.add('fly-up');
    risingSun.classList.remove('fly-up');
}

function disableDarkMode () {
    localStorage.setItem('darkMode', null);        // Storing user's dark mode preference for next page load

    darkModeCheckbox.checked = false;               // Activating dark mode checbox to trigger the switching to light mode
    body.classList.remove('body-dark-mode');
    allContainer.classList.remove('container-dark-mode');
    gridContainer.classList.remove('grid-dark-mode');

    risingMoon.classList.remove('fly-up');
    risingSun.classList.add('fly-up');
}

function createGrid (size) {
    const tileSize = ((gridContainer.clientWidth / size) / gridContainer.clientHeight) * 100;       // Get individual 'div' size making it possible to fit all required divs in grid

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

    gridContainer.replaceChildren(...newGrid);              // In case of grid change no need to remove every div one by one, replace them instead
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

function getColor (pick, currentColor) {
    let RGBArray = currentColor.split('(')[1].split(')')[0].split(',');             // Getting computed style color returns a string in 'rgb(r,g,b)' format
    let r = +RGBArray[0];
    let g = +RGBArray[1];
    let b = +RGBArray[2];
    let tenPercent = (255 * 0.1);

    if (!pick) return getComputedStyle(gridContainer).color;
    else if (pick === 'color') return colorPicker.value;
    else if (pick === 'rainbow') {
        rainbow = (rainbow + 8) % 360;
        return `hsl(${rainbow}, 100%, 50%)`;
    }
    else if (pick === 'darken') {
        return `rgb(${r - tenPercent}, ${g - tenPercent}, ${b - tenPercent})`;
    }
    else if (pick === 'lighten') {
        return `rgb(${r + tenPercent}, ${g + tenPercent}, ${b + tenPercent})`;
    }
    else if (pick === 'eraser') {
        return 'inherit';
    }
};

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
    else {
        gridLines = true;
    }
}

function resetModes () {
    for (let mode in modes) {
        modes[mode] = false;
    }

    [ rainbowButton, darkenButton, lightenButton, eraserContainer ].forEach( button => {
        button.classList.remove('active-button');
    });

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
gridContainer.addEventListener('touchmove', event => {                  // On grid container because 'touchmove' doesn't work as required if put on individual divs
    for (let i = 0 ; i < event.changedTouches.length ; i++) {
        let pX = event.changedTouches[i].pageX;
        let pY = event.changedTouches[i].pageY;
        let div = document.elementFromPoint(pX, pY);                    // Getting individual div/element inside container from the location X/Y recieved from grid container

        if (div === prevDiv) return;
        prevDiv = div;

        setTileColor(div);
    }
});

gridContainer.addEventListener('touchend', () => {
    prevDiv = null;
});

resizeSlider.addEventListener('change', event => {              // Only recreate grid when the user has surely selected a value not while dragging the slider
    updateGrid(+event.target.value);
});

resizeSlider.addEventListener('input', event => {                                           // Update the grid size numbers in real time
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
    if (gridLines) toggleGridLinesButton.classList.add('active-button');
    else toggleGridLinesButton.classList.remove('active-button');
});

rainbowButton.addEventListener('click', () => {
    resetModes();
    modes.rainbow = true;
    rainbowButton.classList.add('active-button');
});

darkenButton.addEventListener('click', () => {
    resetModes();
    modes.darken = true;
    darkenButton.classList.add('active-button');
});

lightenButton.addEventListener('click', () => {
    resetModes();
    modes.lighten = true;
    lightenButton.classList.add('active-button');
});

eraserContainer.addEventListener('click', () => {
    resetModes();
    modes.eraser = true;
    eraserContainer.classList.add('active-button');
});


// Start

if (darkMode === 'enabled') {               // On page load apply user's lastly prefered dark mode without transitions
    enableDarkMode();
} else {
    disableDarkMode();
}

createGrid(gridSize);                       // Default 16 x 16 grid
enableTransitions();
