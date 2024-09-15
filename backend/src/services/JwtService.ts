import jwt from 'jsonwebtoken';
import {IJwtPayload} from "../types/IJwtPayload";

if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("Les variables d'environnement JWT_SECRET et REFRESH_TOKEN_SECRET sont obligatoires.");
}


const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRATION = '2h'; // Expires in 15 minutes
const REFRESH_TOKEN_EXPIRATION = '7d'; // Expires in 7 days


class JwtService {
    // Génère un access token
    generateAccessToken(payload: IJwtPayload): string {
        return jwt.sign(payload, JWT_SECRET, {expiresIn: ACCESS_TOKEN_EXPIRATION});
    }

    // Génère un refresh token
    generateRefreshToken(payload: IJwtPayload): string {
        return jwt.sign(payload, REFRESH_TOKEN_SECRET, {expiresIn: REFRESH_TOKEN_EXPIRATION});
    }

    // Vérifie le token JWT (access token)
    verifyAccessToken(token: string): IJwtPayload | null {
        try {
            return jwt.verify(token, JWT_SECRET) as IJwtPayload;
        } catch (error) {
            console.error('Erreur de validation du token JWT:', error);
            return null;
        }
    }

    // Vérifie le refresh token
    verifyRefreshToken(token: string): IJwtPayload | null {
        try {
            return jwt.verify(token, REFRESH_TOKEN_SECRET) as IJwtPayload;
        } catch (error) {
            console.error('Erreur de validation du refresh token:', error);
            return null;
        }
    }

    // Génère à la fois un access token et un refresh token
    generateTokens(payload: IJwtPayload): { accessToken: string, refreshToken: string } {
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken(payload);
        return {accessToken, refreshToken};
    }

    // Rafraîchit l'access token à partir d'un refresh token valide
    refreshAccessToken(refreshToken: string): string | null {
        const payload = this.verifyRefreshToken(refreshToken);
        if (payload) {
            return this.generateAccessToken(payload);
        }
        return null;
    }
}

export default new JwtService();