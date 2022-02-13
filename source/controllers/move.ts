import { Request, Response, NextFunction } from "express";

async function getMove(
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<Response<any, Record<string, any>>> {
  return res.status(200).json({
    move: "oi",
  });
}

export default { getMove };
