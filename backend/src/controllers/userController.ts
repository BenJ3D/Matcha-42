// controllers/userController.ts
import {Request, Response} from 'express';
import UserServices from '../services/UserServices';

const userController = {
    // Méthode pour gérer la route GET /users
    getAllUsers: async (req: Request, res: Response) => {
        try {
            const users = await UserServices.getAllUsers(); // Appel au service
            res.json(users);
        } catch (error: any) {
            console.error("Error fetching users:", error);
            res.status(500).json({error: 'Could not fetch users'});
        }
    },

    getUserById: async (req: Request, res: Response) => {
        try {
            const userId = parseInt(req.params.id, 10);
            const user = await UserServices.getUserById(userId);
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
