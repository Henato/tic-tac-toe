import { Request, Response, NextFunction } from 'express';

const getMove = async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({
        move: "oi"
    });
};

export default { getMove }