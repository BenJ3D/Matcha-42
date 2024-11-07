import UnreadUserMessageDAL from "../DataAccessLayer/UnreadUserMessageDAL";

class UnreadUserMessageService {
    async addUnreadMessage(ownerUserId: number, targetUserId: number): Promise<void> {
        await UnreadUserMessageDAL.addUnreadMessage(ownerUserId, targetUserId);
    }

    async removeUnreadMessage(ownerUserId: number, targetUserId: number): Promise<void> {
        await UnreadUserMessageDAL.removeUnreadMessage(ownerUserId, targetUserId);
    }

    async hasUnreadMessage(ownerUserId: number, targetUserId: number): Promise<boolean> {
        return await UnreadUserMessageDAL.hasUnreadMessage(ownerUserId, targetUserId);
    }

    async getUnreadMessagesForUser(userId: number): Promise<number[]> {
        const unreadMessages = await UnreadUserMessageDAL.getUnreadMessagesForUser(userId);
        return unreadMessages.map(msg => msg.owner_message_user);
    }
}

export default new UnreadUserMessageService();
