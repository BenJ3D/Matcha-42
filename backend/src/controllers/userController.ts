import {Request, Response} from 'express';
import UserServices from '../services/UserServices';
import {UserLightResponseDTO} from "../DTOs/users/UserLightResponseDTO";
import {UserResponseDTO} from "../DTOs/users/UserResponseDTO";

const userController = {
    // Méthode pour gérer la route GET /users
    getAllUsers: async (req: Request, res: Response) => {
        try {
            const users : UserLightResponseDTO[] = await UserServices.getAllUsers();
            res.json(users);
        } catch (error: any) {
            console.error("Error fetching users:", error);
            res.status(500).json({error: 'Could not fetch users'});
        }
    },

    getUserById: async (req: Request, res: Response) => {
        try {
            const userId = parseInt(req.params.id, 10);
            const user: UserResponseDTO | null = await UserServices.getUserById(userId);
            if (!user) {
                return res.status(404).json({message: 'User not found'});
            }
            res.json(user);
        } catch (error: any) {
            res.status(500).json({error: error.message});

        }
    }

};

export default userController;
