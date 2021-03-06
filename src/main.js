const canvas = document.getElementById('canvas');
let ctx;

const CELL_TYPES = {
  0: 'DEAD',
  1: 'ALIVE',
};

const CELLS = {
  DEAD: {
    value: 0,
    color: '#ffffff',
  },
  ALIVE: {
    value: 1,
    color: '#111111',
  }
};

function getRowColumn(index, columns, rows) {
  const column = index % columns;
  const row = Math.floor((index - column) / columns);

  return [column, row];
}

function getXY(column, row, cellHeight, cellWidth) {
  return [(column * cellWidth) + (cellWidth / 2), (row * cellHeight) + (cellHeight / 2)];
}

function initCanvas(canvasEle, height, width) {
  const context = canvasEle.getContext('2d');

  canvasEle.height = height;
  canvasEle.width = width;

  context.lineWidth = 2;

  return context;
}

function initMap(rows, columns, cellHeight, cellWidth) {
  return {
    rows,
    columns,
    cellHeight,
    cellWidth,
    height: rows * cellHeight,
    width: columns * cellWidth,
  };
}

function addMetaToMap(cells, metaFn, rows, columns) {
  return cells.map((type, index) => metaFn(type, index, rows, columns));
}

function initCells(rows, columns) {
  const cells = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      cells.push(0);
    }
  }

  return cells;
}

function cellsWithMeta(cells, columns, rows) {
  return addMetaToMap(cells, (cellType, index, rows, columns) => {
    return {
      type: CELLS[CELL_TYPES[cellType]],
      index: index,
      coords: getRowColumn(index, columns, rows),
    };
  }, rows, columns);
}

function drawCell(index, columns, rows, cellHeight, cellWidth, cell, outline = false) {
  const [column, row] = getRowColumn(index, columns, rows);

  ctx.fillStyle = cell.type.color;
  ctx.strokeStyle = 'black';

  ctx.fillRect(column * cellWidth, row * cellHeight, cellHeight, cellWidth);

  if (outline) {
    ctx.strokeRect(column * cellWidth, row * cellHeight, cellHeight, cellWidth);
    drawText(index, columns, rows, cellHeight, cellWidth, `${index}:[${column}, ${row}]`);  
  }
}

function drawText(index, columns, rows, cellHeight, cellWidth, text) {
  const [column, row] = getRowColumn(index, columns, rows);
  const [x, y] = getXY(column, row, cellHeight, cellWidth);

  ctx.font = '10px sans-serif';
  ctx.strokeStyle = 'rgba(0, 0, 0,0.5)';
  ctx.fillStyle = 'rgba(255, 255, 255,0.5)';

  const textWidth = ctx.measureText(text);

  ctx.strokeText(text, x - (textWidth.width / 2), y + (5 / 2), cellWidth);
  ctx.fillText(text, x - (textWidth.width / 2), y + (5 / 2), cellWidth);
}

function renderCells(cells, rows, columns, cellHeight, cellWidth) {
  cells.forEach((cell, index) => {
    drawCell(index, columns, rows, cellHeight, cellWidth, cell);
  });
}

function fillCells(rows, columns, fillPercent = 0.5) {
  const cells = [];
  
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        if (Math.random() <= fillPercent) {
          cells.push(1);
        } else {
          cells.push(0);
        }
      }
    }
  
  return cells;
}

function drawLine(fromIndex, toIndex, columns, rows, cellHeight, cellWidth, color) {
  const [fromColumn, fromRow] = getRowColumn(fromIndex, columns, rows);
  const [toColumn, toRow] = getRowColumn(toIndex, columns, rows);
  const oldLineWidth = ctx.lineWidth;
  
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 5;

  ctx.beginPath();
  ctx.moveTo(...getXY(fromColumn, fromRow, cellHeight, cellWidth));
  ctx.lineTo(...getXY(toColumn, toRow, cellHeight, cellWidth));
  ctx.stroke();
  ctx.fill();
  ctx.closePath();

  ctx.strokeStyle = 'white';
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(...getXY(fromColumn, fromRow, cellHeight, cellWidth));
  ctx.lineTo(...getXY(toColumn, toRow, cellHeight, cellWidth));
  ctx.stroke();
  ctx.fill();
  ctx.closePath();

  ctx.lineWidth = oldLineWidth;
}

function getNeighbors(index, cells, rows, columns) {
  // [top-left, top, top-right, right, bottom-right, bottom, bottom-left, left]
  const neighbors = [];
  const [column, row] = getRowColumn(index, columns, rows);

  const bottomDelta = columns;
  const topDelta = 0 - bottomDelta;
  const rightDelta = 1;
  const leftDelta = - rightDelta;

  const topCell = cells[index + topDelta];
  const bottomCell = cells[index + bottomDelta];
  let leftCell;
  let rightCell;

  if (column !== 0) { // probably has a left cell
    leftCell = cells[index + leftDelta];
  }

  if (leftCell && topCell) { // if there is a leftCell and a topCell there is probably a topLeftCell
    const topLeftCell = cells[index + (topDelta + leftDelta)];

    if (topLeftCell) { // make sure there really is a topLeftCell before pushing it
      neighbors.push(topLeftCell);
    }
  }

  if (topCell) {
    neighbors.push(topCell);
  }

  if (column !== columns - 1) { // probably has a right cell
    rightCell = cells[index + rightDelta];
  }

  if (rightCell && topCell) { // if there is a rightCell and a topCell there is probably a topRightCell
    const topRightCell = cells[index + (topDelta + rightDelta)];

    if (topRightCell) { // make sure there really is a topRightCell before pushing it
      neighbors.push(topRightCell);
    }
  }

  if (rightCell) {
    neighbors.push(rightCell);
  }

  if (rightCell && bottomCell) { // if there is a rightCell and a bottomCell there is probably a bottomRightCell
    const bottomRightCell = cells[index + (bottomDelta + rightDelta)];

    if (bottomRightCell) { // make sure there really is a bottomRightCell before pushing it
      neighbors.push(bottomRightCell);
    }
  }

  if (bottomCell) {
    neighbors.push(bottomCell);
  }

  if (leftCell && bottomCell) { // if there is a leftCell and a bottomCell there is probably a bottomLeftCell
    const bottomLeftCell = cells[index + (bottomDelta + leftDelta)];

    if (bottomLeftCell) {
      neighbors.push(bottomLeftCell);
    }
  }

  if (leftCell) {
    neighbors.push(leftCell);
  }

  return neighbors;
}

export default function genenerate(columns = 10, rows = 10, cellHeight = 50, cellWidth = 50, fillPercent = 0.5) {
  const MAP = initMap(rows, columns, cellHeight, cellWidth);
  ctx = initCanvas(canvas, MAP.height, MAP.width)

  let cells = cellsWithMeta(initCells(rows, columns), columns, rows);

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.height, canvas.width);

  cells = cellsWithMeta(fillCells(rows, columns, fillPercent), rows, columns);
  
  renderCells(cells, rows, columns, MAP.cellHeight, MAP.cellWidth);

  console.log(MAP);
  console.log(cells);

  const neighbors = getNeighbors

  // drawLine(5, 6, columns, rows, MAP.cellHeight, MAP.cellWidth, 'white');

  return {
    MAP,
    cells,
    step: (stateDecider) => {
      cells = cells.map((cell) => {
        const newState = stateDecider(cell, getNeighbors(cell.index, cells, rows, columns));

        return Object.assign({}, cell, { type: CELLS[CELL_TYPES[newState]] });
      });

      renderCells(cells, rows, columns, MAP.cellHeight, MAP.cellWidth);
    },
    debug: (i) => {
      const neighbors = getNeighbors(i, cells, rows, columns);

      console.log(neighbors);

      neighbors.forEach((cell, index) => {
        const orangeCell = Object.assign({}, cell, { type: { color: 'orange' } });
        drawCell(cell.index, columns, rows, MAP.cellHeight, MAP.cellWidth, orangeCell);
      });

      neighbors.reduce((prev, next) => {
        drawLine(prev.index, next.index, columns, rows, MAP.cellHeight, MAP.cellWidth, 'white');
        return next;
      });

      return neighbors;
    },
  };
}
