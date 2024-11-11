import {Request, Response} from 'express';
import loginServices from "../services/LoginServices";
import JwtService from "../services/JwtService";
import userServices from "../services/UserServices";
import {LoginDtoValidation} from "../DTOs/login/LoginDtoValidation";

const loginController = {
    // Méthode existante pour la connexion avec mot de passe
    loginWithPassword: async (req: Request, res: Response) => {
        const {error, value: loginUser} = LoginDtoValidation.validate(req.body);
        if (error) {
            return res.status(400).json({error: "Validation échouée", details: error.details});
        }
        try {
            const loginResult = await loginServices.login(loginUser);
            if (loginResult == null) {
                return res.status(401).json({error: "Identifiants incorrects"});
            }
            return res.status(200).json(loginResult); // Retourne les informations de l'utilisateur et les tokens
        } catch (e: any) {
            res.status(500).json({error: e.message});
        }
    },

    // Nouvelle méthode pour rafraîchir le token
    refreshToken: async (req: Request, res: Response) => {
        try {
            // Récupérer le refresh token depuis le corps de la requête
            const {refreshToken} = req.body;

            if (!refreshToken) {
                return res.status(400).json({error: "Le refresh token est requis"});
            }

            // Vérifier le refresh token
            const payload = JwtService.verifyRefreshToken(refreshToken);
            if (!payload) {
                return res.status(401).json({error: "Refresh token invalide"});
            }

            // Générer de nouveaux tokens
            const newTokens = JwtService.generateTokens({id: payload.id});


            const user = await userServices.getUserById(payload.id);
            if (!user) {
                return res.status(404).json({error: "Utilisateur non trouvé"});
            }

            // Retourner les nouveaux tokens (et les infos utilisateur si vous les incluez)
            return res.status(200).json({
                user,
                accessToken: newTokens.accessToken,
                refreshToken: newTokens.refreshToken,
            });
        } catch (e: any) {
            console.error("Erreur lors du rafraîchissement du token:", e);
            res.status(500).json({error: "Erreur"});
        }
    },
};

export default loginController;
