import zxcvbn from 'zxcvbn';
import config from "../config/config";
import UserDAL from "../DataAccessLayer/UserDAL";
import { PasswordService } from "./PasswordService";
import profileDAL from "../DataAccessLayer/ProfileDAL";
import { UserCreateDto } from "../DTOs/users/UserCreateDto";
import { UserUpdateDto } from "../DTOs/users/UserUpdateDto";
import { UserResponseDto } from "../DTOs/users/UserResponseDto";
import EmailVerificationService from "./EmailVerificationService";
import { UserEmailPatchDto } from "../DTOs/users/UserEmailPatchDto";
import { UserLightResponseDto } from "../DTOs/users/UserLightResponseDto";
import { UserOtherResponseDto } from '../DTOs/users/UserOtherResponseDto';
import { UserLightWithRelationsResponseDto } from "../DTOs/users/UserLightWithRelationsResponseDto";
import { haversineDistance } from "../utils/haversineDistance";

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
        await EmailVerificationService.sendVerificationEmail(userId, newUser.email, newUser.first_name);
        return userId;
    }

    async updateUser(userId: number, userUpdate: UserUpdateDto): Promise<void> {
        return await UserDAL.update(userId, userUpdate);
    }

    async patchEmailUser(existingUser: UserResponseDto, userEmailPatchDto: UserEmailPatchDto): Promise<void> {
        const userId = existingUser.id;
        const username = existingUser.username;
        if (existingUser.email == userEmailPatchDto.email) {
            throw { status: 409, message: 'Email identique à l\'actuel' };
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
            throw { status: 409, message: 'Votre email est déjà vérifié' };
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
        const sortOrder: 'asc' | 'desc' = (order?.toLowerCase() === 'desc') ? 'desc' : 'asc';

        const userProfile = await profileDAL.findByUserId(userId);
        if (!userProfile) {
            throw { status: 404, message: 'Profil non trouvé' };
        }

        const sexualPreferences = await profileDAL.getSexualPreferences(userProfile.profile_id);

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
            order: sortOrder,
        };

        const usersSearch: UserLightWithRelationsResponseDto[] = await UserDAL.advancedSearch(filters, userId, userGender);

        const currentUser: UserResponseDto | null = await this.getUserById(userId);

        if (currentUser && currentUser.tags && currentUser.tags.length > 0) {
            const currentUserTagIds = currentUser.tags.map(tag => tag.tag_id);
            const currentUserLatitude = currentUser.location?.latitude;
            const currentUserLongitude = currentUser.location?.longitude;

            if (currentUserLatitude != null && currentUserLongitude != null) {
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
                        user.distance = Number.MAX_SAFE_INTEGER;
                    }
                });
            } else {
                usersSearch.forEach(user => {
                    user.distance = Number.MAX_SAFE_INTEGER;
                });
            }

            const weightDistance = 0.5;
            const weightCommonTags = 0.3;
            const weightFameRating = 0.2;

            const maxDistance = Math.max(...usersSearch.map(u => u.distance || 0));
            const maxCommonTags = Math.max(...usersSearch.map(u => u.tags ? u.tags.filter(tag => currentUserTagIds.includes(tag.tag_id)).length : 0));
            const maxFameRating = Math.max(...usersSearch.map(u => u.fame_rating || 0));

            usersSearch.forEach(user => {
                const distanceScore = user.distance != null && maxDistance > 0
                    ? (maxDistance - user.distance) / maxDistance
                    : 0;

                const commonTags = user.tags ? user.tags.filter(tag => currentUserTagIds.includes(tag.tag_id)).length : 0;
                const commonTagsScore = maxCommonTags > 0 ? commonTags / maxCommonTags : 0;
                const fameRatingScore = maxFameRating > 0 ? user.fame_rating / maxFameRating : 0;

                user.totalScore =
                    weightDistance * distanceScore +
                    weightCommonTags * commonTagsScore +
                    weightFameRating * fameRatingScore;
            });
        }

        if (sortBy) {
            usersSearch.sort((a, b) => {
                let comparison = 0;

                if (sortBy === 'distance') {
                    const aDistance = Number(a.distance) || Number.MAX_SAFE_INTEGER;
                    const bDistance = Number(b.distance) || Number.MAX_SAFE_INTEGER;
                    comparison = aDistance - bDistance;
                } else if (sortBy === 'fame_rating') {
                    const aFameRating = Number(a.fame_rating) || 0;
                    const bFameRating = Number(b.fame_rating) || 0;
                    comparison = aFameRating - bFameRating;
                } else if (sortBy === 'age') {
                    const aAge = Number(a.age) || 0;
                    const bAge = Number(b.age) || 0;
                    comparison = aAge - bAge;
                } else if (sortBy === 'totalScore') {
                    const aTotalScore = Number(a.totalScore) || 0;
                    const bTotalScore = Number(b.totalScore) || 0;
                    comparison = aTotalScore - bTotalScore;
                } else {
                    comparison = 0;
                }

                return sortOrder === 'desc' ? -comparison : comparison;
            });
        } else {
            usersSearch.sort((a, b) => {
                const aTotalScore = Number(a.totalScore) || 0;
                const bTotalScore = Number(b.totalScore) || 0;
                return bTotalScore - aTotalScore;
            });
        }

        return usersSearch;
    }


    async updateFameRating(userId: number, addNote: number): Promise<void> {
        const userProfile = await profileDAL.findByUserId(userId);
        if (!userProfile) {
            throw { status: 404, message: 'Profil non trouvé' };
        }

        const currentRating = Number(userProfile.fame_rating);
        if (isNaN(currentRating)) {
            throw { status: 400, message: 'fame_rating invalide' };
        }

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