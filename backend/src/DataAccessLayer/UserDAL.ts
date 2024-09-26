import db from "../config/knexConfig";
import {BlockedUserResponseDto} from "../DTOs/users/BlockedUserResponseDto";
import {UserLightResponseDto} from "../DTOs/users/UserLightResponseDto";
import {UserResponseDto} from "../DTOs/users/UserResponseDto";
import {UserCreateDto} from "../DTOs/users/UserCreateDto";
import {Tag} from "../models/Tags";
import {UserLoginPasswordCheckDto} from "../DTOs/users/UserLoginPasswordCheckDto";
import {UserUpdateDto} from "../DTOs/users/UserUpdateDto";
import {Gender} from "../models/Genders";

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
                throw {status: 500, message: "Erreur interne du serveur."};
            }
        }
    };

    save = async (newUser: UserCreateDto): Promise<number> => {
        try {

            const [userId] = await db('users').insert(newUser).returning('id');
            console.log(`Nouvel utilisateur save avec id ${userId}`);
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
                    'photos.url as main_photo_url',
                    'profiles.age',
                    'profiles.gender',
                    'locations.latitude',
                    'locations.longitude',
                    'locations.city_name'
                )
                .leftJoin('profiles', 'users.id', 'profiles.owner_user_id')
                .leftJoin('photos', 'profiles.main_photo_id', 'photos.photo_id')
                .leftJoin('locations', 'profiles.location', 'locations.location_id');

            return users.map(user => ({
                id: user.id,
                username: user.username,
                main_photo_url: user.main_photo_url || null,
                location: user.latitude && user.longitude ? {
                    latitude: parseFloat(user.latitude),
                    longitude: parseFloat(user.longitude),
                    city_name: user.city_name || undefined
                } : undefined,
                age: user.age,
                gender: user.gender
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
                    'profiles.fame_rating',  // Assurez-vous de récupérer correctement fame_rating
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

            const visitors = await this.getUserLightResponseList(
                await db('visited_profile_history').select('visiter as id').where('visited', id)
            );

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

            // Récupérer les utilisateurs bloqués par cet utilisateur
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
                main_photo_id: user.main_photo_id,
                location: {
                    latitude: parseFloat(user.latitude),
                    longitude: parseFloat(user.longitude),
                    city_name: user.city_name
                },
                fame_rating: user.fame_rating,  // Correction pour s'assurer que fame_rating est bien pris en compte
                last_connection: user.last_connection,
                main_photo_url: user.main_photo_url,
                likers: likers,
                visitors: visitors,
                matchers: matchers,
                photos: photos,
                sexualPreferences: sexualPreferences,
                tags: tags,
                blocked: blocked  // Ajout des utilisateurs bloqués avec la date de blocage
            } as UserResponseDto;

        } catch (error) {
            console.error("Error fetching user:", error);  // Correction du message d'erreur
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

    async advancedSearch(filters: {
        ageMin?: number;
        ageMax?: number;
        fameMin?: number;
        fameMax?: number;
        location?: string;
        tags?: number[];
        preferredGenders?: number[];
        sortBy?: string;
        order?: string;
    }, userId: number, userGender: number): Promise<any[]> {
        console.log('user gender : ' + userGender);

        const query = db('users')
            .select(
                'users.id',
                'users.username',
                'profiles.age',
                'profiles.fame_rating',
                'profiles.gender as gender_id',
                'locations.city_name',
                db.raw('ARRAY_AGG(DISTINCT tags.tag_name) AS interests')
            )
            .join('profiles', 'users.id', 'profiles.owner_user_id')
            .join('profile_sexual_preferences', 'profiles.profile_id', 'profile_sexual_preferences.profile_id')
            .leftJoin('locations', 'profiles.location', 'locations.location_id')
            .leftJoin('profile_tag', 'profiles.profile_id', 'profile_tag.profile_id')
            .leftJoin('tags', 'profile_tag.profile_tag', 'tags.tag_id')
            .where('users.id', '!=', userId)
            // Filtrer les profils dont les préférences sexuelles incluent userGender
            .andWhere('profile_sexual_preferences.gender_id', userGender)
            .groupBy(
                'users.id',
                'profiles.age',
                'profiles.fame_rating',
                'profiles.gender',
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
            query.whereIn('tags.tag_id', filters.tags);
        }
        if (filters.preferredGenders && filters.preferredGenders.length > 0) {
            query.whereIn('profiles.gender', filters.preferredGenders);
        }
        if (filters.sortBy) {
            query.orderBy(filters.sortBy, filters.order || 'asc');
        }

        return await query;
    }


    private getUserLightResponseList = async (userRows: { id: number }[]): Promise<UserLightResponseDto[]> => {
        return Promise.all(userRows.map(async ({id}) => {
            const user = await db('users')
                .select('id', 'username', 'last_name', 'first_name')
                .where('id', id)
                .first();

            const mainPhotoUrl = await this.getMainPhotoUrl(id);

            return {
                id: user.id,
                username: user.username,
                main_photo_url: mainPhotoUrl || null,
                age: user.age,
                gender: user.gender
            } as UserLightResponseDto;
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
