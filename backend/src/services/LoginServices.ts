import userDAL from "../DataAccessLayer/UserDAL";
import {UserResponseDto} from "../DTOs/users/UserResponseDto";
import {PasswordService} from "./PasswordService";
import {LoginDto} from "../DTOs/login/LoginDto";

class LoginServices {
    async login(userTryLogin: LoginDto): Promise<UserResponseDto | null> {
        const user = await userDAL.findOneByEmail(userTryLogin.email);
        if (!user) {
            return null;
        }
        if (await PasswordService.verifyPassword(userTryLogin.password, user.password)) {
            return await userDAL.findOne(user.id);
        }
        return null;
    }
}

export default new LoginServices();