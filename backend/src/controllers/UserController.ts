import {Request, Response} from 'express';
import UserServices from '../services/UserServices';
import {UserLightResponseDto} from "../DTOs/users/UserLightResponseDto";
import {UserResponseDto} from "../DTOs/users/UserResponseDto";
import {UserCreateDtoValidation} from "../DTOs/users/UserCreateDtoValidation";
import userServices from "../services/UserServices";
import {UserUpdateDtoValidation} from "../DTOs/users/UserUpdateDtoValidation";
import {AuthenticatedRequest} from "../middlewares/authMiddleware";
import {SearchValidationSchema} from "../DTOs/users/SearchValidationSchemaDto";
import {VALID_SORT_FIELDS, VALID_ORDER_VALUES, SortField, SortOrder} from '../config/sortConfig';
import {UserEmailPatchDtoValidation} from "../DTOs/users/UserEmailPatchDtoValidation";
import {validateIdNumber} from "../utils/validateIdNumber";
import {UserOtherResponseDto} from "../DTOs/users/UserOtherResponseDto";

const userController = {
    getAllUsers: async (req: Request, res: Response) => {
        try {
            const users: UserLightResponseDto[] = await UserServices.getAllUsers();
            res.json(users);
        } catch (error: any) {
            res.status(error.status).json({error: 'Could not fetch users'});
        }
    },

    getMe: async (req: AuthenticatedRequest, res: Response) => {
        try {
            let userId: number;
            if (!req.userId) {
                return res.status(401).json({error: "Non Authenticated"});
            }
            userId = req.userId;
            if (isNaN(userId)) {
                return res.status(400).json({message: 'Invalid user ID'});
            }
            const user: UserResponseDto | null = await UserServices.getUserById(userId);
            if (!user) {
                return res.status(404).json({message: 'User not found'});
            }
            res.json(user);
        } catch (error: any) {
            res.status(error.status).json({error: error.message});

        }
    },

    getUserById: async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!req.userId) {
                return res.status(401).json({error: "Non Authenticated"});
            }
            const currentUserId = req.userId;
            const userId = parseInt(req.params.id, 10);
            if (currentUserId == userId) {
                return res.status(204).json({message: 'Its yourself'});

            }
            if (isNaN(userId)) {
                return res.status(400).json({message: 'Invalid user ID'});
            }
            const user: UserOtherResponseDto | null = await UserServices.getUserOtherById(currentUserId, userId);
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

    updateUser: async (req: AuthenticatedRequest, res: Response) => {
        const {error, value: updateUser} = UserUpdateDtoValidation.validate(req.body);

        if (error) {
            return res.status(400).json({error: "Validation échouée", details: error.details});
        }

        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({error: "Non Authenticated"});
            }
            const existingUser = await userServices.getUserById(userId);
            if (!existingUser) {
                return res.status(404).json({message: "Utilisateur non trouvé."});
            }

            await userServices.updateUser(userId, updateUser);
            return res.status(200).json({message: "Utilisateur mis à jour avec succès."});

        } catch (e: any) {
            if (e.code === '23505') {
                return res.status(409).json({error: "Cet email est déjà pris."});
            }

            res.status(e.status || 500).json({error: e.message || "Erreur"});
        }
    },

    patchUserEmail: async (req: AuthenticatedRequest, res: Response) => {
        const {error, value: patchUser} = UserEmailPatchDtoValidation.validate(req.body);
        if (error) {
            return res.status(400).json({error: "Validation échouée", details: error.details});
        }

        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({error: "Non Authenticated"});
            }
            validateIdNumber(userId, res);
            const existingUser = await userServices.getUserById(userId);
            if (!existingUser) {
                return res.status(404).json({message: "Utilisateur non trouvé."});
            }

            await userServices.patchEmailUser(existingUser, patchUser);
            return res.status(200).json({message: "Email utilisateur mis à jour avec succès."});

        } catch (e: any) {
            if (e.code === '23505') {
                return res.status(409).json({error: "Cet email est déjà pris."});
            }

            res.status(e.status || 500).json({error: e.message || "Erreur"});
        }
    },

    sendEmailForVerification: async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({error: "Non Authenticated"});
            }
            validateIdNumber(userId, res);
            const existingUser = await userServices.getUserById(userId);
            if (!existingUser) {
                return res.status(404).json({message: "Utilisateur non trouvé."});
            }

            await userServices.sendEmailWithTokenEmailValidation(existingUser);
            return res.status(200).json({message: "Email envoyé."});

        } catch (e: any) {
            if (e.code === '23505') {
                return res.status(409).json({error: "Cet email est déjà pris."});
            }

            res.status(e.status || 500).json({error: e.message || "Erreur"});
        }
    },

    deleteUser: async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.userId;
            validateIdNumber(userId, res);
            if (!userId) {
                return res.status(401).json({error: "Non Authenticated"});
            }
            if (isNaN(userId)) {
                return res.status(400).json({message: 'Invalid user ID'});
            }

            await userServices.deleteUser(userId);
            return res.status(200).json({message: "Utilisateur supprimé avec succès."});
        } catch (e: any) {
            res.status(e.status || 500).json({error: e.message || "Erreur"});
        }
    },

    advancedSearch: async (req: AuthenticatedRequest, res: Response) => {
        const {error, value: newUser} = SearchValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({error: "Validation échouée", details: error.details});
        }

        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({error: "Non Authenticated"});
            }

            const {
                ageMin,
                ageMax,
                fameMin,
                fameMax,
                location,
                tags,
                sortBy,
                order
            } = req.query;

            const ageMinInt = ageMin ? parseInt(ageMin as string, 10) : undefined;
            const ageMaxInt = ageMax ? parseInt(ageMax as string, 10) : undefined;
            const fameMinInt = fameMin ? parseFloat(fameMin as string) : undefined;
            const fameMaxInt = fameMax ? parseFloat(fameMax as string) : undefined;
            const tagsArray = tags ? (tags as string).split(',').map(Number) : undefined;
            const sortByStr = sortBy ? (sortBy as string) : undefined;
            const orderStr = order ? (order as string).toLowerCase() : 'asc';

            if (sortByStr && !VALID_SORT_FIELDS.includes(sortByStr as SortField)) {
                return res.status(400).json({
                    error: `Le champ de tri '${sortByStr}' n'est pas valide. Les champs valides sont : ${VALID_SORT_FIELDS.join(', ')}.`
                });
            }

            if (orderStr && !VALID_ORDER_VALUES.includes(orderStr as SortOrder)) {
                return res.status(400).json({
                    error: `La valeur de 'order' doit être 'asc' ou 'desc'.`
                });
            }

            const results = await userServices.advancedSearch(
                userId,
                ageMinInt,
                ageMaxInt,
                fameMinInt,
                fameMaxInt,
                location as string,
                tagsArray,
                sortByStr,
                orderStr
            );

            return res.json(results);
        } catch (e: any) {
            if (e.code === '22P02')
                return res.status(400).json({error: 'Validation data error'});
            return res.status(e.status || 500).json({error: e.message});
        }
    }
};

export default userController;
