type Player = 'o' | 'x';
type Turn = [[Player, number], [Player, number]];

const empty = ' ';
const ValidValues = new Set(['o', 'x', empty]);
const Opponent: Record<Player, Player> = { x: 'o', o: 'x' };

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
const corners = [0, 2, 6, 8];
const sides = [1, 3, 5, 7];
const center = 4;

function getBoardFragment(line: number[], board: string[]): string[] {
  return line.map((index) => board[index]);
}

function findWinnableSquare(player: Player, board: string[]): number {
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

function calcValueQuantities(boardFragment: string[]): Record<string, number> {
  const valueQuantities: Record<string, number> = { x: 0, o: 0, [empty]: 0 };
  boardFragment.forEach((value) => {
    const current = valueQuantities[value];
    valueQuantities[value] = current === undefined ? 1 : current + 1;
  });
  return valueQuantities;
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

function findForkForPlayer(
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

function findEmptySide(board: string[]): number {
  return findEmptySquare(sides, board);
}

function findEmptySquare(squareSet: number[], board: string[]): number {
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

export default class Board {
  private board: string[];
  private valueQuantities: Record<string, number> = {};
  private valid = true;

  constructor(board: string[] | string) {
    if (typeof board === 'string') {
      this.board = board.split('');
    } else {
      this.board = board;
    }
    this.validate();
  }

  private validate(): void {
    this.valid = this.board.length === 9 && this.validateValues();
  }

  private validateValues(): boolean {
    this.valueQuantities = calcValueQuantities(this.board);
    return (
      [...Object.keys(this.valueQuantities)].every((key) => ValidValues.has(key)) &&
      Math.abs((this.valueQuantities.x || 0) - (this.valueQuantities.o || 0)) <= 1
    );
  }

  private isFirstMove(): boolean {
    return this.valid && this.valueQuantities[empty] === 9;
  }

  private findWin(player: Player): number {
    return findWinnableSquare(player, this.board);
  }

  private findBlock(player: Player): number {
    return findWinnableSquare(Opponent[player], this.board);
  }

  private findFork(player: Player): number {
    return findForkForPlayer(player, this.board);
  }

  private findBlockFork(player: Player): number {
    return findForkForPlayer(Opponent[player], this.board, { block: true });
  }

  private findOppositeCorner(player: Player): number {
    let boardSquare = -1;
    corners.some((cornerIndex) => {
      if (
        this.board[cornerIndex] === Opponent[player] &&
        this.board[OppositeCorners[cornerIndex]] === empty
      ) {
        boardSquare = OppositeCorners[cornerIndex];
        return true;
      }
      return false;
    });
    return boardSquare;
  }

  private findEmptyCorner(): number {
    return findEmptySquare(corners, this.board);
  }

  private suggestMoveIndex(player: Player): number {
    let moveIndex = -1;

    moveIndex = this.findWin(player);
    if (moveIndex === -1) {
      moveIndex = this.findBlock(player);
      if (moveIndex === -1) {
        moveIndex = this.findFork(player);
        if (moveIndex === -1) {
          moveIndex = this.findBlockFork(player);
          if (moveIndex === -1) {
            if (this.isFirstMove()) {
              moveIndex = corners[0];
            } else {
              if (this.board[center] === empty) {
                moveIndex = center;
              } else {
                moveIndex = this.findOppositeCorner(player);
                if (moveIndex === -1) {
                  moveIndex = this.findEmptyCorner();
                  if (moveIndex === -1) {
                    moveIndex = findEmptySide(this.board);
                  }
                }
              }
            }
          }
        }
      }
    }

    if (moveIndex === -1) {
      throw new Error('There should be a move, but no one was found!');
    }

    return moveIndex;
  }

  isValid(): boolean {
    return this.valid;
  }

  isPlayerNext(player: Player): boolean {
    if (this.valid) {
      const diff = this.valueQuantities[player] - this.valueQuantities[player];
      return diff === 0 || diff === 1;
    } else {
      return false;
    }
  }

  makeMove(player: Player): string {
    if (!this.valid) {
      throw new Error('Board is not valid!');
    }
    if (!this.isPlayerNext(player)) {
      throw new Error(`Player "${player}" cannot make a move now!`);
    }
    const moveIndex = this.suggestMoveIndex(player);
    this.board[moveIndex] = player;
    this.valueQuantities[player]++;
    return this.board.join('');
  }
}
