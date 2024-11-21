// services/BlockedUsersService.ts

import BlockedUsersDAL from '../DataAccessLayer/BlockedUsersDAL';
import userDAL from '../DataAccessLayer/UserDAL';
import {BlockedUserResponseDto} from '../DTOs/users/BlockedUserResponseDto';
import {UserBlockedResponseDto} from "../DTOs/blocked/UserBlockedResponseDto";
import LikesService from "./LikesService";
import UserServices from './UserServices';
import fameRatingConfig from '../config/fameRating.config';

class BlockedUsersService {
    async blockUser(blockerId: number, blockedId: number): Promise<void> {
        if (blockerId === blockedId) {
            throw {status: 400, message: 'Vous ne pouvez pas vous bloquer vous-même'};
        }

        // Vérifier si l'utilisateur cible existe
        const targetExists = await userDAL.userExists(blockedId);
        if (!targetExists) {
            throw {status: 404, message: 'Utilisateur cible non trouvé'};
        }

        // Vérifier si le blocage existe déjà
        const alreadyBlocked = await BlockedUsersDAL.isUserBlocked(blockerId, blockedId);
        if (alreadyBlocked) {
            throw {status: 409, message: 'Utilisateur déjà bloqué'};
        }

        // Tenter de supprimer le like, ignorer si non trouvé
        try {
            await LikesService.removeLike(blockerId, blockedId);
        } catch (error: any) {
            if (error.status !== 404) {
                throw error;
            }
            // Ignorer l'erreur si le like n'existe pas
        }

        // Bloquer l'utilisateur
        await BlockedUsersDAL.blockUser(blockerId, blockedId);

        await UserServices.updateFameRating(blockedId, fameRatingConfig.blocked);
    }

    async unblockUser(blockerId: number, blockedId: number): Promise<void> {
        await BlockedUsersDAL.unblockUser(blockerId, blockedId);
        await UserServices.updateFameRating(blockedId, fameRatingConfig.unblocked);
    }

    async getUserBlockedData(userId: number): Promise<UserBlockedResponseDto> {
        // Récupérer les utilisateurs que l'utilisateur a bloqués
        const blockedUsersData = await BlockedUsersDAL.getBlockedUsersByUserId(userId);
        const blockedUserIds = blockedUsersData.map(bu => bu.blocked_id);
        const blockedUsers = blockedUserIds.length > 0 ? await userDAL.getUsersByIds(blockedUserIds) : [];

        const blockedUsersResponse: BlockedUserResponseDto[] = blockedUsers.map(user => ({
            id: user.id,
            username: user.username,
            main_photo_url: user.main_photo_url,
            blocked_at: blockedUsersData.find(bu => bu.blocked_id === user.id)!.blocked_at,
        }));

        // Récupérer les utilisateurs qui ont bloqué l'utilisateur
        const blockedByUsersData = await BlockedUsersDAL.getUsersWhoBlockedUser(userId);
        const blockerUserIds = blockedByUsersData.map(bu => bu.blocker_id);
        const blockedByUsers = blockerUserIds.length > 0 ? await userDAL.getUsersByIds(blockerUserIds) : [];

        const blockedByUsersResponse: BlockedUserResponseDto[] = blockedByUsers.map(user => ({
            id: user.id,
            username: user.username,
            main_photo_url: user.main_photo_url,
            blocked_at: blockedByUsersData.find(bu => bu.blocker_id === user.id)!.blocked_at,
        }));

        return {
            blockedUsers: blockedUsersResponse,
            blockedByUsers: blockedByUsersResponse,
        };
    }

    async isUserBlocked(blockerId: number, blockedId: number): Promise<boolean> {
        return await BlockedUsersDAL.isUserBlocked(blockerId, blockedId);
    }

    async checkIsUserBlocked(blockerId: number, blockedId: number): Promise<void> {
        const isBlocked = await BlockedUsersDAL.isUserBlocked(blockerId, blockedId);
        if (isBlocked) {
            throw {
                status: 403,
                message: 'Vous ne pouvez plus intéragir avec cet utilisateur (Il vous a bloqué... CHEHH ! BOUUUUUUUUHHHHH!!!)'
            };
        }
    }
}

export default new BlockedUsersService();
