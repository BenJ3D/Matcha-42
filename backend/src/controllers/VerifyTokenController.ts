import { Request, Response } from 'express';
import JwtService from '../services/JwtService';
import { IJwtPayload } from '../types/IJwtPayload';

class VerifyTokenController {
    async verifyToken(req: Request, res: Response) {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(400).json({ valid: false, error: 'Aucun token fourni.' });
        }

        const token = authHeader.substring(7);

        try {
            const payload: IJwtPayload | null = JwtService.verifyAccessToken(token);
            if (payload) {
                return res.json({ valid: true, payload });
            } else {
                return res.status(401).json({ valid: false, error: 'Token invalide.' });
            }
        } catch (error: any) {
            return res.status(401).json({ valid: false, error: 'Token invalide ou expiré.' });
        }
    }
}

export default new VerifyTokenController();