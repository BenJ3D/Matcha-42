import profileDAL from '../DataAccessLayer/ProfileDAL';
import {ProfileCreateDto} from '../DTOs/profiles/ProfileCreateDto';
import {ProfileUpdateDto} from '../DTOs/profiles/ProfileUpdateDto';
import {ProfileResponseDto} from '../DTOs/profiles/ProfileResponseDto';
import locationDAL from "../DataAccessLayer/LocationDAL";
import {Entry} from "node-geocoder";
import {reverseGeocodeOpenCage} from "../utils/reverseGeocodeOpenCage";

interface EntryExtended extends Entry {
    _normalized_city: string;
}

class ProfileServices {
    async getProfileByUserId(userId: number): Promise<ProfileResponseDto | null> {
        return await profileDAL.findByUserId(userId);
    }

    async createProfile(userId: number, profileData: ProfileCreateDto): Promise<number> {
        let locationId: number | undefined = undefined;

        if (profileData.location) {
            const {latitude, longitude, city} = profileData.location;

            try {
                // Obtenir le nom de la ville à partir des coordonnées
                const cityName = await reverseGeocodeOpenCage(latitude, longitude);
                console.log('City name:', city);
                // Vérifier si la localisation existe déjà
                let location = await locationDAL.findByCoordinates(latitude, longitude);

                // privilégier le nom de la ville du front
                if (location?.location_id && city) {
                    await locationDAL.update(location.location_id, city);
                }

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
            const {latitude, longitude, city} = profileData.location;

            try {
                // Obtenir le nom de la ville à partir des coordonnées
                const cityName = await reverseGeocodeOpenCage(latitude, longitude);

                // Vérifier si la localisation existe déjà
                let location = await locationDAL.findByCoordinates(latitude, longitude);
                console.log(JSON.stringify(location))

                // privilégier le nom de la ville du front
                if (location?.location_id && cityName && cityName != 'Unknown') {
                    await locationDAL.update(location.location_id, cityName);
                }
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
