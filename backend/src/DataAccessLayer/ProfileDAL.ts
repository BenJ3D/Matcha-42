import db from '../config/knexConfig';
import {ProfileResponseDto} from '../DTOs/profiles/ProfileResponseDto';
import {Gender} from "../models/Genders";

class ProfileDAL {
    async findOne(profileId: number): Promise<ProfileResponseDto | null> {
        try {
            const profile = await db('profiles')
                .select('*')
                .where({profile_id: profileId})
                .first();

            if (!profile) return null;

            return profile;
        } catch (error) {
            console.error(`Erreur lors de la récupération du profil avec l'ID ${profileId}:`, error);
            throw {status: 500, message: "Erreur interne du serveur."};
        }
    }

    async findByUserId(userId: number): Promise<ProfileResponseDto | null> {
        try {
            const profile = await db('profiles')
                .select('*')
                .where({owner_user_id: userId})
                .first();

            if (!profile) return null;

            return profile;
        } catch (error: any) {
            console.error(`Erreur lors de la récupération du profil pour l'utilisateur ID ${userId}:`, error);
            throw {status: error.status || 500, message: error.message || "Erreur interne du serveur."};
        }
    }

    async create(userId: number, profileData: any): Promise<number> {
        try {
            const {biography, gender, age, main_photo_id, location} = profileData;

            const profileFields: any = {
                owner_user_id: userId,
                biography,
                gender,
                age,
                main_photo_id,
                location,
            };

            const [{profile_id: profileId}] = await db('profiles')
                .insert(profileFields)
                .returning('profile_id');

            const {tags, sexualPreferences} = profileData;

            if (tags && tags.length > 0) {
                await db('profile_tag').insert(
                    tags.map((tagId: number) => ({
                        profile_id: profileId,
                        profile_tag: tagId,
                    }))
                );
            }

            if (sexualPreferences && sexualPreferences.length > 0) {
                await db('profile_sexual_preferences').insert(
                    sexualPreferences.map((genderId: number) => ({
                        profile_id: profileId,
                        gender_id: genderId,
                    }))
                );
            }

            return profileId;
        } catch (error: any) {
            console.error("Erreur lors de la création du profil:", error);
            if (error.code === '23505') {
                throw {status: 409, message: "Conflit : Le profil existe déjà."};
            } else if (error.code === '23503') {
                throw {status: 400, message: error.detail || "Un ou plusieurs identifiants fournis sont invalides."};
            } else {
                throw {status: 500, message: "Erreur interne du serveur."};
            }
        }
    }

    async update(profileId: number, profileData: any): Promise<void> {
        try {
            const profile = await this.findOne(profileId);
            if (!profile) {
                throw {status: 404, message: 'Profil non trouvé.'};
            }

            const {biography, gender, age, main_photo_id, location, tags, sexualPreferences} = profileData;
            const profileFields: any = {};

            if (biography !== undefined) profileFields.biography = biography;
            if (gender !== undefined) profileFields.gender = gender;
            if (age !== undefined) profileFields.age = age;
            if (main_photo_id !== undefined) profileFields.main_photo_id = main_photo_id;
            if (location !== undefined) profileFields.location = location;

            if (Object.keys(profileFields).length > 0) {
                await db('profiles').where({profile_id: profileId}).update(profileFields);
            }

            if (tags !== undefined) {
                await db('profile_tag').where({profile_id: profileId}).del();
                if (tags.length > 0) {
                    await db('profile_tag').insert(
                        tags.map((tagId: number) => ({
                            profile_id: profileId,
                            profile_tag: tagId,
                        }))
                    );
                }
            }

            if (sexualPreferences !== undefined) {
                await db('profile_sexual_preferences').where({profile_id: profileId}).del();
                if (sexualPreferences.length > 0) {
                    await db('profile_sexual_preferences').insert(
                        sexualPreferences.map((genderId: number) => ({
                            profile_id: profileId,
                            gender_id: genderId,
                        }))
                    );
                }
            }
        } catch (error: any) {
            console.error(`Erreur lors de la mise à jour du profil ID ${profileId}:`, error);

            if (error.status === 404) {
                throw error;
            } else if (error.code === '23503') {
                // Gérer les violations de contraintes de clé étrangère
                throw {status: 400, message: error.detail || "Un ou plusieurs identifiants fournis sont invalides."};
            } else {
                throw {status: 500, message: "Erreur interne du serveur."};
            }
        }
    }

    async delete(profileId: number): Promise<void> {
        try {
            const profile = await this.findOne(profileId);
            if (!profile) {
                throw {status: 404, message: 'Profil non trouvé.'};
            }

            await db.transaction(async trx => {
                await trx('profile_tag').where({profile_id: profileId}).del();
                await trx('profile_sexual_preferences').where({profile_id: profileId}).del();
                await trx('profiles').where({profile_id: profileId}).del();
            });

            console.log(`Profil avec l'ID ${profileId} supprimé.`);
        } catch (error: any) {
            console.error(`Erreur lors de la suppression du profil ID ${profileId}:`, error);
            if (error.status === 404) {
                throw error;
            } else if (error.code === '23503') {
                throw {status: 400, message: "Erreur : Contrainte de clé étrangère."};
            } else {
                throw {status: 500, message: "Erreur interne du serveur."};
            }
        }
    }

    async getSexualPreferences(profileId: number): Promise<Gender[]> {
        try {
            const preferences: Gender[] = await db('genders')
                .select('genders.gender_id', 'genders.name', 'genders.description')
                .join('profile_sexual_preferences', 'genders.gender_id', 'profile_sexual_preferences.gender_id')
                .where('profile_sexual_preferences.profile_id', profileId);

            return preferences;
        } catch (error) {
            console.error(`Erreur lors de la récupération des préférences sexuelles pour le profil ID ${profileId}:`, error);
            throw {status: 500, message: "Erreur interne du serveur."};
        }
    }

    async updateMainPhoto(userId: number, photoId: number | null): Promise<void> {
        const profile = await this.findByUserId(userId);
        if (!profile) {
            throw {status: 404, message: 'Profil non trouvé.'};
        }

        await db('profiles').where('owner_user_id', userId).update({main_photo_id: photoId});
    }

}

export default new ProfileDAL();
