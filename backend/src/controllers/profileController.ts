// src/controllers/profileController.ts
import {Request, Response} from 'express';
import profileServices from '../services/ProfileServices';
import {ProfileCreateDtoValidation} from '../DTOs/profiles/ProfileCreateDto';
import {ProfileUpdateDtoValidation} from '../DTOs/profiles/ProfileUpdateDto';
import {AuthenticatedRequest} from '../middlewares/authMiddleware';

class ProfileController {
    async getMyProfile(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const profile = await profileServices.getProfileByUserId(userId);

            if (!profile) {
                return res.status(404).json({error: 'Profil non trouvé'});
            }

            res.json(profile);
        } catch (error) {
            console.error('Erreur lors de la récupération du profil:', error);
            res.status(500).json({error: 'Erreur interne du serveur'});
        }
    }

    async createMyProfile(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const {error, value} = ProfileCreateDtoValidation.validate(req.body);

            if (error) {
                return res.status(400).json({error: error.details[0].message});
            }

            // Vérifier si l'utilisateur a déjà un profil
            const existingProfile = await profileServices.getProfileByUserId(userId);
            if (existingProfile) {
                return res.status(400).json({error: 'Profil déjà existant'});
            }

            const profileId = await profileServices.createProfile(userId, value);
            res.status(201).json({profileId});
        } catch (error) {
            console.error('Erreur lors de la création du profil:', error);
            res.status(500).json({error: 'Erreur interne du serveur'});
        }
    }

    async updateMyProfile(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const {error, value} = ProfileUpdateDtoValidation.validate(req.body);

            if (error) {
                return res.status(400).json({error: error.details[0].message});
            }

            await profileServices.updateProfile(userId, value);
            res.status(200).json({message: 'Profil mis à jour avec succès'});
        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil:', error);
            res.status(500).json({error: 'Erreur interne du serveur'});
        }
    }

    async deleteMyProfile(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            await profileServices.deleteProfile(userId);
            res.status(200).json({message: 'Profil supprimé avec succès'});
        } catch (error: any) {
            console.error('Erreur lors de la suppression du profil:', error);
            if (error.status === 404) {
                res.status(404).json({error: error.message});
            } else {
                res.status(500).json({error: 'Erreur interne du serveur'});
            }
        }
    }
}

export default new ProfileController();
