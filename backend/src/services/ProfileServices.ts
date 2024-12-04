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


        if (!profileData.location) {
            profileData.location = {latitude: 45.7844, longitude: 4.7355, city: 'Charbonnières-les-Bains'};
        }
        // if (profileData.location) {
        const {latitude, longitude, city} = profileData.location;

        try {
            const cityName = await reverseGeocodeOpenCage(latitude, longitude);
            let location = await locationDAL.findByCoordinates(latitude, longitude);

            if (location?.location_id && city) {
                await locationDAL.update(location.location_id, city);
            }

            if (location) {
                locationId = location.location_id;
            } else {
                locationId = await locationDAL.create(latitude, longitude, cityName);
            }
        } catch (error) {
            throw new Error('Impossible de déterminer la localisation. Veuillez réessayer plus tard.');
        }

        const profileDataWithLocationId = {
            ...profileData,
            location: locationId,
        };

        return await profileDAL.create(userId, profileDataWithLocationId);
    }

    async updateProfile(userId: number, profileData: ProfileUpdateDto): Promise<void> {
        const profile = await profileDAL.findByUserId(userId);
        if (!profile) {
            throw {status: 404, message: 'Profil non trouvé'};
        }

        let locationId: number | undefined = undefined;

        if (!profileData.location) {
            profileData.location = {latitude: 45.7844, longitude: 4.7355, city: 'Charbonnières-les-Bains'};
        }
        // if (profileData.location) {
        const {latitude, longitude, city} = profileData.location;

        try {
            const cityName = await reverseGeocodeOpenCage(latitude, longitude);

            let location = await locationDAL.findByCoordinates(latitude, longitude);

            if (location?.location_id && cityName && cityName != 'Unknown') {
                await locationDAL.update(location.location_id, cityName);
            }
            if (location) {
                locationId = location.location_id;
            } else {
                locationId = await locationDAL.create(latitude, longitude, cityName);
            }
        } catch (error) {
            throw new Error('Impossible de déterminer la localisation. Veuillez réessayer plus tard.');
        }

        const profileDataToUpdate: any = {
            ...profileData,
            location: locationId,
        };

        await profileDAL.update(profile.profile_id, profileDataToUpdate);
    }

    async deleteProfile(userId: number): Promise<void> {
        const profile = await profileDAL.findByUserId(userId);
        if (!profile) {
            throw {status: 404, message: 'Profil non trouvé'};
        }

        await profileDAL.delete(profile.profile_id);
    }
}

export default new ProfileServices();
