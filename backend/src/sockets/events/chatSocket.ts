import {Socket, Server} from "socket.io";
import UnreadUserMessageService from "../../services/UnreadUserMessageService";

const chatSocketEventHandler = (socket: Socket, io: Server) => {
    socket.on('conversation_read', (payload: { data: number }) => {
        try {
            UnreadUserMessageService.removeUnreadChat(payload.data, socket.data.userId)
            socket.emit('fetch_notifications');
        } catch (error: any) {
        }
    });
};

export default chatSocketEventHandler;