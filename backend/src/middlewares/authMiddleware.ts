import {Request, Response, NextFunction} from 'express';
import JwtService from '../services/JwtService';
import UserServices from "../services/UserServices";
import {isValidId} from "../utils/isValidId";

export interface AuthenticatedRequest extends Request {
    userId?: number;
}

// Chemins à exclure
const excludedPaths = [
    {url: /^\/api\/verify-email(?:\/)?(?:\?.*)?$/, methods: ['GET']},
    {url: /^\/api\/login\/?$/, methods: ['POST']},
    {url: /^\/api\/login\/refresh\/?$/, methods: ['POST']},
    {url: /^\/api\/users\/?$/, methods: ['POST']},
    {url: /^\/api-docs\/?$/, methods: ['GET']}, // Exclure la route de documentation
    {url: /^\/api-docs\.json$/, methods: ['GET']}, // Exclure la route du JSON de documentation
];

const excludedEmailVerificationPaths = [
    {url: /^\/api\/users\/me$/, methods: ['GET']},
    {url: /^\/api\/users\/$/, methods: ['DELETE']},
];

const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Vérif si le chemin de la requête est dans les chemins exclus
    const isExcluded = excludedPaths.some(excluded => {
        const matchUrl = excluded.url.test(req.originalUrl);
        const matchMethod = excluded.methods.includes(req.method);
        return matchUrl && matchMethod;
    });

    if (isExcluded) {
        return next();
    }

    // Récup le token de l'en-tête Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({error: 'Non autorisé : aucun token fourni'});
    }

    const token = authHeader.substring(7);

    const payload = JwtService.verifyAccessToken(token);

    if (!payload) {
        return res.status(401).json({error: 'Non autorisé : token invalide'});
    }

    //Verif de l'ID user dans le token (protection contre un overflow si token généré manuellement)
    if (!payload.id || !isValidId(payload.id)) {
        return res.status(401).json({error: 'Invalid id, your jwt token is wrong'});
    }

    // Vérif si l'utilisateur existe toujours dans la base de données
    const user = await UserServices.getUserById(payload.id);
    if (!user) {
        return res.status(401).json({error: 'Non autorisé : utilisateur supprimé ou inexistant'});
    }
    const isExcludedFromEmailVerification = excludedEmailVerificationPaths.some(excluded => {
        const matchUrl = excluded.url.test(req.originalUrl);
        const matchMethod = excluded.methods.includes(req.method);
        return matchUrl && matchMethod;
    });

    if (!isExcludedFromEmailVerification && !user.is_verified) {
        return res.status(401).json({error: 'Non autorisé : email utilisateur non vérifié'});
    }
    req.userId = payload.id;

    next();
};

export default authMiddleware;
