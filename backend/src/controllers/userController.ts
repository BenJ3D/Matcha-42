import {Request, Response} from 'express';
import UserServices from '../services/UserServices';
import {UserLightResponseDto} from "../DTOs/users/UserLightResponseDto";
import {UserResponseDto} from "../DTOs/users/UserResponseDto";
import {UserCreateDtoValidation} from "../DTOs/users/UserCreateDtoValidation";
import userServices from "../services/UserServices";
import {UserUpdateDtoValidation} from "../DTOs/users/UserUpdateDtoValidation";

const userController = {
    getAllUsers: async (req: Request, res: Response) => {
        try {
            const users: UserLightResponseDto[] = await UserServices.getAllUsers();
            res.json(users);
        } catch (error: any) {
            console.error("Error fetching users:", error);
            res.status(500).json({error: 'Could not fetch users'});
        }
    },

    getUserById: async (req: Request, res: Response) => {
        try {
            const userId = parseInt(req.params.id, 10);
            if (isNaN(userId)) {
                return res.status(400).json({message: 'Invalid user ID'});
            }
            const user: UserResponseDto | null = await UserServices.getUserById(userId);
            if (!user) {
                return res.status(404).json({message: 'User not found'});
            }
            res.json(user);
        } catch (error: any) {
            res.status(500).json({error: error.message});

        }
    },

    createUser: async (req: Request, res: Response) => {
        const {error, value: newUser} = UserCreateDtoValidation.validate(req.body);
        if (error) {
            return res.status(400).json({error: "Validation échouée", details: error.details});
        }
        try {
            const userId = await userServices.createUser(newUser);
            return res.status(201).json({userId});
        } catch (e: any) {
            res.status(e.status || 500).json({error: e.message});
        }
    },

    updateUser: async (req: Request, res: Response) => {
        const {error, value: updateUser} = UserUpdateDtoValidation.validate(req.body);

        if (error) {
            return res.status(400).json({error: "Validation échouée", details: error.details});
        }

        try {
            const userId = parseInt(req.params.id, 10);

            const existingUser = await userServices.getUserById(userId);
            if (!existingUser) {
                return res.status(404).json({message: "Utilisateur non trouvé."});
            }

            await userServices.updateUser(userId, updateUser);
            return res.status(200).json({message: "Utilisateur mis à jour avec succès."});

        } catch (e: any) {
            if (e.code === '23505') {  // Violation d'unicité (par exemple, email déjà pris)
                return res.status(409).json({error: "Cet email est déjà pris."});
            }

            res.status(e.status || 500).json({error: e.message || "Erreur interne du serveur."});
        }
    },

    deleteUser: async (req: Request, res: Response) => {
        try {
            const userId = parseInt(req.params.id, 10);
            if (isNaN(userId)) {
                return res.status(400).json({message: 'Invalid user ID'});
            }

            await userServices.deleteUser(userId);
            return res.status(200).json({message: "Utilisateur supprimé avec succès."});
        } catch (e: any) {
            res.status(e.status || 500).json({error: e.message || "Erreur interne du serveur."});
        }
    },


};

export default userController;
