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
import {User} from "../models/User";
import {UserOtherResponseDto} from "../DTOs/users/UserOtherResponseDto";
import {TagInCommonDto} from "../DTOs/users/TagInCommonDto";
import {UserLightWithRelationsResponseDto} from "../DTOs/users/UserLightWithRelationsResponseDto";

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
                throw {status: 400, message: "Erreur."};
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
            throw {status: e.status || 500, message: e.message || "Erreur."};
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
    ): Promise<UserLightWithRelationsResponseDto[]> {
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
                'users.is_online',
                'users.is_verified',
                'users.last_activity'
            )
            .join('profiles', 'users.id', 'profiles.owner_user_id')
            .join('profile_sexual_preferences', 'profiles.profile_id', 'profile_sexual_preferences.profile_id')
            .leftJoin('photos', 'profiles.main_photo_id', 'photos.photo_id')
            .leftJoin('locations', 'profiles.location', 'locations.location_id')
            .where('users.id', '!=', userId)
            .andWhere('profile_sexual_preferences.gender_id', userGender)
            .groupBy(
                'users.id',
                'profiles.age',
                'profiles.fame_rating',
                'profiles.gender',
                'photos.url',
                'locations.latitude',
                'locations.longitude',
                'locations.city_name',
                'users.is_online',
                'users.is_verified',
                'users.last_activity'
            );

        // Apply additional filters...
        if (filters.ageMin !== undefined) {
            query.andWhere('profiles.age', '>=', filters.ageMin);
        }
        if (filters.ageMax !== undefined) {
            query.andWhere('profiles.age', '<=', filters.ageMax);
        }
        if (filters.fameMin !== undefined) {
            query.andWhere('profiles.fame_rating', '>=', filters.fameMin);
        }
        if (filters.fameMax !== undefined) {
            query.andWhere('profiles.fame_rating', '<=', filters.fameMax);
        }
        if (filters.location) {
            // Add location filtering logic here
        }
        if (filters.tags && filters.tags.length > 0) {
            query.join('profile_tag', 'profiles.profile_id', 'profile_tag.profile_id')
                .whereIn('profile_tag.profile_tag', filters.tags);
        }
        if (filters.preferredGenders && filters.preferredGenders.length > 0) {
            query.whereIn('profiles.gender', filters.preferredGenders);
        }
        if (filters.sortBy) {
            const order = filters.order || 'asc';
            query.orderBy(filters.sortBy, order);
        }

        // Execute the query
        const results = await query;

        if (results.length === 0) {
            return [];
        }

        const userIds = results.map(user => user.id);

        // Fetch relationship statuses
        const [likes, unlikes, blocks, matches, fakeReports, likedMe, unlikedMe, blockedMe, fakeReportedMe] = await Promise.all([
            db('likes').select('user_liked').where('user', userId).whereIn('user_liked', userIds),
            db('unlikes').select('user_unliked').where('user', userId).whereIn('user_unliked', userIds),
            db('blocked_users').select('blocked_id').where('blocker_id', userId).whereIn('blocked_id', userIds),
            db('matches').select('user_1', 'user_2').where(function () {
                this.whereIn('user_1', [userId]).whereIn('user_2', userIds)
                    .orWhereIn('user_1', userIds).where('user_2', userId);
            }),
            db('fake_user_reporting').select('reported_user').where('user_who_reported', userId).whereIn('reported_user', userIds),
            db('likes').select('user').where('user_liked', userId).whereIn('user', userIds),
            db('unlikes').select('user').where('user_unliked', userId).whereIn('user', userIds),
            db('blocked_users').select('blocker_id').where('blocked_id', userId).whereIn('blocker_id', userIds),
            db('fake_user_reporting').select('user_who_reported').where('reported_user', userId).whereIn('user_who_reported', userIds)
        ]);

        // Map the users to UserLightWithRelationsResponseDto
        return results.map(user => {
            const isLiked = likes.some(like => like.user_liked === user.id);
            const isUnliked = unlikes.some(unlike => unlike.user_unliked === user.id);
            const isBlocked = blocks.some(block => block.blocked_id === user.id);
            const isMatched = matches.some(match => (match.user_1 === user.id && match.user_2 === userId) || (match.user_1 === userId && match.user_2 === user.id));
            const isFakeReported = fakeReports.some(report => report.reported_user === user.id);

            const LikedMe = likedMe.some(like => like.user === user.id);
            const UnlikedMe = unlikedMe.some(unlike => unlike.user === user.id);
            const BlockedMe = blockedMe.some(block => block.blocker_id === user.id);
            const FakeReportedMe = fakeReportedMe.some(report => report.user_who_reported === user.id);

            return {
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
                fame_rating: user.fame_rating,
                is_online: user.is_online,
                is_verified: user.is_verified,
                last_activity: user.last_activity,
                isLiked,
                isUnliked,
                isMatched,
                isBlocked,
                isFakeReported,
                LikedMe,
                UnlikedMe,
                BlockedMe,
                FakeReportedMe
            } as UserLightWithRelationsResponseDto;
        });
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

    async getUsernameByUserId(userId: number): Promise<string | undefined> {
        try {
            const user = await db('users')
                .select('username')
                .where('id', userId)
                .first();

            return user?.username;
        } catch (error: any) {
            console.error("Erreur lors de la récupération de l'utilisateur :", error);
            throw error; // Relance l'erreur pour qu'elle puisse être gérée par l'appelant
        }
    }

    async getFirstnameByUserId(userId: number): Promise<string | undefined> {
        try {
            return db('users').where('id', userId).select('first_name').first();
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

    async userExists(userId: number): Promise<boolean> {
        try {
            const user: User | undefined = await db('users').select('id').where('id', userId).first();
            return !!user;
        } catch (error) {
            console.error(`Erreur lors de la vérification de l'existence de l'utilisateur ${userId}:`, error);
            throw {status: 400, message: 'Impossible de vérifier l\'existence de l\'utilisateur'};
        }
    }

    /**
     * Récupère les détails d'un utilisateur avec les statuts de relation par rapport à l'utilisateur actuel.
     * @param currentUserId ID de l'utilisateur authentifié.
     * @param userId ID de l'utilisateur ciblé.
     * @returns UserOtherResponseDto ou null si l'utilisateur n'est pas trouvé.
     */
    async getUserOtherById(currentUserId: number, userId: number): Promise<UserOtherResponseDto | null> {
        try {
            // Fetch the target user's data
            const user = await db('users')
                .select(
                    'users.id',
                    'users.username',
                    'users.email',
                    'users.created_at',
                    'users.profile_id',
                    'profiles.biography',
                    'profiles.gender',
                    'profiles.fame_rating',
                    'profiles.age',
                    'profiles.main_photo_id',
                    'photos.url as main_photo_url',
                    'users.is_online',
                    'users.is_verified',
                    'users.last_activity',
                    'locations.latitude',
                    'locations.longitude',
                    'locations.city_name'
                )
                .leftJoin('profiles', 'users.profile_id', 'profiles.profile_id')
                .leftJoin('photos', 'profiles.main_photo_id', 'photos.photo_id')
                .leftJoin('locations', 'profiles.location', 'locations.location_id') // Updated join
                .where('users.id', userId)
                .first();

            if (!user) return null;

            // Fetch the target user's tags
            const targetUserTags: Tag[] = await db('tags')
                .select('tags.tag_id', 'tags.tag_name')
                .join('profile_tag', 'tags.tag_id', 'profile_tag.profile_tag')
                .where('profile_tag.profile_id', user.profile_id);

            // Fetch the current user's profile ID
            const currentUser = await db('users')
                .select('profile_id')
                .where('id', currentUserId)
                .first();

            let currentUserTags: Tag[] = [];
            if (currentUser) {
                // Fetch the current user's tags
                currentUserTags = await db('tags')
                    .select('tags.tag_id', 'tags.tag_name')
                    .join('profile_tag', 'tags.tag_id', 'profile_tag.profile_tag')
                    .where('profile_tag.profile_id', currentUser.profile_id);
            }

            // Map target user's tags to include inCommon flag
            const tags: TagInCommonDto[] = targetUserTags.map(tag => ({
                ...tag,
                inCommon: currentUserTags.some(currentTag => currentTag.tag_id === tag.tag_id)
            }));

            // Fetch other necessary data (photos, sexualPreferences, etc.)
            const photos = await db('photos')
                .select('photo_id', 'url', 'description', 'owner_user_id')
                .where('owner_user_id', userId);

            const sexualPreferences: Gender[] = await db('genders')
                .select('genders.gender_id', 'genders.name', 'genders.description')
                .join('profile_sexual_preferences', 'genders.gender_id', 'profile_sexual_preferences.gender_id')
                .where('profile_sexual_preferences.profile_id', user.profile_id);

            // Fetch relationship statuses
            const [
                isLikedRow,
                isUnlikedRow,
                isMatchedRow,
                isBlockedRow,
                isFakeReportedRow
            ] = await Promise.all([
                db('likes').where({user: currentUserId, user_liked: userId}).first(),
                db('unlikes').where({user: currentUserId, user_unliked: userId}).first(),
                db('matches').where(function () {
                    this.where({user_1: currentUserId, user_2: userId})
                        .orWhere({user_1: userId, user_2: currentUserId});
                }).first(),
                db('blocked_users').where({blocker_id: currentUserId, blocked_id: userId}).first(),
                db('fake_user_reporting').where({user_who_reported: currentUserId, reported_user: userId}).first(),
            ]);

            const [
                likedMeRow,
                unlikedMeRow,
                blockedMeRow,
                fakeReportedMeRow
            ] = await Promise.all([
                db('likes').where({user: userId, user_liked: currentUserId}).first(),
                db('unlikes').where({user: userId, user_unliked: currentUserId}).first(),
                db('blocked_users').where({blocker_id: userId, blocked_id: currentUserId}).first(),
                db('fake_user_reporting').where({user_who_reported: userId, reported_user: currentUserId}).first(),
            ]);

            return {
                ...user,
                photos,
                sexualPreferences,
                tags,
                main_photo_url: user.main_photo_url || null,
                location: user.latitude && user.longitude ? {
                    latitude: user.latitude,
                    longitude: user.longitude,
                    city_name: user.city_name || undefined
                } : undefined,
                isLiked: !!isLikedRow,
                isUnliked: !!isUnlikedRow,
                isMatched: !!isMatchedRow,
                isBlocked: !!isBlockedRow,
                isFakeReported: !!isFakeReportedRow,
                LikedMe: !!likedMeRow,
                UnlikedMe: !!unlikedMeRow,
                BlockedMe: !!blockedMeRow,
                FakeReportedMe: !!fakeReportedMeRow,
            };
        } catch (error) {
            console.error("Error fetching user:", error);
            throw new Error(`Could not fetch user id ${userId}`);
        }
    }

    public updateLastActivity = async (userId: number): Promise<void> => {
        try {
            const result = await db('users')
                .where('id', userId)
                .update({
                    last_activity: db.fn.now()
                });

            if (result) {
                return;
            } else {
                throw {status: 400, message: 'Impossible de vérifier l\'existence de l\'utilisateur'};
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour :', error);
            throw {status: 400, message: 'Erreur'};
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
