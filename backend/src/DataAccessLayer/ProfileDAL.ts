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

    async create(userId: number, profileData: ProfileCreateDto): Promise<number> {
        const [{profile_id: profileId}] = await db('profiles').insert({
            owner_user_id: userId,
            biography: profileData.biography,
            gender: profileData.gender,
            age: profileData.age,
            main_photo_id: profileData.main_photo_id,
            location: profileData.location, // Utiliser 'location'
        }).returning('profile_id');

        // Gérer l'insertion des tags et des préférences sexuelles
        if (profileData.tags && profileData.tags.length > 0) {
            await db('profile_tag').insert(
                profileData.tags.map(tagId => ({
                    profile_id: profileId,
                    profile_tag: tagId,
                }))
            );
        }

        if (profileData.sexualPreferences && profileData.sexualPreferences.length > 0) {
            await db('profile_sexual_preferences').insert(
                profileData.sexualPreferences.map(genderId => ({
                    profile_id: profileId,
                    gender_id: genderId,
                }))
            );
        }

        return profileId;
    }

    async update(profileId: number, profileData: ProfileUpdateDto): Promise<void> {
        // Séparer les champs de 'profiles' et les autres champs
        const {biography, gender, age, main_photo_id, location, tags, sexualPreferences} = profileData;

        // Créer un objet avec seulement les champs de 'profiles'
        const profileFields: Partial<ProfileUpdateDto> = {};
        if (biography !== undefined) profileFields.biography = biography;
        if (gender !== undefined) profileFields.gender = gender;
        if (age !== undefined) profileFields.age = age;
        if (main_photo_id !== undefined) profileFields.main_photo_id = main_photo_id;
        if (location !== undefined) profileFields.location = location;

        // Mettre à jour la table 'profiles' uniquement avec les champs valides
        if (Object.keys(profileFields).length > 0) {
            await db('profiles')
                .where({profile_id: profileId})
                .update(profileFields);
        }

        // Gérer la mise à jour des tags
        if (tags !== undefined) {
            // Supprimer les anciens tags
            await db('profile_tag').where({profile_id: profileId}).del();

            // Insérer les nouveaux tags
            if (tags.length > 0) {
                await db('profile_tag').insert(
                    tags.map(tagId => ({
                        profile_id: profileId,
                        profile_tag: tagId,
                    }))
                );
            }
        }

        // Gérer la mise à jour des préférences sexuelles
        if (sexualPreferences !== undefined) {
            // Supprimer les anciennes préférences
            await db('profile_sexual_preferences').where({profile_id: profileId}).del();

            // Insérer les nouvelles préférences
            if (sexualPreferences.length > 0) {
                await db('profile_sexual_preferences').insert(
                    sexualPreferences.map(genderId => ({
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
