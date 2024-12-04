import userDAL from "../DataAccessLayer/UserDAL";
import { PasswordService } from "./PasswordService";
import { LoginDto } from "../DTOs/login/LoginDto";
import JwtService from "./JwtService";
import { IJwtPayload } from "../types/IJwtPayload";
import { LoginResponseDTO } from "../DTOs/login/LoginResponseDTO";

class LoginServices {
    async login(userTryLogin: LoginDto): Promise<LoginResponseDTO | null> {
        const user = await userDAL.findOneByEmail(userTryLogin.email.toLowerCase());
        if (!user) {
            return null;
        }

        if (await PasswordService.verifyPassword(userTryLogin.password, user.password)) {
            const userResponse = await userDAL.findOne(user.id);

            if (!userResponse) {
                return null;
            }

            const payload: IJwtPayload = { id: user.id };
            const { accessToken, refreshToken } = JwtService.generateTokens(payload);

            return {
                user: userResponse,
                accessToken,
                refreshToken
            };
        }

        return null;
    }
}

export default new LoginServices();
