import {Socket, Server} from "socket.io";
import {Notification} from "../../models/Notifications";


const notificationEventHandler = (socket: Socket, io: Server) => {

    socket.on('notification', (data: Notification) => {
        console.log("Reçu 'notification' avec les données:\n message = ", data);
        console.log("Reçu 'notification' avec les données:\n message = ", data.content + "\ntype: " + data.type);
        // Traiter les données reçues et éventuellement émettre des événements
        io.emit<string>('userid', {message: 'Événement reçu et traité'});
    });
};

export default notificationEventHandler;