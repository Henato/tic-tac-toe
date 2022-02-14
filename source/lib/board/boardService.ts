export type Player = 'o' | 'x';
export type Turn = [[Player, number], [Player, number]];

export const empty = ' ';
export const ValidValues = new Set(['o', 'x', empty]);
export const Opponent: Record<Player, Player> = { x: 'o', o: 'x' };
export const center = 4;
export const corners = [0, 2, 6, 8];

const lines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
const OppositeCorners: Record<number, number> = {
  0: 8,
  8: 0,
  2: 6,
  6: 2,
};
const sides = [1, 3, 5, 7];

function getBoardFragment(line: number[], board: string[]): string[] {
  return line.map((index) => board[index]);
}

function turnBlockDoubleFork(turn: Turn, board: string[]): boolean {
  const newBoard = [...board];
  const player = turn[0][0];
  const opponent = Opponent[player];
  newBoard[turn[0][1]] = turn[0][0];
  const winSquare = findWinnableSquare(opponent, newBoard);
  if (winSquare !== -1) {
    newBoard[turn[1][1]] = turn[1][0];
    const forkSquare = findForkForPlayer(opponent, newBoard);
    if (forkSquare !== -1) {
      return true;
    }
  }
  return false;
}

function getLinesWithTwoEmptySquares(player: Player, board: string[]): number[] {
  const _lines: number[] = [];
  lines.forEach((line, lineIndex) => {
    const fragment = getBoardFragment(line, board);
    const valueQuantities = calcValueQuantities(fragment);
    if (valueQuantities[player] === 1 && valueQuantities[empty] === 2) {
      _lines.push(lineIndex);
    }
  });
  return _lines;
}

function findBlockDoubleFork(player: Player, board: string[]): number {
  let boardSquare = -1;
  lines.some((line) => {
    const fragment = getBoardFragment(line, board);
    const quantities = calcValueQuantities(fragment);
    if (quantities[player] === 1 && quantities[empty] === 2) {
      const firstEmpty = line[fragment.indexOf(' ')];
      const lastEmpty = line[fragment.lastIndexOf(' ')];

      if (
        turnBlockDoubleFork(
          [
            [player, firstEmpty],
            [Opponent[player], lastEmpty],
          ],
          board
        )
      ) {
        boardSquare = firstEmpty;
        return true;
      } else if (
        turnBlockDoubleFork(
          [
            [player, lastEmpty],
            [Opponent[player], firstEmpty],
          ],
          board
        )
      ) {
        boardSquare = lastEmpty;
        return true;
      }
    }
    return false;
  });
  return boardSquare;
}

export function findForkForPlayer(
  player: Player,
  board: string[],
  options?: { block: boolean }
): number {
  let boardSquare = -1;
  const linesWithTwoEmpty = getLinesWithTwoEmptySquares(player, board);
  const intersections: Record<number, Set<number>> = {};
  for (let i = 0; i < 9; i++) {
    linesWithTwoEmpty.forEach((lineIndex) => {
      lines[lineIndex].forEach((boardIndex) => {
        if (board[boardIndex] === empty) {
          if (!intersections[boardIndex]) {
            intersections[boardIndex] = new Set();
          }
          intersections[boardIndex].add(lineIndex);
        }
      });
    });
  }
  const forks = [];
  for (const boardIndex in intersections) {
    if (intersections[boardIndex].size > 1) {
      boardSquare = Number(boardIndex);
      if (options?.block) {
        forks.push(intersections[boardIndex]);
      } else {
        break;
      }
    }
  }
  if (options?.block && forks.length > 1) {
    if (
      corners.some((cornerIndex) => {
        if (
          board[cornerIndex] === player &&
          board[OppositeCorners[cornerIndex]] === player
        ) {
          return true;
        }
        return false;
      }) &&
      board[center] === Opponent[player]
    ) {
      boardSquare = findEmptySide(board);
    } else {
      boardSquare = findBlockDoubleFork(Opponent[player], board);
    }
  }
  return boardSquare;
}

export function findEmptySide(board: string[]): number {
  return findEmptySquare(sides, board);
}

export function findEmptySquare(squareSet: number[], board: string[]): number {
  let boardSquare = -1;
  squareSet.some((squareIndex) => {
    if (board[squareIndex] === empty) {
      boardSquare = squareIndex;
      return true;
    }
    return false;
  });
  return boardSquare;
}

export function findOppositeCorner(player: Player, board: string[]): number {
  let boardSquare = -1;
  corners.some((cornerIndex) => {
    if (
      board[cornerIndex] === Opponent[player] &&
      board[OppositeCorners[cornerIndex]] === empty
    ) {
      boardSquare = OppositeCorners[cornerIndex];
      return true;
    }
    return false;
  });
  return boardSquare;
}

export function findWinnableSquare(player: Player, board: string[]): number {
  let boardSquare = -1;
  lines.some((line) => {
    const fragment = getBoardFragment(line, board);
    const valueQuantities = calcValueQuantities(fragment);
    if (valueQuantities[player] === 2 && valueQuantities[empty] === 1) {
      boardSquare = line[fragment.indexOf(empty)];
      return true;
    } else {
      return false;
    }
  });
  return boardSquare;
}

export function calcValueQuantities(boardFragment: string[]): Record<string, number> {
  const valueQuantities: Record<string, number> = { x: 0, o: 0, [empty]: 0 };
  boardFragment.forEach((value) => {
    const current = valueQuantities[value];
    valueQuantities[value] = current === undefined ? 1 : current + 1;
  });
  return valueQuantities;
}
