import { Request, Response } from 'express';
import Board from '../lib/Board';

async function getMove(
  req: Request,
  res: Response
): Promise<Response<string, Record<string, unknown>>> {
  const boardState = String(req.query.board);
  const board = new Board(boardState);
  const player = 'o';
  if (board.isValid()) {
    if (board.isPlayerNext(player)) {
      try {
        const newBoard = board.makeMove(player);
        return res.status(200).json(newBoard);
      } catch (err) {
        return res.status(500).json(String(err));
      }
    } else {
      return res.status(400).json("Is is not O's turn!");
    }
  } else {
    return res.status(400).json('Board is invalid!');
  }
}

export default { getMove };
