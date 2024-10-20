import zxcvbn from 'zxcvbn';
import userDAL from "../DataAccessLayer/UserDAL";
import {UserLightResponseDto} from "../DTOs/users/UserLightResponseDto";
import {UserResponseDto} from "../DTOs/users/UserResponseDto";
import {UserCreateDto} from "../DTOs/users/UserCreateDto";
import {PasswordService} from "./PasswordService";
import {UserUpdateDto} from "../DTOs/users/UserUpdateDto";
import profileDAL from "../DataAccessLayer/ProfileDAL";
import config from "../config/config";
import transporter from "../config/mailer";
import jwt from "jsonwebtoken";
import EmailVerificationService from "./EmailVerificationService";
import {UserEmailPatchDto} from "../DTOs/users/UserEmailPatchDto";
import {User} from "../models/User";
import UserDAL from "../DataAccessLayer/UserDAL";

class UserServices {
    async getAllUsers(): Promise<UserLightResponseDto[]> {
        return await userDAL.findAll();
    }

    async getUserById(id: number): Promise<UserResponseDto | null> {
        return await userDAL.findOne(id);
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
        const userId = await userDAL.save(newUser);
        console.log(`DBG userID = ${JSON.stringify(userId)}`);
        EmailVerificationService.sendVerificationEmail(userId, newUser.email, newUser.first_name);
        return userId;
    }

    async updateUser(userId: number, userUpdate: UserUpdateDto): Promise<void> {
        return await userDAL.update(userId, userUpdate);
    }

    async patchEmailUser(existingUser: UserResponseDto, userEmailPatchDto: UserEmailPatchDto): Promise<void> {
        const userId = existingUser.id;
        const username = existingUser.username;
        if (existingUser.email == userEmailPatchDto.email) {
            throw {status: 409, message: 'Email identique à l\'actuel'};
        }
        await userDAL.emailUpdate(userId, userEmailPatchDto);
        await userDAL.resetIsVerified(userId);
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
        return await userDAL.delete(userId);
    }

    async setOnlineUser(userId: number): Promise<void> {
        return await userDAL.updateOnlineStatus(userId, true);
    }

    async setOfflineUser(userId: number): Promise<void> {
        return await userDAL.updateOnlineStatus(userId, false);
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
        // Récupérer le profil de l'utilisateur
        const userProfile = await profileDAL.findByUserId(userId);
        if (!userProfile) {
            throw {status: 404, message: 'Profil non trouvé'};
        }

        // Récupérer les préférences sexuelles de l'utilisateur
        const sexualPreferences = await profileDAL.getSexualPreferences(userProfile.profile_id);

        //Recup genre de l'utilisateur
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
        return await userDAL.advancedSearch(filters, userId, userGender);
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
        console.log(`NEW NOOOOOTE = ${newNote}`);
        if (newNote < 0) {
            newNote = 0;
        } else if (newNote > 10) {
            newNote = 10;
        }
        return await UserDAL.updateFameRating(userId, newNote);
    }

}

export default new UserServices();