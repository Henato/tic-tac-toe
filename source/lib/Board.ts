type Player = 'o' | 'x';

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
    this.valueQuantities = this.calcValueQuantities(this.board);
    return (
      [...Object.keys(this.valueQuantities)].every((key) => ValidValues.has(key)) &&
      Math.abs(this.valueQuantities.x - this.valueQuantities.o) <= 1
    );
  }

  private getBoardFragment(line: number[]): string[] {
    return line.map((index) => this.board[index]);
  }

  private calcValueQuantities(boardFragment: string[]): Record<string, number> {
    const valueQuantities: Record<string, number> = {};
    boardFragment.forEach((value) => {
      const current = valueQuantities[value];
      valueQuantities[value] = current === undefined ? 1 : current + 1;
    });
    return valueQuantities;
  }

  private isFirstMove(): boolean {
    return this.valid && this.valueQuantities[empty] === 9;
  }

  private getEmptyWithTwoInARow(player: Player): number {
    let boardSquare = -1;
    lines.some((line) => {
      const fragment = this.getBoardFragment(line);
      const valueQuantities = this.calcValueQuantities(fragment);
      if (valueQuantities[player] === 2 && valueQuantities[empty] === 1) {
        boardSquare = line[fragment.indexOf(empty)];
        return true;
      } else {
        return false;
      }
    });
    return boardSquare;
  }

  private getLinesWithTwoEmptySquares(player: Player): number[] {
    const _lines: number[] = [];
    lines.forEach((line, lineIndex) => {
      const fragment = this.getBoardFragment(line);
      const valueQuantities = this.calcValueQuantities(fragment);
      if (valueQuantities[player] === 1 && valueQuantities[empty] === 2) {
        _lines.push(lineIndex);
      }
    });
    return _lines;
  }

  private findForkForPlayer(player: Player): number {
    let boardSquare = -1;
    const linesWithTwoEmpty = this.getLinesWithTwoEmptySquares(player);
    const intersections: Record<number, number[]> = {};
    for (let i = 0; i < 9; i++) {
      linesWithTwoEmpty.forEach((lineIndex) => {
        lines[lineIndex].forEach((boardIndex) => {
          if (this.board[boardIndex] === empty) {
            if (!intersections[boardIndex]) {
              intersections[boardIndex] = [];
            }
            intersections[boardIndex].push(lineIndex);
          }
        });
      });
    }
    for (const boardIndex in intersections) {
      if (intersections[boardIndex].length > 1) {
        boardSquare = Number(boardIndex);
        break;
      }
    }
    return boardSquare;
  }

  private findEmptySquare(squareSet: number[]): number {
    let boardSquare = -1;
    squareSet.some((squareIndex) => {
      if (this.board[squareIndex] === empty) {
        boardSquare = squareIndex;
        return true;
      }
      return false;
    });
    return boardSquare;
  }

  private findEmptyCorner(): number {
    return this.findEmptySquare(corners);
  }

  private findEmptySide(): number {
    return this.findEmptySquare(sides);
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

  private findWin(player: Player): number {
    return this.getEmptyWithTwoInARow(player);
  }

  private findBlock(player: Player): number {
    return this.getEmptyWithTwoInARow(Opponent[player]);
  }

  private findFork(player: Player): number {
    return this.findForkForPlayer(player);
  }

  private findBlockFork(player: Player): number {
    return this.findForkForPlayer(Opponent[player]);
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
                    moveIndex = this.findEmptySide();
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
