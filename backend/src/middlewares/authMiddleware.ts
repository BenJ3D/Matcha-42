import {Request, Response, NextFunction} from 'express';
import JwtService from '../services/JwtService';
import UserServices from "../services/UserServices";
import {isValidId} from "../utils/isValidId";
import UserDAL from "../DataAccessLayer/UserDAL";

export interface AuthenticatedRequest extends Request {
    userId?: number;
}

const excludedPaths = [
    {url: /^\/api\/verify-email(?:\/)?(?:\?.*)?$/, methods: ['GET']},
    {url: /^\/api\/login\/?$/, methods: ['POST']},
    {url: /^\/api\/login\/refresh\/?$/, methods: ['POST']},
    {url: /^\/api\/users\/?$/, methods: ['POST']},
    {url: /^\/api\/password-reset\/request\/?$/, methods: ['POST']},
    {url: /^\/api\/password-reset\/reset\/?$/, methods: ['POST']},  
    {url: /^\/api-docs\/?$/, methods: ['GET']},
    {url: /^\/api-docs\.json$/, methods: ['GET']},
    {url: /^\/uploads\/?$/, methods: ['GET']},
];

const excludedEmailVerificationPaths = [
    {url: /^\/api\/users\/me$/, methods: ['GET']},
    {url: /^\/api\/users\/$/, methods: ['DELETE']},
    {url: /^\/api\/verify-email\/resend\/?$/, methods: ['GET']},
];

const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const isExcluded = excludedPaths.some(excluded => {
        const matchUrl = excluded.url.test(req.originalUrl);
        const matchMethod = excluded.methods.includes(req.method);
        return matchUrl && matchMethod;
    });

    if (isExcluded) {
        return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({error: 'Non autorisé : aucun token fourni'});
    }

    const token = authHeader.substring(7);

    const payload = JwtService.verifyAccessToken(token);

    if (!payload) {
        return res.status(401).json({error: 'Non autorisé : token invalide'});
    }

    if (!payload.id || !isValidId(payload.id)) {
        return res.status(401).json({error: 'Invalid id, your jwt token is wrong'});
    }

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
    await UserDAL.updateLastActivity(req.userId);
    next();
};

export default authMiddleware;
