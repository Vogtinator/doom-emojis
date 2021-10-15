function contentForValue(v) {
      return ["👋🏻", "👋🏼", "👋🏽", "👋🏾", "👋🏿"][v];
}

class Checkboxland {
  constructor(props = {}) {
    if (typeof props.fillValue !== 'undefined') _checkForValidValue(props.fillValue);
    this.displayEl = document.querySelector(props.selector || '#checkboxland');
    this.dimensions = _textDimensionsToArray(props.dimensions || '8x8'); // The data object. Don't access this directly. Use methods like getData() and setData() instead.
    // Maybe we can restrict access to this variable in the future, using Proxies. See examples here:
    // https://github.com/bryanbraun/music-box-fun/commit/f399255261e9b8ab9fb8c10edbbedd55a639e9d1

    this._data = this.getEmptyMatrix({
      fillValue: props.fillValue || 0 });


    _createInitialCheckboxDisplay(this.displayEl, this._data);
  }

  getCheckboxValue(x, y) {
    const isWithinDisplay = x >= 0 && y >= 0 && x < this.dimensions[0] && y < this.dimensions[1];

    if (!isWithinDisplay) {
      throw new Error(`The location (x: ${x}, y: ${y}) is outside of this checkbox display`);
    }

    return this._data[y][x];
  }

  setCheckboxValue(x, y, newValue) {
    const isWithinDisplay = x >= 0 && y >= 0 && x < this.dimensions[0] && y < this.dimensions[1];

    _checkForValidValue(newValue);

    if (!isWithinDisplay) return;
    this._data[y][x] = newValue; // We can assume the checkboxEl exists because it's within the display.

    const checkboxEl = this.displayEl.children[y].children[x]; // Handle indeterminate newValues
    checkboxEl.innerText = contentForValue(newValue);
  }

  getData() {
    const clonedData = this._data.map(row => row.slice());

    return clonedData;
  }

  setData(data, options = {}) {
    const {
      x = 0,
      y = 0,
      fillValue } =
    options;
    const isFillValueProvided = typeof fillValue !== 'undefined';
    const colNum = this.dimensions[0];
    const rowNum = this.dimensions[1];

    _checkForValidMatrix(data);

    for (let rowIndex = 0; rowIndex < rowNum; rowIndex++) {
      for (let colIndex = 0; colIndex < colNum; colIndex++) {
        let isBeforeStartingXPos = colIndex < x;
        let isBeforeStartingYPos = rowIndex < y;
        let isBeyondProvidedXPlusData = colIndex >= x + data[0].length;
        let isBeyondProvidedYPlusData = rowIndex >= y + data.length;
        let isOutsideOfProvidedData = isBeforeStartingXPos || isBeforeStartingYPos || isBeyondProvidedXPlusData || isBeyondProvidedYPlusData;
        if (isOutsideOfProvidedData && !isFillValueProvided) continue;
        let valueToSet = isOutsideOfProvidedData ? fillValue : data[rowIndex - y][colIndex - x];
        this.setCheckboxValue(colIndex, rowIndex, valueToSet);
      }
    }
  }

  clearData() {
    const emptyMatrix = this.getEmptyMatrix();
    this.setData(emptyMatrix);
  } // This kind of method makes more sense as a plugin but I needed to
  // use it in the core library anyways so I decided to expose it here.


  getEmptyMatrix(options = {}) {
    const {
      fillValue = 0,
      width = this.dimensions[0],
      height = this.dimensions[1] } =
    options;
    const matrix = [];

    for (let i = 0; i < height; i++) {
      matrix[i] = [];

      for (let j = 0; j < width; j++) {
        matrix[i][j] = fillValue;
      }
    }

    return matrix;
  }

  static extend(pluginObj = {}) {
    const {
      name,
      exec,
      cleanUp } =
    pluginObj;

    if (!name || !exec) {
      throw new Error('Your plugin must have a "name" and an "exec" function.');
    }

    if (cleanUp) {
      exec.cleanUp = cleanUp;
    }

    this.prototype[name] = exec;
  }}

// Private helper functions

function _checkForValidValue(value) {
  if (value < 6) return;
  throw new Error(`${value} is not a valid checkbox value.`);
}

function _checkForValidMatrix(matrix) {
  if (Array.isArray(matrix) && Array.isArray(matrix[0])) return;
  throw new Error(`${matrix} is not a valid matrix.`);
}

function _textDimensionsToArray(textDimensions) {
  const errorMessage = 'The dimensions you provided are invalid.';
  if (typeof textDimensions !== 'string') throw new Error(errorMessage);
  const dimArray = textDimensions.split('x').map(val => Number(val));
  const isValid = dimArray.length === 2 && !isNaN(dimArray[0]) && !isNaN(dimArray[0]);
  if (!isValid) throw new Error(errorMessage);
  return textDimensions.split('x').map(val => Number(val));
}

function _createInitialCheckboxDisplay(displayEl, data) {
  displayEl.innerHTML = '';
  displayEl.style.overflowX = 'auto';
  displayEl.setAttribute('aria-hidden', true);
  data.forEach(rowData => {
    const rowEl = document.createElement('div');
    rowEl.style.lineHeight = 0.8;
    rowEl.style.whiteSpace = 'nowrap';
    rowData.forEach(cellData => {
      const checkboxEl = document.createElement('span');
      checkboxEl.style.margin = 0;
      checkboxEl.style.marginLeft = "-0.3em";
      checkboxEl.innerText = contentForValue(cellData);
      rowEl.appendChild(checkboxEl);
    });
    displayEl.appendChild(rowEl);
  });
}

const fiveBySeven = {
  '0': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 1, 1], [1, 0, 1, 0, 1], [1, 1, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  '1': [[0, 1, 0], [1, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [1, 1, 1]],
  '2': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [0, 0, 0, 0, 1], [0, 1, 1, 1, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 1]],
  '3': [[1, 1, 1, 1, 1], [0, 0, 0, 0, 1], [0, 0, 0, 1, 0], [0, 0, 1, 1, 0], [0, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  '4': [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 1], [0, 0, 0, 0, 1], [0, 0, 0, 0, 1], [0, 0, 0, 0, 1]],
  '5': [[1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 0], [0, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  '6': [[0, 0, 1, 1, 0], [0, 1, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  '7': [[1, 1, 1, 1, 1], [0, 0, 0, 0, 1], [0, 0, 0, 1, 0], [0, 0, 1, 0, 0], [0, 1, 0, 0, 0], [0, 1, 0, 0, 0], [0, 1, 0, 0, 0]],
  '8': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  '9': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 1], [0, 0, 0, 0, 1], [0, 0, 0, 1, 0], [0, 1, 1, 0, 0]],
  ':': [[0], [1], [0], [0], [0], [1], [0]],
  ' ': [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
  'A': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1]],
  'B': [[1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 0]],
  'C': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  'D': [[1, 1, 1, 0, 0], [1, 0, 0, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 1, 0], [1, 1, 1, 0, 0]],
  'E': [[1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 1]],
  'F': [[1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0]],
  'G': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 0], [1, 0, 1, 1, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 1]],
  'H': [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1]],
  'I': [[1, 1, 1], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [1, 1, 1]],
  'J': [[0, 0, 1, 1, 1], [0, 0, 0, 1, 0], [0, 0, 0, 1, 0], [0, 0, 0, 1, 0], [0, 0, 0, 1, 0], [1, 0, 0, 1, 0], [0, 1, 1, 0, 0]],
  'K': [[1, 0, 0, 0, 1], [1, 0, 0, 1, 0], [1, 0, 1, 0, 0], [1, 1, 0, 0, 0], [1, 0, 1, 0, 0], [1, 0, 0, 1, 0], [1, 0, 0, 0, 1]],
  'L': [[1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 1]],
  'M': [[1, 0, 0, 0, 1], [1, 1, 0, 1, 1], [1, 0, 1, 0, 1], [1, 0, 1, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1]],
  'N': [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 0, 0, 1], [1, 0, 1, 0, 1], [1, 0, 0, 1, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1]],
  'O': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  'P': [[1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0]],
  'Q': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 1, 0, 1], [1, 0, 0, 1, 0], [0, 1, 1, 0, 1]],
  'R': [[1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1]],
  'S': [[0, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [0, 1, 1, 1, 0], [0, 0, 0, 0, 1], [0, 0, 0, 0, 1], [1, 1, 1, 1, 0]],
  'T': [[1, 1, 1, 1, 1], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0]],
  'U': [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  'V': [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 0, 1, 0], [0, 0, 1, 0, 0]],
  'W': [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 1, 0, 1], [1, 0, 1, 0, 1], [0, 1, 0, 1, 0]],
  'X': [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 0, 1, 0], [0, 0, 1, 0, 0], [0, 1, 0, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1]],
  'Y': [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 0, 1, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0]],
  'Z': [[1, 1, 1, 1, 1], [0, 0, 0, 0, 1], [0, 0, 0, 1, 0], [0, 0, 1, 0, 0], [0, 1, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 1]],
  'a': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, 1, 1, 0], [0, 0, 0, 0, 1], [0, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1]],
  'b': [[1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 1, 1, 0], [1, 1, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 0]],
  'c': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, 1, 1, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  'd': [[0, 0, 0, 0, 1], [0, 0, 0, 0, 1], [0, 1, 1, 0, 1], [1, 0, 0, 1, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 1]],
  'e': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [0, 1, 1, 1, 0]],
  'f': [[0, 0, 1, 1, 0], [0, 1, 0, 0, 1], [0, 1, 0, 0, 0], [1, 1, 1, 0, 0], [0, 1, 0, 0, 0], [0, 1, 0, 0, 0], [0, 1, 0, 0, 0]],
  'g': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, 1, 1, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 1], [0, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  'h': [[1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 1, 1, 0], [1, 1, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1]],
  'i': [[0, 1, 0], [0, 0, 0], [1, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [1, 1, 1]],
  'j': [[0, 0, 0, 1], [0, 0, 0, 0], [0, 0, 1, 1], [0, 0, 0, 1], [0, 0, 0, 1], [1, 0, 0, 1], [0, 1, 1, 0]],
  'k': [[1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 1], [1, 0, 1, 0], [1, 1, 0, 0], [1, 0, 1, 0], [1, 0, 0, 1]],
  'l': [[1, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [1, 1, 1]],
  'm': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 1, 0, 1, 0], [1, 0, 1, 0, 1], [1, 0, 1, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1]],
  'n': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 0, 1, 1, 0], [1, 1, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1]],
  'o': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  'p': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0]],
  'q': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 1, 1, 0, 1], [1, 0, 0, 1, 1], [1, 1, 1, 1, 1], [0, 0, 0, 0, 1], [0, 0, 0, 0, 1]],
  'r': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 0, 1, 1, 0], [1, 1, 0, 0, 1], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0]],
  's': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, 1, 1, 0], [1, 0, 0, 0, 0], [0, 1, 1, 1, 0], [0, 0, 0, 0, 1], [1, 1, 1, 1, 0]],
  't': [[0, 1, 0, 0, 0], [0, 1, 0, 0, 0], [1, 1, 1, 0, 0], [0, 1, 0, 0, 0], [0, 1, 0, 0, 0], [0, 1, 0, 0, 1], [0, 0, 1, 1, 0]],
  'u': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 1, 1], [0, 1, 1, 0, 1]],
  'v': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 0, 1, 0], [0, 0, 1, 0, 0]],
  'w': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 1, 0, 1], [1, 0, 1, 0, 1], [0, 1, 0, 1, 0]],
  'x': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 0, 0, 0, 1], [0, 1, 0, 1, 0], [0, 0, 1, 0, 0], [0, 1, 0, 1, 0], [1, 0, 0, 0, 1]],
  'y': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 1], [0, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  'z': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [0, 0, 0, 1, 0], [0, 0, 1, 0, 0], [0, 1, 0, 0, 0], [1, 1, 1, 1, 1]],
  '`': [[1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
  '~': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, 0, 0, 0], [1, 0, 1, 0, 1], [0, 0, 0, 1, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
  '!': [[1], [1], [1], [1], [1], [0], [1]],
  '@': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [0, 0, 0, 0, 1], [0, 1, 1, 0, 1], [1, 0, 1, 0, 1], [1, 0, 1, 0, 1], [0, 1, 1, 1, 0]],
  '#': [[0, 1, 0, 1, 0], [0, 1, 0, 1, 0], [1, 1, 1, 1, 1], [0, 1, 0, 1, 0], [1, 1, 1, 1, 1], [0, 1, 0, 1, 0], [0, 1, 0, 1, 0]],
  '$': [[0, 0, 1, 0, 0], [0, 1, 1, 1, 1], [1, 0, 0, 0, 0], [0, 1, 1, 1, 0], [0, 0, 0, 0, 1], [1, 1, 1, 1, 0], [0, 0, 1, 0, 0]],
  '%': [[1, 1, 0, 0, 1], [1, 1, 0, 0, 1], [0, 0, 0, 1, 0], [0, 0, 1, 0, 0], [0, 1, 0, 0, 0], [1, 0, 0, 1, 1], [1, 0, 0, 1, 1]],
  '^': [[0, 0, 1, 0, 0], [0, 1, 0, 1, 0], [1, 0, 0, 0, 1], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
  '&': [[0, 1, 1, 0, 0], [1, 0, 0, 1, 0], [1, 0, 1, 0, 0], [0, 1, 0, 0, 0], [1, 0, 1, 0, 1], [1, 0, 0, 1, 0], [1, 1, 1, 0, 1]],
  '*': [[0, 0, 0, 0, 0], [0, 0, 1, 0, 0], [1, 0, 1, 0, 1], [0, 1, 1, 1, 0], [1, 0, 1, 0, 1], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0]],
  '(': [[0, 0, 1], [0, 1, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]],
  ')': [[1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 1, 0], [1, 0, 0]],
  '-': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
  '_': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 1, 1, 1, 1]],
  '+': [[0, 0, 0, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [1, 1, 1, 1, 1], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0]],
  '=': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
  '[': [[1, 1, 1], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 1, 1]],
  ']': [[1, 1, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [1, 1, 1]],
  '{': [[0, 0, 1], [0, 1, 0], [0, 1, 0], [1, 0, 0], [0, 1, 0], [0, 1, 0], [0, 0, 1]],
  '}': [[1, 0, 0], [0, 1, 0], [0, 1, 0], [0, 0, 1], [0, 1, 0], [0, 1, 0], [1, 0, 0]],
  '|': [[1], [1], [1], [1], [1], [1], [1]],
  '\\': [[1, 0, 0], [1, 0, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 0, 1], [0, 0, 1]],
  '/': [[0, 0, 1], [0, 0, 1], [0, 1, 0], [0, 1, 0], [0, 1, 0], [1, 0, 0], [1, 0, 0]],
  ';': [[0, 0], [0, 1], [0, 1], [0, 0], [0, 0], [0, 1], [1, 0]],
  '"': [[1, 0, 1], [1, 0, 1], [1, 0, 1], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
  "'": [[1, 1], [0, 1], [1, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
  ',': [[0, 0], [0, 0], [0, 0], [0, 0], [1, 1], [0, 1], [1, 0]],
  '.': [[0], [0], [0], [0], [0], [0], [1]],
  '<': [[0, 0, 0], [0, 0, 1], [0, 1, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 0, 0]],
  '>': [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 1, 0], [1, 0, 0], [0, 0, 0]],
  '?': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [0, 0, 0, 0, 1], [0, 0, 0, 1, 0], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0], [0, 0, 1, 0, 0]] };


function print(text, options = {}) {
  const {
    dataOnly = false,
    font = fiveBySeven,
    x = 0,
    y = 0,
    fillValue } =
  options;
  const isFillValueProvided = typeof fillValue !== 'undefined';
  const textArray = text.split('');
  const textMatrix = textArray.reduce((matrix, currentChar) => {
    const currentCharacterMatrix = font[currentChar];
    return _matrixConcat(matrix, currentCharacterMatrix);
  }, []); // Handle an edge-case where an empty string produces an empty
  // array instead of an empty matrix (which is what we'd prefer).

  if (textMatrix.length === 0) {
    textMatrix.push([]);
  }

  if (dataOnly) {
    if (!isFillValueProvided) return textMatrix;
    let dataMatrix = this.getEmptyMatrix({
      fillValue });

    textMatrix.forEach((rowData, rowIndex) => {
      rowData.forEach((cellValue, cellIndex) => {
        dataMatrix[rowIndex + y][cellIndex + x] = cellValue;
      });
    });
    return dataMatrix;
  }

  this.setData(textMatrix, {
    x,
    y,
    fillValue });

} // HELPER FUNCTIONS


function _matrixConcat(mat1, mat2) {
  if (mat1.length === 0) return mat2;
  const newMatrix = [];
  mat1.forEach((row, index) => {
    // We go row by row, concatenating mat1 to mat2.
    newMatrix.push( // the [0] puts a spacer between the two characters.
    row.concat([0]).concat(mat2[index]));
  });
  return newMatrix;
}

var print$1 = {
  name: 'print',
  exec: print };


let intervalId;

function marquee(newData, options = {}) {
  const {
    interval = 200,
    repeat = false,
    fillValue = 0,
    callback = () => {} } =
  options;
  const numberOfRows = this.dimensions[1];
  const numberOfColumns = this.dimensions[0];
  const totalIterations = numberOfColumns + newData[0].length;
  let currentIteration = 1;
  intervalId = setInterval(() => {
    const currentData = this.getData();

    for (let y = 0; y < numberOfRows; y++) {
      for (let x = 0; x < numberOfColumns; x++) {
        const finalColumn = x + 1 === numberOfColumns; // We only draw fresh checkboxes on the final column of the grid.
        // All other values simply get shifted to the left.

        if (finalColumn) {
          // Pull the value from newData. If this location in newData is undefined,
          // we assign a fillValue to fill the space until the animation is complete.
          const sourceColumnToDraw = currentIteration - (numberOfColumns - x);
          const newDataValue = !newData[y] ? fillValue : typeof newData[y][sourceColumnToDraw] === 'undefined' ? fillValue : newData[y][sourceColumnToDraw];
          this.setCheckboxValue(x, y, newDataValue);
        } else {
          // Shift an existing value to the left.
          this.setCheckboxValue(x, y, currentData[y][x + 1]);
        }
      }
    }

    if (currentIteration === totalIterations) {
      if (repeat) {
        currentIteration = 1;
      } else {
        clearInterval(intervalId);
        callback();
      }
    } else {
      currentIteration++;
    }
  }, interval);
}

function cleanUp() {
  clearInterval(intervalId);
}

var marquee$1 = {
  name: 'marquee',
  exec: marquee,
  cleanUp: cleanUp };


let intervalId$1;

function transitionWipe(newData, options = {}) {
  const {
    interval = 200,
    fillValue = 0,
    direction = 'ltr',
    callback = () => {} } =
  options;
  const numberOfRows = this.dimensions[1];
  const numberOfColumns = this.dimensions[0];
  const totalIterations = numberOfColumns + 1;
  let currentIteration = 1;
  intervalId$1 = setInterval(() => {
    let leadingEdgeIndex, writingEdgeIndex;

    switch (direction) {
      case 'ltr':
        leadingEdgeIndex = currentIteration - 1;
        writingEdgeIndex = leadingEdgeIndex - 1;
        break;

      case 'rtl':
        leadingEdgeIndex = numberOfColumns - currentIteration;
        writingEdgeIndex = leadingEdgeIndex + 1;
        break;}


    for (let y = 0; y < numberOfRows; y++) {
      for (let x = 0; x < numberOfColumns; x++) {
        // we only need to write to locations on the leading edge, or one spot
        // behind the leading edge. The values in all other locations stay the same.
        if (x === leadingEdgeIndex) {
          this.setCheckboxValue(x, y, 1);
        } else if (x === writingEdgeIndex) {
          // Pull the value from newData. If this location in newData is undefined,
          // we assign a fillValue to fill the space until the animation is complete.
          let newDataValue = !newData[y] ? fillValue : typeof newData[y][x] === 'undefined' ? fillValue : newData[y][x];
          this.setCheckboxValue(x, y, newDataValue);
        }
      }
    }

    if (currentIteration === totalIterations) {
      clearInterval(intervalId$1);
      callback();
    } else {
      currentIteration++;
    }
  }, interval);
}

function cleanUp$1() {
  clearInterval(intervalId$1);
}

var transitionWipe$1 = {
  name: 'transitionWipe',
  exec: transitionWipe,
  cleanUp: cleanUp$1 };


function dataUtils(actionName, matrix, options) {
  const actions = {
    invert,
    pad };

  return actions[actionName](matrix, options);
}

function invert(matrix) {
  return matrix.map(row => {
    return row.map(value => {
      return value ? 0 : 1;
    });
  });
}

function pad(matrix, options = {}) {
  const isPaddingAllSidesEqually = Number.isInteger(options.all);
  const topPadding = isPaddingAllSidesEqually ? options.all : options.top;
  const rightPadding = isPaddingAllSidesEqually ? options.all : options.right;
  const bottomPadding = isPaddingAllSidesEqually ? options.all : options.bottom;
  const leftPadding = isPaddingAllSidesEqually ? options.all : options.left; // Create a new matrix with left and right padding.

  let newMatrix = matrix.map(row => {
    let newRow = row;

    if (leftPadding) {
      newRow = [...Array(leftPadding).fill(0), ...newRow];
    }

    if (rightPadding) {
      newRow = [...newRow, ...Array(rightPadding).fill(0)];
    }

    return newRow;
  }); // Set up to add top and bottom padding.

  const newRowLength = newMatrix[0].length;

  const buildPaddingRows = (numberOfRows, rowLength) => {
    const paddingRows = [];

    for (let i = 0; i < numberOfRows; i++) {
      paddingRows.push(Array(rowLength).fill(0));
    }

    return paddingRows;
  };

  if (topPadding) {
    newMatrix = [...buildPaddingRows(topPadding, newRowLength), ...newMatrix];
  }

  if (bottomPadding) {
    newMatrix = [...newMatrix, ...buildPaddingRows(bottomPadding, newRowLength)];
  }

  return newMatrix;
}

var dataUtils$1 = {
  name: 'dataUtils',
  exec: dataUtils };


let handleFun = null;
let displayEl = null;

function onClick(callback) {
  displayEl = this.displayEl;
  handleFun = handleEvent.bind(this, callback);
  displayEl.addEventListener('click', handleFun);
}

function handleEvent(callback, event) {
  const coords = findCoodrs(displayEl, event.target);

  if (!coords) {
    return;
  }

  const result = {
    x: coords.x,
    y: coords.y,
    checkbox: event.target };


  if (typeof callback == 'function') {
    callback(result);
  } else if ('handleEvent' in callback && typeof callback.handleEvent == 'function') {
    callback.handleEvent(result);
  } else {
    throw new TypeError('Callback should be a function or an EventListener object');
  }
}

function findCoodrs(root, target) {
  for (let y = 0; y < root.children.length; y += 1) {
    const div = root.children[y];

    for (let x = 0; x < div.children.length; x += 1) {
      const checkbox = div.children[x];

      if (checkbox === target) {
        return {
          x,
          y };

      }
    }
  }

  return null;
}

function cleanUp$2() {
  displayEl.removeEventListener('click', handleFun);
}

var onClick$1 = {
  name: 'onClick',
  exec: onClick,
  cleanUp: cleanUp$2 };


let canvasEl;
let context;
let grayscaleThreshold;
function renderMediaAsCheckboxes(element, options = {}, checkboxland) {
  if (!canvasEl) {
    canvasEl = document.createElement('canvas');
    context = canvasEl.getContext('2d');
  }

  grayscaleThreshold = (options.threshold || 50) / 100 * 255; // Create a tiny canvas. Each pixel on the canvas will represent a checkbox.

  canvasEl.width = checkboxland.dimensions[0];
  canvasEl.height = checkboxland.dimensions[1]; // Clear the canvas before applying a new image. We use a white rectangle
  // in order for PNGs with transparency to appear over a white background
  // (which seems to be most appropriate in the use-cases I can think of).

  context.fillStyle = 'white';
  context.fillRect(0, 0, canvasEl.width, canvasEl.height); // Determine the ideal dimensions for our media, such that it fills
  // as much of the checkbox grid as possible without overflowing.

  const [mediaWidth, mediaHeight] = getMediaDimensions(element);
  const [width, height] = clampDimensions(mediaWidth, mediaHeight, canvasEl.width, canvasEl.height); // Draw the image on the tiny canvas (`drawImage` will scale the image
  // as needed to make it fit the canvas).

  context.drawImage(element, 0, 0, width, height); // Loop over the canvas pixels and convert them to black and white values.

  const [_, pixelMatrix] = getBlackAndWhiteImageData(context, width, height);
  checkboxland.setData(pixelMatrix, options);
}

function getMediaDimensions(mediaEl) {
  let width = 0,
  height = 0;

  switch (mediaEl.tagName) {
    case 'IMG':
      width = mediaEl.width;
      height = mediaEl.height;
      break;

    case 'VIDEO':
      width = mediaEl.videoWidth;
      height = mediaEl.videoHeight;
      break;}


  return [width, height];
}

function clampDimensions(imageWidth, imageHeight, canvasWidth, canvasHeight) {
  const heightRatio = imageHeight / canvasHeight;
  const widthRatio = imageWidth / canvasWidth; // If the image is unconstrained (ie. very small images), return the dimensions as-is.

  if (heightRatio < 1 && widthRatio < 1) {
    return [imageWidth, imageHeight];
  }

  const getDimensionsClampedByHeight = () => {
    const reducedWidth = Math.floor(imageWidth * canvasHeight / imageHeight);
    return [reducedWidth, canvasHeight];
  };

  const getDimensionsClampedByWidth = () => {
    const reducedHeight = Math.floor(imageHeight * canvasWidth / imageWidth);
    return [canvasWidth, reducedHeight];
  }; // Determine the most constrained dimension, and clamp accordingly.


  return heightRatio > widthRatio ? getDimensionsClampedByHeight() : getDimensionsClampedByWidth();
}
function getBlackAndWhiteImageData(context, width, height) {
  // These toGrayScale function values were borrowed from here:
  // https://www.jonathan-petitcolas.com/2017/12/28/converting-image-to-ascii-art.html#turning-an-image-into-gray-colors
  const toGrayScale = (r, g, b) => 0.21 * r + 0.72 * g + 0.07 * b;

  const rgbaImageArray = context.getImageData(0, 0, width, height);
  const pixelMatrix = [];

  for (let i = 0; i < rgbaImageArray.data.length; i += 4) {
    const r = rgbaImageArray.data[i];
    const g = rgbaImageArray.data[i + 1];
    const b = rgbaImageArray.data[i + 2];
    const grayScaleVal = toGrayScale(r, g, b);
    const thresholdedVal = grayScaleVal > grayscaleThreshold ? 255 : 0; // We overwrite the pixels with their black and white counterparts and
    // return rgbaImageArray in case we ever want to preview it on a canvas.

    rgbaImageArray.data[i] = thresholdedVal;
    rgbaImageArray.data[i + 1] = thresholdedVal;
    rgbaImageArray.data[i + 2] = thresholdedVal; // Note: we currently ignore the transparency value;

    const pixelNum = i / 4;
    const rowNumber = Math.floor(pixelNum / width);
    const rowIndex = pixelNum % width;

    if (rowIndex === 0) {
      pixelMatrix[rowNumber] = [];
    }

    pixelMatrix[rowNumber][rowIndex] = 4 - Math.round(grayScaleVal * 4 / 255);
  }

  return [rgbaImageArray, pixelMatrix];
}

function renderImage(dataSource, options) {
  const checkboxland = this;
  let imageEl; // FOR PASSING A URL TO AN IMAGE

  if (typeof dataSource === 'string') {
    imageEl = new Image();
    imageEl.crossOrigin = 'anonymous'; // allow cross-origin loading.

    imageEl.addEventListener('load', () => renderMediaAsCheckboxes(imageEl, options, checkboxland), {
      once: true });

    imageEl.src = dataSource;
  } else // FOR PASSING AN <IMG> ELEMENT
    if (typeof dataSource === 'object') {
      if (dataSource.complete) {
        renderMediaAsCheckboxes(dataSource, options, checkboxland);
      } else {
        dataSource.addEventListener('load', () => renderMediaAsCheckboxes(dataSource, options, checkboxland), {
          once: true });

      }
    }
}

var renderImage$1 = {
  name: 'renderImage',
  exec: renderImage };


let refreshId;

function renderVideo(dataSource, options) {
  const checkboxland = this;
  let videoEl; // FOR PASSING A URL TO A VIDEO

  if (typeof dataSource === 'string') {
    videoEl = document.createElement("video");
    videoEl.loop = true;
    videoEl.controls = true;
    videoEl.autoplay = true;
    videoEl.muted = true; // enables autoplay on iOS

    videoEl.crossOrigin = 'anonymous'; // allow cross-origin loading.

    videoEl.addEventListener('loadeddata', () => {
      videoEl.play();
      setVideoRenderLoop(videoEl, options, checkboxland);
    }, {
      once: true });

    videoEl.src = dataSource;
  } else // FOR PASSING A <VIDEO> ELEMENT
    if (typeof dataSource === 'object') {
      if (dataSource.readyState === 4) {
        setVideoRenderLoop(dataSource, options, checkboxland);
      } else {
        dataSource.addEventListener('loadeddata', () => setVideoRenderLoop(dataSource, options, checkboxland), {
          once: true });

      }
    }
}

function setVideoRenderLoop(videoElement, options, checkboxland) {
  renderMediaAsCheckboxes(videoElement, options, checkboxland);
  refreshId = requestAnimationFrame(() => setVideoRenderLoop(videoElement, options, checkboxland));
}

function cleanUp$3() {
  cancelAnimationFrame(refreshId);
}

var renderVideo$1 = {
  name: 'renderVideo',
  exec: renderVideo,
  cleanUp: cleanUp$3 };


Checkboxland.extend(print$1);
Checkboxland.extend(marquee$1);
Checkboxland.extend(transitionWipe$1);
Checkboxland.extend(dataUtils$1);
Checkboxland.extend(onClick$1);
Checkboxland.extend(renderImage$1);
Checkboxland.extend(renderVideo$1);

export { Checkboxland };
