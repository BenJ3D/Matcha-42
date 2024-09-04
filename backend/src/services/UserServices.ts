import UserDAL from "../DataAccessLayer/UserDAL"
import userDAL from "../DataAccessLayer/UserDAL";
import {UserLightResponseDTO} from "../DTOs/users/UserLightResponseDTO";
import {UserResponseDTO} from "../DTOs/users/UserResponseDTO";

class UserServices {
    async getAllUsers(): Promise<UserLightResponseDTO[]> {
        return await UserDAL.findAll();
    }

    async getUserById(id: number): Promise<UserResponseDTO | null> {
        return await userDAL.findOne(id);
    }
}


export default new UserServices();