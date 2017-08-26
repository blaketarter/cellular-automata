import { getRowColumn, getXY } from './utils';

function drawCell(
  ctx,
  index,
  columns,
  rows,
  cellSize,
  cell,
  getStyles,
  debug = false,
) {
  if (!cell) {
    return;
  }

  const [column, row] = getRowColumn(index, columns, rows);

  const styles = getStyles(cell);

  if (styles.color) {
    ctx.fillStyle = styles.color;
  }

  ctx.fillRect(column * cellSize, row * cellSize, cellSize, cellSize);

  if (debug) {
    ctx.strokeStyle = 'black';
    ctx.strokeRect(column * cellSize, row * cellSize, cellSize, cellSize);
    drawText(
      ctx,
      index,
      columns,
      rows,
      cellSize,
      `${index}:[${column}, ${row}]`,
    );
  }
}

function drawText(ctx, index, columns, rows, cellHeight, cellWidth, text) {
  const [column, row] = getRowColumn(index, columns, rows);
  const [x, y] = getXY(column, row, cellHeight, cellWidth);

  ctx.font = '10px sans-serif';
  ctx.strokeStyle = 'rgba(0, 0, 0,0.5)';
  ctx.fillStyle = 'rgba(255, 255, 255,0.5)';

  const textWidth = ctx.measureText(text);

  ctx.strokeText(text, x - textWidth.width / 2, y + 5 / 2, cellWidth);
  ctx.fillText(text, x - textWidth.width / 2, y + 5 / 2, cellWidth);
}

function renderCells(ctx, cells, rows, columns, cellSize, getStyles) {
  cells.forEach((cell, index) => {
    drawCell(ctx, index, columns, rows, cellSize, cell, getStyles);
  });
}

export class GameMap {
  constructor(canvasEle) {
    this.element = canvasEle;
    this.context = this.element.getContext('2d');

    this.rows = 0;
    this.columns = 0;
    this.height = 0;
    this.width = 0;
    this.cellSize = 0;
  }

  sizeCanvas(rows, columns, cellSize) {
    this.cellSize = cellSize;

    this.rows = rows;
    this.columns = columns;

    this.height = rows * cellSize;
    this.width = columns * cellSize;

    this.element.height = this.height;
    this.element.width = this.width;

    this.context.lineWidth = 2;
  }

  renderWorld(world, cellSize, getStyles) {
    this.sizeCanvas(world.rows, world.columns, cellSize);

    renderCells(
      this.context,
      world.cells,
      this.rows,
      this.columns,
      this.cellSize,
      getStyles,
    );
  }
}
