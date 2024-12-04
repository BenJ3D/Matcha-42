import { Request, Response } from 'express';
import loginServices from "../services/LoginServices";
import JwtService from "../services/JwtService";
import userServices from "../services/UserServices";
import { LoginDtoValidation } from "../DTOs/login/LoginDtoValidation";

const loginController = {
    loginWithPassword: async (req: Request, res: Response) => {
        const { error, value: loginUser } = LoginDtoValidation.validate(req.body);
        if (error) {
            return res.status(400).json({ error: "Validation échouée", details: error.details });
        }
        try {
            const loginResult = await loginServices.login(loginUser);
            if (loginResult == null) {
                return res.status(401).json({ error: "Identifiants incorrects" });
            }
            return res.status(200).json(loginResult);
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    },

    refreshToken: async (req: Request, res: Response) => {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({ error: "Le refresh token est requis" });
            }

            const payload = JwtService.verifyRefreshToken(refreshToken);
            if (!payload) {
                return res.status(401).json({ error: "Refresh token invalide" });
            }

            const newTokens = JwtService.generateTokens({ id: payload.id });


            const user = await userServices.getUserById(payload.id);
            if (!user) {
                return res.status(404).json({ error: "Utilisateur non trouvé" });
            }

            return res.status(200).json({
                user,
                accessToken: newTokens.accessToken,
                refreshToken: newTokens.refreshToken,
            });
        } catch (e: any) {
            res.status(500).json({ error: "Erreur" });
        }
    },
};

export default loginController;
