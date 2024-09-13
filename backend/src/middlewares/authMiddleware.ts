import {Request, Response, NextFunction} from 'express';
import JwtService from '../services/JwtService';

export interface AuthenticatedRequest extends Request {
    userId?: number;
}

// Chemins à exclure
const excludedPaths = [
    {url: /^\/api\/login\/?$/, methods: ['POST']},
    {url: /^\/api\/login\/refresh\/?$/, methods: ['POST']},
    {url: /^\/api\/users\/?$/, methods: ['POST']},
];

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Vérifier si le chemin de la requête est dans les chemins exclus
    const isExcluded = excludedPaths.some(excluded => {
        const matchUrl = excluded.url.test(req.originalUrl);
        const matchMethod = excluded.methods.includes(req.method);
        return matchUrl && matchMethod;
    });

    if (isExcluded) {
        return next();
    }

    // Récupérer le token de l'en-tête Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({error: 'Non autorisé : aucun token fourni'});
    }

    const token = authHeader.substring(7);

    const payload = JwtService.verifyAccessToken(token);

    if (!payload) {
        return res.status(401).json({error: 'Non autorisé : token invalide'});
    }

    req.userId = payload.id;

    next();
};

export default authMiddleware;
