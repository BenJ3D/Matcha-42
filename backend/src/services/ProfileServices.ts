import profileDAL from '../DataAccessLayer/ProfileDAL';
import {ProfileCreateDto} from '../DTOs/profiles/ProfileCreateDto';
import {ProfileUpdateDto} from '../DTOs/profiles/ProfileUpdateDto';
import {ProfileResponseDto} from '../DTOs/profiles/ProfileResponseDto';
import geocoder from "../config/geocoder";
import locationDAL from "../DataAccessLayer/LocationDAL";

class ProfileServices {
    async getProfileByUserId(userId: number): Promise<ProfileResponseDto | null> {
        return await profileDAL.findByUserId(userId);
    }

    async createProfile(userId: number, profileData: ProfileCreateDto): Promise<number> {
        let locationId: number | undefined = undefined;

        if (profileData.location) {
            const {latitude, longitude} = profileData.location;

            try {
                // Obtenir le nom de la ville à partir des coordonnées
                const res = await geocoder.reverse({lat: latitude, lon: longitude});
                let cityName = null;
                if (res && res.length > 0) {
                    if (res[0].city)
                        cityName = res[0].city;
                    else if (res[0].district)
                        cityName = res[0].district;
                }
                console.log('DBG LOCATION :', res[0]);

                // Vérifier si la localisation existe déjà
                let location = await locationDAL.findByCoordinates(latitude, longitude);

                if (location) {
                    locationId = location.location_id;
                } else {
                    // Créer une nouvelle localisation
                    locationId = await locationDAL.create(latitude, longitude, cityName);
                }
            } catch (error) {
                console.error('Erreur lors du géocodage inverse :', error);
                throw new Error('Impossible de déterminer la localisation. Veuillez réessayer plus tard.');
            }
        }

        // Préparer les données du profil avec l'ID de localisation
        const profileDataWithLocationId = {
            ...profileData,
            location: locationId, // Ajouter l'ID de localisation dans les données du profil
        };

        return await profileDAL.create(userId, profileDataWithLocationId);
    }

    async updateProfile(userId: number, profileData: ProfileUpdateDto): Promise<void> {
        const profile = await profileDAL.findByUserId(userId);
        if (!profile) {
            throw {status: 404, message: 'Profil non trouvé'};
        }

        let locationId: number | undefined = undefined;

        if (profileData.location) {
            const {latitude, longitude} = profileData.location;

            try {
                // Obtenir le nom de la ville à partir des coordonnées
                const res = await geocoder.reverse({lat: latitude, lon: longitude});
                let cityName = null;
                if (res && res.length > 0 && res[0].city) {
                    cityName = res[0].city;
                }
                console.log('DBG LOCATION :', res[0]);

                // Vérifier si la localisation existe déjà
                let location = await locationDAL.findByCoordinates(latitude, longitude);

                if (location) {
                    locationId = location.location_id;
                } else {
                    // Créer une nouvelle localisation
                    locationId = await locationDAL.create(latitude, longitude, cityName);
                }
            } catch (error) {
                console.error('Erreur lors du géocodage inverse :', error);
                throw new Error('Impossible de déterminer la localisation. Veuillez réessayer plus tard.');
            }
        }

        // Préparer les données du profil avec l'ID de localisation
        const profileDataToUpdate: any = {
            ...profileData,
            location: locationId, // Ajouter l'ID de localisation dans les données du profil
        };

        await profileDAL.update(profile.profile_id, profileDataToUpdate);
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
