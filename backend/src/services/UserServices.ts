import userDAL from "../DataAccessLayer/UserDAL";
import {UserLightResponseDto} from "../DTOs/users/UserLightResponseDto";
import {UserResponseDto} from "../DTOs/users/UserResponseDto";
import {UserCreateDto} from "../DTOs/users/UserCreateDto";
import {PasswordService} from "./PasswordService";
import {UserUpdateDto} from "../DTOs/users/UserUpdateDto";

class UserServices {
    async getAllUsers(): Promise<UserLightResponseDto[]> {
        return await userDAL.findAll();
    }

    async getUserById(id: number): Promise<UserResponseDto | null> {
        return await userDAL.findOne(id);
    }

    async createUser(newUser: UserCreateDto): Promise<number> {
        newUser.password = await PasswordService.hashPassword(newUser.password);
        return await userDAL.save(newUser);
    }

    async updateUser(userId: number, userUpdate: UserUpdateDto): Promise<void> {
        return await userDAL.update(userId, userUpdate);
    }

    async deleteUser(userId: number): Promise<void> {
        return await userDAL.delete(userId);
    }
}

export default new UserServices();