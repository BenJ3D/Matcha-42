import userDAL from "../DataAccessLayer/UserDAL";
import {UserLightResponseDto} from "../DTOs/users/UserLightResponseDto";
import {UserResponseDto} from "../DTOs/users/UserResponseDto";
import {UserCreateDto} from "../DTOs/users/UserCreateDto";
import {PasswordService} from "./PasswordService";
import {UserUpdateDto} from "../DTOs/users/UserUpdateDto";
import profileDAL from "../DataAccessLayer/ProfileDAL";

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

    async setOnlineUser(userId: number): Promise<void> {
        return await userDAL.updateOnlineStatus(userId, true);
    }

    async setOfflineUser(userId: number): Promise<void> {
        return await userDAL.updateOnlineStatus(userId, false);
    }


    async advancedSearch(
        userId: number,
        ageMin?: number,
        ageMax?: number,
        fameMin?: number,
        fameMax?: number,
        location?: string,
        tags?: number[],
        sortBy?: string,
        order?: string
    ): Promise<any[]> {
        // Récupérer le profil de l'utilisateur
        const userProfile = await profileDAL.findByUserId(userId);
        if (!userProfile) {
            throw {status: 404, message: 'Profil non trouvé'};
        }

        // Récupérer les préférences sexuelles de l'utilisateur
        const sexualPreferences = await profileDAL.getSexualPreferences(userProfile.profile_id);

        //Recup genre de l'utilisateur
        const userGender = userProfile.gender;

        const filters = {
            ageMin,
            ageMax,
            fameMin,
            fameMax,
            location,
            tags,
            preferredGenders: sexualPreferences.map((gender) => gender.gender_id),
            sortBy,
            order,
        };

        return await userDAL.advancedSearch(filters, userId, userGender);
    }

}

export default new UserServices();