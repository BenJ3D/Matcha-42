import {Request, Response, NextFunction} from 'express';
import {isValidId} from '../utils/isValidId';

export function validateIdMiddleware(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.userId || req.params.id || req.params.tagId, 10);
    if (!isValidId(id)) {
        return res.status(400).json({
            "error": {
                "message": "ID invalide",
            }
        });
    }
    next();
}