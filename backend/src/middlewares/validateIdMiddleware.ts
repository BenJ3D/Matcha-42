import {Request, Response, NextFunction} from 'express';
import {isValidId} from '../utils/isValidId';

/**
 * Middleware pour valider l'ID dans les paramètres de l'URL.
 */
export function validateIdMiddleware(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.userId || req.params.id || req.params.tagId, 10);
    console.log('DBG ' +id);
    if (!isValidId(id)) {
        return res.status(400).json({
            
            "error": {
                "message": "ID invalide",
            }
        });
    }
    next();
}