import {Socket, Server} from "socket.io";
import NotificationsService from "../../services/NotificationsService";

const notificationEventHandler = (socket: Socket, io: Server) => {

    socket.on('notification_read', (payload: { data: number[] }) => {
        NotificationsService.markNotificationsAsRead(socket.data.userId, payload.data).then(r => {
        })
        socket.emit('fetch_notifications');
    });

    socket.on('notifications_delete', (payload: { data: number[] }) => {
        NotificationsService.deleteNotifications(socket.data.userId, payload.data).then(r => {
        })
        socket.emit('fetch_notifications');
    });
};

export default notificationEventHandler;