import {Request, Response, NextFunction} from 'express';
import JwtService from '../services/JwtService';
import UserServices from "../services/UserServices";

export interface AuthenticatedRequest extends Request {
    userId?: number;
}

// Chemins à exclure
const excludedPaths = [
    {url: /^\/api\/login\/?$/, methods: ['POST']},
    {url: /^\/api\/login\/refresh\/?$/, methods: ['POST']},
    {url: /^\/api\/users\/?$/, methods: ['POST']},
];

const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

    // Vérifier si l'utilisateur existe toujours dans la base de données
    const user = await UserServices.getUserById(payload.id);
    if (!user) {
        return res.status(401).json({error: 'Non autorisé : utilisateur supprimé ou inexistant'});
    }
    req.userId = payload.id;

    next();
};

export default authMiddleware;
