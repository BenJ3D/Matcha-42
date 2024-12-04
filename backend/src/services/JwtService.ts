import jwt from 'jsonwebtoken';
import { IJwtPayload } from "../types/IJwtPayload";

if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("Les variables d'environnement JWT_SECRET et REFRESH_TOKEN_SECRET sont obligatoires.");
}


const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRATION = '2h';
const REFRESH_TOKEN_EXPIRATION = '7d';


class JwtService {
    generateAccessToken(payload: IJwtPayload): string {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });
    }

    generateRefreshToken(payload: IJwtPayload): string {
        return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION });
    }

    verifyAccessToken(token: string): IJwtPayload | null {
        try {
            return jwt.verify(token, JWT_SECRET) as IJwtPayload;
        } catch (error) {
            return null;
        }
    }

    verifyRefreshToken(token: string): IJwtPayload | null {
        try {
            return jwt.verify(token, REFRESH_TOKEN_SECRET) as IJwtPayload;
        } catch (error) {
            return null;
        }
    }

    generateGenericToken(payload: IJwtPayload, secret: string, expiration: string): string {
        return jwt.sign(payload, secret, { expiresIn: expiration });
    }

    verifyGenericToken(token: string, secret: string): IJwtPayload | null {
        try {
            return jwt.verify(token, secret) as IJwtPayload;
        } catch (error) {
            return null;
        }
    }

    generateTokens(payload: IJwtPayload): { accessToken: string, refreshToken: string } {
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken(payload);
        return { accessToken, refreshToken };
    }

    refreshAccessToken(refreshToken: string): string | null {
        const payload = this.verifyRefreshToken(refreshToken);
        if (payload) {
            return this.generateAccessToken(payload);
        }
        return null;
    }

    decodeToken(token: string): IJwtPayload | null {
        try {
            const decoded = jwt.decode(token);
            if (decoded && typeof decoded === 'object') {
                return decoded as IJwtPayload;
            }
            return null;
        } catch (error) {
            return null;
        }
    }

}

export default new JwtService();
