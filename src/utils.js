export function getRowColumn(index, columns, rows) {
  const column = index % columns;
  const row = Math.floor((index - column) / columns);

  return [column, row];
}

export function getXY(column, row, cellHeight, cellWidth) {
  return [
    column * cellWidth + cellWidth / 2,
    row * cellHeight + cellHeight / 2,
  ];
}

// export default {
//   getRowColumn,
//   getXY,
// };
