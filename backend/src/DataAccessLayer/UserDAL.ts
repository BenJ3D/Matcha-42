import {User} from "../models/User";
import db from "../config/knexConfig";
import {UserLightResponseDTO} from "../DTOs/users/UserLightResponseDTO";
import {UserResponseDTO} from "../DTOs/users/UserResponseDTO";

class UserDAL {
    findAll = async (): Promise<UserLightResponseDTO[]> => {
        try {
            const users = await db('users')
                .select(
                    'users.id',
                    'users.username',
                    'users.first_name',
                    'users.last_name',
                    'photos.url as main_photo_url'
                )
                .leftJoin('profiles', 'users.id', 'profiles.owner_user_id')
                .leftJoin('photos', 'profiles.main_photo_id', 'photos.photo_id');

            return users.map(user => ({
                id: user.id,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                main_photo_url: user.main_photo_url || null
            }));
        } catch (error) {
            console.error("Error fetching users:", error);
            throw new Error("Could not fetch users");
        }
    }

    findOne = async (id: number): Promise<UserResponseDTO | null> => {
        try {
            const user = await db<UserResponseDTO>('users').select('id', 'username', 'email', 'first_name', 'last_name', 'created_at')
                .where('id', id)
                .first();
            return user || null;
        } catch (error) {
            console.error("Error fetching user:", error);
            throw new Error(`Could not fetch user id ${id}`);
        }
    }
}


export default new UserDAL();
