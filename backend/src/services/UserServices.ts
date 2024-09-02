import {User} from "../models/User";
import UserDAL from "../DataAccessLayer/UserDAL"
import userDAL from "../DataAccessLayer/UserDAL";

class UserServices {
    async getAllUsers(): Promise<User[]> {
        return await UserDAL.findAll();
    }

    async getUserById(id: number): Promise<User | null> {
        return await userDAL.findOne(id);
    }
}


export default new UserServices();