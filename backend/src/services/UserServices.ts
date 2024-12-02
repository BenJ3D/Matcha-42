import zxcvbn from 'zxcvbn';
import config from "../config/config";
import UserDAL from "../DataAccessLayer/UserDAL";
import {PasswordService} from "./PasswordService";
import profileDAL from "../DataAccessLayer/ProfileDAL";
import {UserCreateDto} from "../DTOs/users/UserCreateDto";
import {UserUpdateDto} from "../DTOs/users/UserUpdateDto";
import {UserResponseDto} from "../DTOs/users/UserResponseDto";
import EmailVerificationService from "./EmailVerificationService";
import {UserEmailPatchDto} from "../DTOs/users/UserEmailPatchDto";
import {UserLightResponseDto} from "../DTOs/users/UserLightResponseDto";
import {UserOtherResponseDto} from '../DTOs/users/UserOtherResponseDto';
import {UserLightWithRelationsResponseDto} from "../DTOs/users/UserLightWithRelationsResponseDto";
import TagsService from "./TagsService";
import {haversineDistance} from "../utils/haversineDistance";

class UserServices {
    async getAllUsers(): Promise<UserLightResponseDto[]> {
        return await UserDAL.findAll();
    }

    async getUserById(id: number): Promise<UserResponseDto | null> {
        return await UserDAL.findOne(id);
    }

    async getUserOtherById(currentUserId: number, targetId: number): Promise<UserOtherResponseDto | null> {
        return await UserDAL.getUserOtherById(currentUserId, targetId);
    }

    async createUser(newUser: UserCreateDto): Promise<number> {
        const requiredScore = config.userPasswordStrengthForce;

        const passwordEvaluation = zxcvbn(newUser.password);
        if (passwordEvaluation.score < requiredScore) {
            throw {
                status: 400,
                message: 'Le mot de passe est trop faible. Veuillez en choisir un plus robuste.'
            };
        }

        newUser.email = newUser.email.toLowerCase();
        newUser.password = await PasswordService.hashPassword(newUser.password);
        const userId = await UserDAL.save(newUser);
        console.log(`DBG userID = ${JSON.stringify(userId)}`);
        EmailVerificationService.sendVerificationEmail(userId, newUser.email, newUser.first_name);
        return userId;
    }

    async updateUser(userId: number, userUpdate: UserUpdateDto): Promise<void> {
        return await UserDAL.update(userId, userUpdate);
    }

    async patchEmailUser(existingUser: UserResponseDto, userEmailPatchDto: UserEmailPatchDto): Promise<void> {
        const userId = existingUser.id;
        const username = existingUser.username;
        if (existingUser.email == userEmailPatchDto.email) {
            throw {status: 409, message: 'Email identique à l\'actuel'};
        }
        await UserDAL.emailUpdate(userId, userEmailPatchDto);
        await UserDAL.resetIsVerified(userId);
        await EmailVerificationService.sendVerificationEmail(userId, userEmailPatchDto.email, username);
    }

    async sendEmailWithTokenEmailValidation(user: UserResponseDto): Promise<void> {
        const userId = user.id;
        const userEmail = user.email;
        const username = user.username;
        if (user.is_verified) {
            throw {status: 409, message: 'Votre email est déjà vérifié'};
        }
        await EmailVerificationService.sendVerificationEmail(userId, userEmail, username);
    }

    async deleteUser(userId: number): Promise<void> {
        return await UserDAL.delete(userId);
    }

    async setOnlineUser(userId: number): Promise<void> {
        return await UserDAL.updateOnlineStatus(userId, true);
    }

    async setOfflineUser(userId: number): Promise<void> {
        return await UserDAL.updateOnlineStatus(userId, false);
    }

    async advancedSearch(
        userId: number,
        ageMin?: number,
        ageMax?: number,
        fameMin?: number,
        fameMax?: number,
        location?: string,
        tags?: number[],
        sortBy?: string,
        order?: string
    ): Promise<any[]> {
        // 1. Récupérer le profil de l'utilisateur
        const userProfile = await profileDAL.findByUserId(userId);
        if (!userProfile) {
            throw {status: 404, message: 'Profil non trouvé'};
        }

        // 2. Récupérer les préférences sexuelles de l'utilisateur
        const sexualPreferences = await profileDAL.getSexualPreferences(userProfile.profile_id);

        // 3. Récupérer le genre de l'utilisateur
        const userGender = userProfile.gender;

        const filters = {
            ageMin,
            ageMax,
            fameMin,
            fameMax,
            location,
            tags,
            preferredGenders: sexualPreferences.map((gender) => gender.gender_id),
            sortBy,
            order,
        };

        // 4. Effectuer la recherche avancée
        const usersSearch: UserLightWithRelationsResponseDto[] = await UserDAL.advancedSearch(filters, userId, userGender);

        // 5. Récupérer les détails de l'utilisateur courant
        const currentUser: UserResponseDto | null = await this.getUserById(userId);

        if (currentUser && currentUser.tags && currentUser.tags.length > 0) {
            const currentUserTagIds = currentUser.tags.map(tag => tag.tag_id);
            const currentUserLatitude = currentUser.location?.latitude;
            const currentUserLongitude = currentUser.location?.longitude;

            // Vérifier que les coordonnées GPS de l'utilisateur courant sont disponibles
            if (currentUserLatitude != null && currentUserLongitude != null) {
                // 6. Calculer la distance pour chaque utilisateur
                usersSearch.forEach(user => {
                    const userLatitude = user.location?.latitude;
                    const userLongitude = user.location?.longitude;

                    if (userLatitude != null && userLongitude != null) {
                        user.distance = haversineDistance(
                            currentUserLatitude,
                            currentUserLongitude,
                            userLatitude,
                            userLongitude
                        );
                    } else {
                        // Si les coordonnées de l'utilisateur ne sont pas disponibles, définir une grande distance
                        user.distance = Number.MAX_SAFE_INTEGER;
                    }
                });
            } else {
                // Si les coordonnées de l'utilisateur courant ne sont pas disponibles, définir les distances à zéro
                usersSearch.forEach(user => {
                    user.distance = Number.MAX_SAFE_INTEGER;
                });
            }

            // 7. Calculer le score total pour chaque utilisateur (optionnel)
            // Définir les poids pour chaque critère
            const weightDistance = 0.5;
            const weightCommonTags = 0.3;
            const weightFameRating = 0.2;

            // Trouver les valeurs maximales pour la normalisation
            const maxDistance = Math.max(...usersSearch.map(u => u.distance || 0));
            const maxCommonTags = Math.max(...usersSearch.map(u => u.tags ? u.tags.filter(tag => currentUserTagIds.includes(tag.tag_id)).length : 0));
            const maxFameRating = Math.max(...usersSearch.map(u => u.fame_rating || 0));

            usersSearch.forEach(user => {
                // a. Calculer le score de distance (plus proche = score plus élevé)
                const distanceScore = user.distance != null && maxDistance > 0
                    ? (maxDistance - user.distance) / maxDistance
                    : 0;

                // b. Calculer le score de tags en commun
                const commonTags = user.tags ? user.tags.filter(tag => currentUserTagIds.includes(tag.tag_id)).length : 0;
                const commonTagsScore = maxCommonTags > 0 ? commonTags / maxCommonTags : 0;

                // c. Calculer le score de fame_rating
                const fameRatingScore = maxFameRating > 0 ? user.fame_rating / maxFameRating : 0;

                // d. Calculer le score total
                user.totalScore =
                    weightDistance * distanceScore +
                    weightCommonTags * commonTagsScore +
                    weightFameRating * fameRatingScore;
            });

            // 8. Trier usersSearch en fonction du score total
            usersSearch.sort((a, b) => {
                if (a.totalScore != null && b.totalScore != null) {
                    return b.totalScore - a.totalScore; // Score plus élevé en premier
                } else {
                    return 0;
                }
            });
        }

        return usersSearch;
    }

    async updateFameRating(userId: number, addNote: number): Promise<void> {
        // Récupérer le profil de l'utilisateur
        const userProfile = await profileDAL.findByUserId(userId);
        if (!userProfile) {
            throw {status: 404, message: 'Profil non trouvé'};
        }

        // S'assurer que fame_rating est un nombre
        const currentRating = Number(userProfile.fame_rating);
        if (isNaN(currentRating)) {
            throw {status: 400, message: 'fame_rating invalide'};
        }

        // Ajouter la note
        let newNote = currentRating + addNote;
        if (newNote < 0) {
            newNote = 0;
        } else if (newNote > 10) {
            newNote = 10;
        }
        return await UserDAL.updateFameRating(userId, newNote);
    }

    async getUsernameByUserId(userId: number): Promise<string | undefined> {
        return await UserDAL.getUsernameByUserId(userId);
    }

}

export default new UserServices();