import userDAL from "../DataAccessLayer/UserDAL";
import {UserLightResponseDTO} from "../DTOs/users/UserLightResponseDTO";
import {UserResponseDTO} from "../DTOs/users/UserResponseDTO";
import {UserCreateDTO} from "../DTOs/users/UserCreateDTO";
import {PasswordService} from "./PasswordService";

class UserServices {
    async getAllUsers(): Promise<UserLightResponseDTO[]> {
        return await userDAL.findAll();
    }

    async getUserById(id: number): Promise<UserResponseDTO | null> {
        return await userDAL.findOne(id);
    }

    async createUser(newUser: UserCreateDTO): Promise<number> {
        newUser.password = await PasswordService.hashPassword(newUser.password);
        return await userDAL.save(newUser);
    }
}

export default new UserServices();