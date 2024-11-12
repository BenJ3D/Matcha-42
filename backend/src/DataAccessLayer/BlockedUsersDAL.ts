import db from '../config/knexConfig';
import {BlockedUser} from '../models/BlockedUser';

class BlockedUsersDAL {
    async blockUser(blockerId: number, blockedId: number): Promise<void> {
        await db('blocked_users').insert({
            blocker_id: blockerId,
            blocked_id: blockedId,
        });
    }

    async unblockUser(blockerId: number, blockedId: number): Promise<void> {
        const deletedRows = await db('blocked_users')
            .where({blocker_id: blockerId, blocked_id: blockedId})
            .del();

        if (deletedRows === 0) {
            throw {status: 404, message: 'Blocage non trouvé'};
        }
    }

    async getBlockedUsersByUserId(userId: number): Promise<BlockedUser[]> {
        return await db('blocked_users')
            .where({blocker_id: userId})
            .select();
    }

    async getUsersWhoBlockedUser(userId: number): Promise<BlockedUser[]> {
        return await db('blocked_users')
            .where({blocked_id: userId})
            .select();
    }

    async isUserBlocked(blockerId: number, blockedId: number): Promise<boolean> {
        const result = await db('blocked_users')
            .where({blocker_id: blockerId, blocked_id: blockedId})
            .first();

        return !!result;
    }

    async userExists(userId: number): Promise<boolean> {
        const user = await db('users')
            .where({id: userId})
            .first();

        return !!user;
    }
}

export default new BlockedUsersDAL();
