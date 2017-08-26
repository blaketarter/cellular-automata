import { getRowColumn } from './utils';

function getNeighbors(index, cells, rows, columns) {
  //     0      1       2        3          4         5          6         7
  // [top-left, top, top-right, right, bottom-right, bottom, bottom-left, left]
  const neighbors = [];
  const [column, row] = getRowColumn(index, columns, rows);

  const bottomDelta = columns;
  const topDelta = 0 - bottomDelta;
  const rightDelta = 1;
  const leftDelta = -rightDelta;

  const topCell = cells[index + topDelta];
  const bottomCell = cells[index + bottomDelta];
  let leftCell;
  let rightCell;

  if (column !== 0) {
    // probably has a left cell
    leftCell = cells[index + leftDelta];
  }

  if (leftCell && topCell) {
    // if there is a leftCell and a topCell there is probably a topLeftCell
    const topLeftCell = cells[index + (topDelta + leftDelta)];

    if (topLeftCell) {
      // make sure there really is a topLeftCell before pushing it
      neighbors.push(topLeftCell);
    } else {
      neighbors.push(undefined);
    }
  } else {
    neighbors.push(undefined);
  }

  if (topCell) {
    neighbors.push(topCell);
  } else {
    neighbors.push(undefined);
  }

  if (column !== columns - 1) {
    // probably has a right cell
    rightCell = cells[index + rightDelta];
  }

  if (rightCell && topCell) {
    // if there is a rightCell and a topCell there is probably a topRightCell
    const topRightCell = cells[index + (topDelta + rightDelta)];

    if (topRightCell) {
      // make sure there really is a topRightCell before pushing it
      neighbors.push(topRightCell);
    } else {
      neighbors.push(undefined);
    }
  } else {
    neighbors.push(undefined);
  }

  if (rightCell) {
    neighbors.push(rightCell);
  } else {
    neighbors.push(undefined);
  }

  if (rightCell && bottomCell) {
    // if there is a rightCell and a bottomCell there is probably a bottomRightCell
    const bottomRightCell = cells[index + (bottomDelta + rightDelta)];

    if (bottomRightCell) {
      // make sure there really is a bottomRightCell before pushing it
      neighbors.push(bottomRightCell);
    } else {
      neighbors.push(undefined);
    }
  } else {
    neighbors.push(undefined);
  }

  if (bottomCell) {
    neighbors.push(bottomCell);
  } else {
    neighbors.push(undefined);
  }

  if (leftCell && bottomCell) {
    // if there is a leftCell and a bottomCell there is probably a bottomLeftCell
    const bottomLeftCell = cells[index + (bottomDelta + leftDelta)];

    if (bottomLeftCell) {
      neighbors.push(bottomLeftCell);
    } else {
      neighbors.push(undefined);
    }
  } else {
    neighbors.push(undefined);
  }

  if (leftCell) {
    neighbors.push(leftCell);
  } else {
    neighbors.push(undefined);
  }

  return neighbors;
}

function initCells(rows, columns, initialCells = []) {
  if (initialCells.length) {
    return initialCells.slice();
  }

  const cells = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      cells.push(0);
    }
  }

  return cells;
}

function fillCells(
  cells,
  fillPercent = 0.5,
  cellTypeToReplace = 0,
  cellTypeToFill = 1,
) {
  const newCells = [];

  for (let i = 0, ii = cells.length; i < ii; i++) {
    if (cells[i] !== cellTypeToReplace) {
      newCells.push(cells[i]);
      continue;
    }

    if (Math.random() <= fillPercent) {
      newCells.push(cellTypeToFill);
    } else {
      newCells.push(cells[i]);
    }
  }

  return newCells;
}

function runRule(index, cells, rows, columns, ruleFn) {
  const agent = cells[index];
  const neighbors = getNeighbors(index, cells, rows, columns);

  return { ...ruleFn(agent, neighbors) };
}

function getAgentFromProbablity(agents = {}, distributions = []) {
  const rand = Math.random();
  let mostSpecificAgent = null;
  let mostSpecificDistribution = { value: 2 };

  for (let distribution of distributions) {
    const agent = agents[distribution.type];

    if (
      rand <= distribution.value &&
      distribution.value < mostSpecificDistribution.value
    ) {
      mostSpecificAgent = { ...agent, ...distribution.state };
      mostSpecificDistribution = distribution;
    }
  }

  return mostSpecificAgent;
}

export class World {
  constructor({ rows, columns }) {
    this.rows = rows;
    this.columns = columns;

    this.cells = initCells(rows, columns);
    this.agents = [];
    this.rules = [];
    this.agents = {};
    this.distributions = [];
  }

  addRule(ruleFn) {
    this.rules = [...this.rules, ruleFn];
  }

  removeRule(ruleFn) {
    const ruleIndex = this.rules.indexOf(ruleFn);

    this.rules = [
      ...this.rules.slice(0, ruleIndex),
      ...this.rules.slice(rulesIndex),
    ];
  }

  addAgent(agentName, meta = {}) {
    this.agents = {
      ...this.agents,
      [agentName]: {
        type: agentName,
        ...meta,
        chanceOfAppearing: 0,
        distribution: 0,
      },
    };
  }

  fillWithDistribution(agentDistributions = []) {
    let chanceLeft = 1;

    for (let distribution of agentDistributions) {
      this.distributions.push({
        type: distribution.agent,
        chanceOfAppearing: distribution.chance,
        value: chanceLeft,
        state: distribution.state ? distribution.state : {},
      });

      chanceLeft -= distribution.chance;
    }

    this.agents = this.cells.map(cell => {
      return getAgentFromProbablity(this.agents, this.distributions);
    });
  }

  step() {
    this.agents = this.agents.map((agent, index) => {
      return this.rules.reduce(
        (agent, ruleFn) =>
          runRule(index, this.agents, this.rows, this.columns, ruleFn),
        agent,
      );
    });
  }

  delay(generations) {
    for (let i = 0; i < generations; i++) {
      this.step();
    }
  }
}
