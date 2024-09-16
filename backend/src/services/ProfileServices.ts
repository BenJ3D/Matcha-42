// src/services/ProfileServices.ts
import profileDAL from '../DataAccessLayer/ProfileDAL';
import {ProfileCreateDto} from '../DTOs/profiles/ProfileCreateDto';
import {ProfileUpdateDto} from '../DTOs/profiles/ProfileUpdateDto';
import {ProfileResponseDto} from '../DTOs/profiles/ProfileResponseDto';

class ProfileServices {
    async getProfileByUserId(userId: number): Promise<ProfileResponseDto | null> {
        return await profileDAL.findByUserId(userId);
    }

    async createProfile(userId: number, profileData: ProfileCreateDto): Promise<number> {
        return await profileDAL.create(userId, profileData);
    }

    async updateProfile(userId: number, profileData: ProfileUpdateDto): Promise<void> {
        // Récupérer le profil pour vérifier s'il appartient à l'utilisateur
        const profile = await profileDAL.findByUserId(userId);
        if (!profile) {
            throw {status: 404, message: 'Profil non trouvé'};
        }

        await profileDAL.update(profile.profile_id, profileData);
    }

    async deleteProfile(userId: number): Promise<void> {
        // Récupérer le profil pour vérifier s'il appartient à l'utilisateur
        const profile = await profileDAL.findByUserId(userId);
        if (!profile) {
            throw {status: 404, message: 'Profil non trouvé'};
        }

        await profileDAL.delete(profile.profile_id);
    }
}

export default new ProfileServices();
