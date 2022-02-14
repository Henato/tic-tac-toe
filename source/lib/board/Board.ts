import {
  calcValueQuantities,
  center,
  corners,
  empty,
  findEmptySide,
  findEmptySquare,
  findForkForPlayer,
  findOppositeCorner,
  findWinnableSquare,
  Opponent,
  Player,
  ValidValues,
} from './boardService';

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
    return findOppositeCorner(player, this.board);
  }

  private findEmptyCorner(): number {
    return findEmptySquare(corners, this.board);
  }

  private findEmptySide(): number {
    return findEmptySide(this.board);
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
