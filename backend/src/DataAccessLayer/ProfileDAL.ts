// src/DataAccessLayer/ProfileDAL.ts
import db from '../config/knexConfig';
import {ProfileCreateDto} from '../DTOs/profiles/ProfileCreateDto';
import {ProfileUpdateDto} from '../DTOs/profiles/ProfileUpdateDto';
import {ProfileResponseDto} from '../DTOs/profiles/ProfileResponseDto';

class ProfileDAL {
    async findOne(profileId: number): Promise<ProfileResponseDto | null> {
        const profile = await db('profiles')
            .select('*')
            .where({profile_id: profileId})
            .first();

        if (!profile) return null;

        // Récupérer les tags, photos, etc., si nécessaire
        // ...
        return profile;
    }

    async findByUserId(userId: number): Promise<ProfileResponseDto | null> {
        const profile = await db('profiles')
            .select('*')
            .where({owner_user_id: userId})
            .first();

        if (!profile) return null;

        // Récupérer les tags, photos, etc., si nécessaire
        // ...
        return profile;
    }

    async create(userId: number, profileData: any): Promise<number> {
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

        // Gérer les tags et les préférences sexuelles
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
    }

    async update(profileId: number, profileData: any): Promise<void> {
        const {biography, gender, age, main_photo_id, location} = profileData;

        const profileFields: any = {};
        if (biography !== undefined) profileFields.biography = biography;
        if (gender !== undefined) profileFields.gender = gender;
        if (age !== undefined) profileFields.age = age;
        if (main_photo_id !== undefined) profileFields.main_photo_id = main_photo_id;
        if (location !== undefined) profileFields.location = location;

        if (Object.keys(profileFields).length > 0) {
            await db('profiles')
                .where({profile_id: profileId})
                .update(profileFields);
        }

        // Gérer les tags et les préférences sexuelles
        const {tags, sexualPreferences} = profileData;

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
    }

    async delete(profileId: number): Promise<void> {
        // Utiliser une transaction pour garantir l'intégrité de l'opération
        await db.transaction(async trx => {
            // Supprimer les enregistrements dans profile_tag
            await trx('profile_tag').where({profile_id: profileId}).del();

            // Supprimer les enregistrements dans profile_sexual_preferences
            await trx('profile_sexual_preferences').where({profile_id: profileId}).del();

            //TODO: Supprimer enregistrements des autres tables associées si nécessaire
            // photos / messages etc.

            // Supprimer le profil
            await trx('profiles').where({profile_id: profileId}).del();
        });
    }
}

export default new ProfileDAL();
