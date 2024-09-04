import {Request, Response} from 'express';
import UserServices from '../services/UserServices';
import {UserLightResponseDTO} from "../DTOs/users/UserLightResponseDTO";
import {UserResponseDTO} from "../DTOs/users/UserResponseDTO";
import {UserCreateSchema} from "../DTOs/users/UserCreateValidation";
import userServices from "../services/UserServices";

const userController = {
    getAllUsers: async (req: Request, res: Response) => {
        try {
            const users: UserLightResponseDTO[] = await UserServices.getAllUsers();
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
    },

    createUser: async (req: Request, res: Response) => {
        const {error, value: newUser} = UserCreateSchema.validate(req.body);
        if (error) {
            return res.status(400).json({error: "Validation échouée", details: error.details});
        }
        try {
            // Insertion dans la base via le DAL
            const userId = await userServices.createUser(newUser);
            return res.status(201).json({userId});
        } catch (e: any) {
            res.status(500).json({error: e.message});

        }
    }

};

export default userController;
