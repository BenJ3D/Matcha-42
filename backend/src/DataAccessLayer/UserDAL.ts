import {User} from "../models/User";
import db from "../config/knexConfig";

class UserDAL {
    findAll = async (): Promise<User[]> => {
        try {
            const users = await db<User>('users').select('id', 'username', 'email', 'first_name', 'last_name', 'created_at');
            return users;
        } catch (error) {
            console.error("Error fetching users:", error);
            throw new Error("Could not fetch users");
        }
    }

    findOne = async (id: number): Promise<User | null> => {
        try {
            const user = await db<User>('users').select('id', 'username', 'email', 'first_name', 'last_name', 'created_at')
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
