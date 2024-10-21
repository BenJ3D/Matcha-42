import db from "../config/knexConfig";
import {BlockedUserResponseDto} from "../DTOs/users/BlockedUserResponseDto";
import {UserLightResponseDto} from "../DTOs/users/UserLightResponseDto";
import {UserResponseDto} from "../DTOs/users/UserResponseDto";
import {UserCreateDto} from "../DTOs/users/UserCreateDto";
import {Tag} from "../models/Tags";
import {UserLoginPasswordCheckDto} from "../DTOs/users/UserLoginPasswordCheckDto";
import {UserUpdateDto} from "../DTOs/users/UserUpdateDto";
import {Gender} from "../models/Genders";
import {UserEmailPatchDto} from "../DTOs/users/UserEmailPatchDto";

class UserDAL {

    update = async (userId: number, userUpdate: UserUpdateDto): Promise<void> => {
        try {
            // Vérifie si l'utilisateur existe avant de tenter la mise à jour
            const user = await db('users').where('id', userId).first();
            if (!user) {
                throw {status: 404, message: "Utilisateur non trouvé."};
            }

            // Effectuer la mise à jour
            await db('users')
                .where('id', userId)
                .update(userUpdate);

            console.log(`Utilisateur avec id ${userId} mis à jour.`);

        } catch (e: any) {
            if (e.code === '23505') {  // Violation d'unicité (par ex. email déjà pris)
                console.error("Erreur: email déjà utilisé par un autre utilisateur.", e);
                throw {status: 409, message: "Cet email est déjà pris."};
            } else if (e.code === '23503') {  // Violation de contrainte de clé étrangère
                console.error("Erreur: contrainte de clé étrangère non respectée.", e);
                throw {status: 400, message: "La mise à jour viole une contrainte de clé étrangère."};
            } else if (e.status === 404) {  // Cas où l'utilisateur n'est pas trouvé
                console.error("Erreur: utilisateur non trouvé.", e);
                throw e;  // La relancer directement
            } else {
                console.error("Erreur lors de la mise à jour de l'utilisateur:", e);
                throw {status: 400, message: "Erreur"};
            }
        }
    };

    emailUpdate = async (userId: number, userEmailPatch: UserEmailPatchDto): Promise<void> => {
        try {
            // Vérifie si l'utilisateur existe avant de tenter la mise à jour
            const user = await db('users').where('id', userId).first();
            if (!user) {
                throw {status: 404, message: "Utilisateur non trouvé."};
            }

            // Effectuer la mise à jour
            await db('users')
                .where('id', userId)
                .update(userEmailPatch);

            console.log(`Utilisateur avec id ${userId} mis à jour.`);

        } catch (e: any) {
            if (e.code === '23505') {  // Violation d'unicité (par ex. email déjà pris)
                console.error("Erreur: email déjà utilisé par un autre utilisateur.", e);
                throw {status: 409, message: "Cet email est déjà pris."};
            } else if (e.code === '23503') {  // Violation de contrainte de clé étrangère
                console.error("Erreur: contrainte de clé étrangère non respectée.", e);
                throw {status: 400, message: "La mise à jour viole une contrainte de clé étrangère."};
            } else if (e.status === 404) {  // Cas où l'utilisateur n'est pas trouvé
                console.error("Erreur: utilisateur non trouvé.", e);
                throw e;  // La relancer directement
            } else {
                console.error("Erreur lors de la mise à jour de l'utilisateur:", e);
                throw {status: 400, message: "Erreur"};
            }
        }
    };

    save = async (newUser: UserCreateDto): Promise<number> => {
        try {
            const [userId] = await db('users')
                .insert(newUser)
                .returning('id')
                .then((rows) => rows.map(row => row.id));

            console.log(`Nouvel utilisateur sauvegardé avec id ${userId}`);
            return userId;
        } catch (e: any) {
            if (e.code === '23505') {  // Code PostgreSQL pour violation d'unicité
                console.error("Erreur: utilisateur déjà présent en base de données.", e);
                throw {status: 409, message: "L'email existe déjà."};
            } else {
                console.error("Erreur lors de l'insertion de l'utilisateur:", e);
                throw {status: 500, message: "Erreur interne du serveur."};
            }
        }
    }

    delete = async (userId: number): Promise<void> => {
        try {
            // Vérifie si l'utilisateur existe avant de tenter la suppression
            const user = await db('users').where('id', userId).first();
            if (!user) {
                throw {status: 404, message: "Utilisateur non trouvé."};
            }

            // Suppression de l'utilisateur
            await db('users').where('id', userId).del();
            console.log(`Utilisateur avec id ${userId} supprimé.`);
        } catch (e: any) {
            console.error(`Erreur lors de la suppression de l'utilisateur avec id ${userId}:`, e);
            throw {status: e.status || 500, message: e.message || "Erreur interne du serveur."};
        }
    }

    findAll = async (): Promise<UserLightResponseDto[]> => {
        try {
            const users = await db('users')
                .select(
                    'users.id',
                    'users.username',
                    'users.first_name',
                    'users.last_name',
                    'photos.url as main_photo_url',
                    'profiles.age',
                    'profiles.gender',
                    'locations.latitude',
                    'locations.longitude',
                    'locations.city_name',
                    'users.is_online',
                    'users.is_verified',
                    'users.last_activity',
                )
                .leftJoin('profiles', 'users.id', 'profiles.owner_user_id')
                .leftJoin('photos', 'profiles.main_photo_id', 'photos.photo_id')
                .leftJoin('locations', 'profiles.location', 'locations.location_id');

            return users.map(user => ({
                id: user.id,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                main_photo_url: user.main_photo_url || null,
                location: user.latitude && user.longitude ? {
                    latitude: parseFloat(user.latitude),
                    longitude: parseFloat(user.longitude),
                    city_name: user.city_name || undefined
                } : undefined,
                age: user.age,
                gender: user.gender,
                is_online: user.is_online,
                is_verified: user.is_verified,
                last_activity: user.last_activity,
            }));
        } catch (error) {
            console.error("Error fetching users:", error);
            throw new Error("Could not fetch users");
        }
    }


    findOne = async (id: number): Promise<UserResponseDto | null> => {
        try {
            const user = await db('users')
                .select(
                    'users.id',
                    'users.username',
                    'users.email',
                    'users.first_name',
                    'users.last_name',
                    'users.created_at',
                    'profiles.profile_id',
                    'profiles.biography',
                    'profiles.gender',
                    'profiles.age',
                    'users.is_online',
                    'users.is_verified',
                    'users.last_activity',
                    'profiles.fame_rating',
                    'profiles.main_photo_id',
                    'profiles.last_connection',
                    'photos.url as main_photo_url',
                    'locations.latitude',
                    'locations.longitude',
                    'locations.city_name'
                )
                .leftJoin('profiles', 'users.id', 'profiles.owner_user_id')
                .leftJoin('photos', 'profiles.main_photo_id', 'photos.photo_id')
                .leftJoin('locations', 'profiles.location', 'locations.location_id')
                .where('users.id', id)
                .first();

            if (!user) {
                return null;
            }

            const likers = await this.getUserLightResponseList(
                await db('likes').select('user as id').where('user_liked', id)
            );

            const visitors = await db('visited_profile_history')
                .select('visiter_id', 'viewed_at')
                .where('visited_id', id)
                .orderBy('viewed_at', 'desc');

            const visitorDetails = await this.getUserLightResponseList(
                visitors.map(visit => ({id: visit.visiter_id}))
            );

            const visitsWithDetails = visitorDetails.map(visitor => {
                const visit = visitors.find(v => v.visiter_id === visitor.id);
                return {
                    ...visitor,
                    viewed_at: visit?.viewed_at
                };
            });

            const matchers = await this.getUserLightResponseList(
                await db('matches').select('user_2 as id').where('user_1', id)
                    .union([
                        db('matches').select('user_1 as id').where('user_2', id)
                    ])
            );

            const photos = await db('photos')
                .select('photo_id', 'url', 'description', 'owner_user_id')
                .where('owner_user_id', id);

            const tags: Tag[] = await db('tags')
                .select('tags.tag_id', 'tags.tag_name')
                .join('profile_tag', 'tags.tag_id', 'profile_tag.profile_tag')
                .where('profile_tag.profile_id', user.profile_id);

            const sexualPreferences: Gender[] = await db('genders')
                .select('genders.gender_id', 'genders.name', 'genders.description')
                .join('profile_sexual_preferences', 'genders.gender_id', 'profile_sexual_preferences.gender_id')
                .where('profile_sexual_preferences.profile_id', user.profile_id);

            const blockedUsers = await db('blocked_users')
                .select('users.id', 'users.username', 'photos.url as main_photo_url', 'blocked_users.blocked_at')
                .join('users', 'blocked_users.blocked_id', 'users.id')
                .leftJoin('profiles', 'users.id', 'profiles.owner_user_id')
                .leftJoin('photos', 'profiles.main_photo_id', 'photos.photo_id')
                .where('blocked_users.blocker_id', id);

            const blocked: BlockedUserResponseDto[] = blockedUsers.map(blockedUser => ({
                id: blockedUser.id,
                username: blockedUser.username,
                main_photo_url: blockedUser.main_photo_url || null,
                blocked_at: blockedUser.blocked_at
            }));

            return {
                id: user.id,
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                created_at: user.created_at,
                profile_id: user.profile_id,
                owner_user_id: user.id,
                biography: user.biography,
                gender: user.gender,
                age: user.age,
                is_online: user.is_online,
                is_verified: user.is_verified,
                last_activity: user.last_activity,
                main_photo_id: user.main_photo_id,
                location: {
                    latitude: parseFloat(user.latitude),
                    longitude: parseFloat(user.longitude),
                    city_name: user.city_name
                },
                fame_rating: user.fame_rating,
                last_connection: user.last_connection,
                main_photo_url: user.main_photo_url,
                likers: likers,
                visitors: visitsWithDetails, // Include visits with details
                matchers: matchers,
                photos: photos,
                sexualPreferences: sexualPreferences,
                tags: tags,
                blocked: blocked
            } as UserResponseDto;

        } catch (error) {
            console.error("Error fetching user:", error);
            throw new Error(`Could not fetch user id ${id}`);
        }
    };

    async findOneByEmail(email: string): Promise<UserLoginPasswordCheckDto | null> {
        try {
            return await db('users').select('id', 'email', 'password').where('email', email).first();
        } catch (e) {
            console.error("Error fetching users:", e);
            throw new Error("Could not fetch users");
        }
    }

    async advancedSearch(
        filters: {
            ageMin?: number;
            ageMax?: number;
            fameMin?: number;
            fameMax?: number;
            location?: string;
            tags?: number[];
            preferredGenders?: number[];
            sortBy?: string;
            order?: string;
        },
        userId: number,
        userGender: number
    ): Promise<UserLightResponseDto[]> {
        const query = db('users')
            .select(
                'users.id',
                'users.username',
                'users.first_name',
                'users.last_name',
                'profiles.age',
                'profiles.fame_rating',
                'profiles.gender as gender',
                'photos.url as main_photo_url',
                'locations.latitude',
                'locations.longitude',
                'locations.city_name',
                'is_online',
                'is_verified',
                'last_activity'
            )
            .join('profiles', 'users.id', 'profiles.owner_user_id')
            .join('profile_sexual_preferences', 'profiles.profile_id', 'profile_sexual_preferences.profile_id')
            .leftJoin('photos', 'profiles.main_photo_id', 'photos.photo_id')
            .leftJoin('locations', 'profiles.location', 'locations.location_id')
            // Si vous souhaitez filtrer par tags, vous pouvez les gérer séparément
            .where('users.id', '!=', userId)
            // Filtrer les profils dont les préférences sexuelles incluent userGender
            .andWhere('profile_sexual_preferences.gender_id', userGender)
            .groupBy(
                'users.id',
                'profiles.age',
                'profiles.fame_rating',
                'profiles.gender',
                'photos.url',
                'locations.latitude',
                'locations.longitude',
                'locations.city_name'
            );

        // Appliquer les filtres supplémentaires
        if (filters.ageMin !== undefined) {
            query.where('profiles.age', '>=', filters.ageMin);
        }
        if (filters.ageMax !== undefined) {
            query.where('profiles.age', '<=', filters.ageMax);
        }
        if (filters.fameMin !== undefined) {
            query.where('profiles.fame_rating', '>=', filters.fameMin);
        }
        if (filters.fameMax !== undefined) {
            query.where('profiles.fame_rating', '<=', filters.fameMax);
        }
        if (filters.location) {
            query.where('locations.city_name', 'ILIKE', `%${filters.location}%`);
        }
        if (filters.tags && filters.tags.length > 0) {
            // Joindre les tags et filtrer
            query.join('profile_tag', 'profiles.profile_id', 'profile_tag.profile_id')
                .whereIn('profile_tag.profile_tag', filters.tags);
            // Mettre à jour le groupBy si nécessaire
            query.groupBy('profile_tag.profile_tag');
        }
        if (filters.preferredGenders && filters.preferredGenders.length > 0) {
            query.whereIn('profiles.gender', filters.preferredGenders);
        }
        if (filters.sortBy) {
            query.orderBy(filters.sortBy, filters.order || 'asc');
        }

        // Exécuter la requête
        const results = await query;

        // Structurer les données pour correspondre à l'interface UserLightResponseDto
        return results.map(user => ({
            id: user.id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            age: user.age,
            main_photo_url: user.main_photo_url,
            gender: user.gender,
            location: user.latitude && user.longitude ? {
                latitude: user.latitude,
                longitude: user.longitude,
                city_name: user.city_name
            } : undefined,
            is_online: user.is_online,
            is_verified: user.is_verified,
            last_activity: user.last_activity
        }));
    }

    async getUsersByIds(userIds: number[]): Promise<UserLightResponseDto[]> {
        try {
            const users = await db('users')
                .select(
                    'users.id',
                    'users.username',
                    'users.first_name',
                    'users.last_name',
                    'profiles.age',
                    'profiles.gender',
                    'photos.url as main_photo_url',
                    'users.is_online',
                    'users.is_verified',
                    'users.last_activity',
                    'locations.latitude',
                    'locations.longitude',
                    'locations.city_name'
                )
                .leftJoin('profiles', 'users.id', 'profiles.owner_user_id')
                .leftJoin('photos', 'profiles.main_photo_id', 'photos.photo_id')
                .leftJoin('locations', 'profiles.location', 'locations.location_id')
                .whereIn('users.id', userIds);

            return users.map(user => ({
                id: user.id,
                username: user.username,
                first_name: user.first_name,
                last_name: user.username,
                age: user.age || null,
                gender: user.gender || null,
                main_photo_url: user.main_photo_url || null,
                is_online: user.is_online,
                is_verified: user.is_verified,
                last_activity: user.last_activity,
                location: user.latitude && user.longitude ? {
                    latitude: parseFloat(user.latitude),
                    longitude: parseFloat(user.longitude),
                    city_name: user.city_name || undefined
                } : undefined
            }));
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            throw {status: 400, message: 'Impossible de récupérer les utilisateurs'};
        }
    }

    async updateOnlineStatus(userId: number, newStatus: boolean): Promise<void> {
        try {
            // Vérifie si l'utilisateur existe avant de tenter la mise à jour
            const user = await db('users').where('id', userId).first();
            if (!user) {
                throw {status: 404, message: "Utilisateur non trouvé."};
            }

            // Effectuer la mise à jour
            await db('users')
                .where('id', userId)
                .update('is_online', newStatus);

            await db('users')
                .where('id', userId)
                .update('last_activity', new Date().toISOString());

            console.log(`Utilisateur avec id ${userId} mis à jour.`);

        } catch (e: any) {
            if (e.code === '23505') {  // Violation d'unicité (par ex. email déjà pris)
                console.error("Erreur: email déjà utilisé par un autre utilisateur.", e);
                throw {status: 409, message: "Cet email est déjà pris."};
            } else if (e.code === '23503') {  // Violation de contrainte de clé étrangère
                console.error("Erreur: contrainte de clé étrangère non respectée.", e);
                throw {status: 400, message: "La mise à jour viole une contrainte de clé étrangère."};
            } else if (e.status === 404) {  // Cas où l'utilisateur n'est pas trouvé
                console.error("Erreur: utilisateur non trouvé.", e);
                throw e;  // La relancer directement
            } else {
                console.error("Erreur lors de la mise à jour de l'utilisateur:", e);
                throw {status: 400, message: "Erreur"};
            }
        }
    };

    async resetIsVerified(userId: number): Promise<void> {
        try {
            await db('users').where('id', userId).update('is_verified', false);
        } catch (e: any) {
            if (e.status === 404) {  // Cas où l'utilisateur n'est pas trouvé
                console.error("Erreur: utilisateur non trouvé.", e);
                throw e;  // La relancer directement
            }
        }
    }

    async validateUser(userId: number): Promise<void> {
        try {
            await db('users').where('id', userId).update('is_verified', true);
        } catch (e: any) {
            if (e.status === 404) {  // Cas où l'utilisateur n'est pas trouvé
                console.error("Erreur: utilisateur non trouvé.", e);
                throw e;  // La relancer directement
            }
        }
    }

    async updateFameRating(userId: number, newNote: number): Promise<void> {
        try {
            await db('profiles').where('owner_user_id', userId).update('fame_rating', newNote);
        } catch (e: any) {
            if (e.status === 404) {  // Cas où l'utilisateur n'est pas trouvé
                console.error("Erreur: utilisateur non trouvé.", e);
                throw e;  // La relancer directement
            }
        }
    }

    private getUserLightResponseList = async (userRows: { id: number }[]): Promise<UserLightResponseDto[]> => {
        if (userRows.length === 0) {
            return [];
        }

        const userIds = userRows.map(user => user.id);

        // Récupérer les informations de tous les utilisateurs en une seule requête
        const users = await db('users')
            .select(
                'users.id',
                'users.username',
                'users.first_name',
                'users.last_name',
                'profiles.age',
                'profiles.gender',
                'photos.url as main_photo_url',
                'locations.latitude',
                'locations.longitude',
                'locations.city_name',
                'users.is_online',
                'users.is_verified',
                'users.last_activity'
            )

            .leftJoin('profiles', 'users.id', 'profiles.owner_user_id')
            .leftJoin('photos', 'profiles.main_photo_id', 'photos.photo_id')
            .leftJoin('locations', 'profiles.location', 'locations.location_id')
            .whereIn('users.id', userIds);

        // Mapper les utilisateurs pour correspondre à l'interface UserLightResponseDto
        return users.map(user => ({
            id: user.id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            age: user.age || null,
            main_photo_url: user.main_photo_url || null,
            gender: user.gender || null,
            location: user.latitude && user.longitude ? {
                latitude: parseFloat(user.latitude),
                longitude: parseFloat(user.longitude),
                city_name: user.city_name || undefined
            } : undefined,
            is_online: user.is_online,
            is_verified: user.is_verified,
            last_activity: user.last_activity,
        }));
    }

    private getMainPhotoUrl = async (userId: number): Promise<string | null> => {
        const photo = await db('photos')
            .join('profiles', 'photos.photo_id', 'profiles.main_photo_id')
            .select('photos.url')
            .where('profiles.owner_user_id', userId)
            .first();
        return photo ? photo.url : null;
    }

}

export default new UserDAL();
