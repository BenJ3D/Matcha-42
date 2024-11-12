// services/BlockedUsersService.ts

import BlockedUsersDAL from '../DataAccessLayer/BlockedUsersDAL';
import userDAL from '../DataAccessLayer/UserDAL';
import {BlockedUserResponseDto} from '../DTOs/users/BlockedUserResponseDto';
import {UserBlockedResponseDto} from "../DTOs/blocked/UserBlockedResponseDto";
import LikesService from "./LikesService";

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
``
        await LikesService.removeLike(blockerId, blockedId);
        await BlockedUsersDAL.blockUser(blockerId, blockedId);
    }

    async unblockUser(blockerId: number, blockedId: number): Promise<void> {
        await BlockedUsersDAL.unblockUser(blockerId, blockedId);
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
}

export default new BlockedUsersService();
