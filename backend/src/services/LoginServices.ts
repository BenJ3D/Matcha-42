import userDAL from "../DataAccessLayer/UserDAL";
import {PasswordService} from "./PasswordService";
import {LoginDto} from "../DTOs/login/LoginDto";
import JwtService from "./JwtService";
import {IJwtPayload} from "../types/IJwtPayload";
import {LoginResponseDTO} from "../DTOs/login/LoginResponseDTO";

class LoginServices {
    async login(userTryLogin: LoginDto): Promise<LoginResponseDTO | null> {
        // Récupérer l'utilisateur à partir de l'email fourni
        const user = await userDAL.findOneByEmail(userTryLogin.email.toLowerCase());
        if (!user) {
            return null; // Si l'utilisateur n'existe pas
        }

        // Vérification du mot de passe
        if (await PasswordService.verifyPassword(userTryLogin.password, user.password)) {
            const userResponse = await userDAL.findOne(user.id);

            if (!userResponse) {
                return null;
            }

            // Créer le payload pour le token JWT
            const payload: IJwtPayload = {id: user.id};

            // Générer les tokens
            const {accessToken, refreshToken} = JwtService.generateTokens(payload);

            // Retourner les informations utilisateur + les tokens
            return {
                user: userResponse,   // Informations de l'utilisateur
                accessToken,          // Access token
                refreshToken          // Refresh token
            };
        }

        return null; // Si le mot de passe est incorrect
    }
}

export default new LoginServices();
