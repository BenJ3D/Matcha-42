import {Socket, Server} from "socket.io";
import UnreadUserMessageService from "../../services/UnreadUserMessageService";

const chatSocketEventHandler = (socket: Socket, io: Server) => {

    /**
     * Signaler que nous avons ouvert une conversation (pour enlever le "conversation non lu")
     */
    socket.on('conversation_read', (payload: { data: number }) => {
        console.log("Conversation read", payload);
        try {
            UnreadUserMessageService.removeUnreadChat(payload.data, socket.data.userId)
            socket.emit('fetch_notifications');
        } catch (error: any) {
        }
    });
};

export default chatSocketEventHandler;