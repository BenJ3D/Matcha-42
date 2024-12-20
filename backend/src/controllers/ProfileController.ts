import {Response} from 'express';
import profileServices from '../services/ProfileServices';
import {ProfileCreateDtoValidation} from '../DTOs/profiles/ProfileCreateDto';
import {ProfileUpdateDtoValidation} from '../DTOs/profiles/ProfileUpdateDto';
import {AuthenticatedRequest} from '../middlewares/authMiddleware';

class ProfileController {

    async createMyProfile(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const {error, value} = ProfileCreateDtoValidation.validate(req.body);

            if (error) {
                return res.status(400).json({error: error.message});
            }
            const existingProfile = await profileServices.getProfileByUserId(userId);
            if (existingProfile) {
                return res.status(400).json({error: 'Profil déjà existant'});
            }

            const profileId = await profileServices.createProfile(userId, value);
            res.status(201).json({profileId});
        } catch (e: any) {
            res.status(e.status || 500).json({error: e.message})
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
        } catch (e: any) {
            res.status(e.status || 500).json({error: e.message})
        }
    }

    async deleteMyProfile(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            await profileServices.deleteProfile(userId);
            res.status(200).json({message: 'Profil supprimé avec succès'});
        } catch (error: any) {
            if (error.status === 404) {
                res.status(404).json({error: error.message});
            } else {
                res.status(error.status || 500).json({error: error.message});
            }
        }
    }
}

export default new ProfileController();
