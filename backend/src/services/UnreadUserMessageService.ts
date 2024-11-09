import UnreadUserMessageDAL from "../DataAccessLayer/UnreadUserMessageDAL";

class UnreadUserMessageService {
    async addUnreadChat(ownerUserId: number, targetUserId: number): Promise<void> {
        await UnreadUserMessageDAL.addUnreadChat(ownerUserId, targetUserId);
    }

    async removeUnreadChat(ownerUserId: number, targetUserId: number): Promise<void> {
        await UnreadUserMessageDAL.removeUnreadChat(ownerUserId, targetUserId);
    }

    async hasUnreadMessage(ownerUserId: number, targetUserId: number): Promise<boolean> {
        return await UnreadUserMessageDAL.hasUnreadChat(ownerUserId, targetUserId);
    }

    async getUnreadChatForUser(userId: number): Promise<number[]> {
        const unreadMessages = await UnreadUserMessageDAL.getUnreadChatForUser(userId);
        return unreadMessages.map(msg => msg.owner_message_user);
    }
}

export default new UnreadUserMessageService();
