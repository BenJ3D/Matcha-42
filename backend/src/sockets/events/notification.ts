import {Socket, Server} from "socket.io";

interface notif {
    message: string;
    type: number;
}

const notificationEventHandler = (socket: Socket, io: Server) => {
    socket.on('notification', (data: notif) => {
        console.log("Reçu 'notification' avec les données:\n message = ", data);
        console.log("Reçu 'notification' avec les données:\n message = ", data.message + "\ntype: " + data.type);
        // Traiter les données reçues et éventuellement émettre des événements
        io.emit<string>('userid', {message: 'Événement reçu et traité'});
    });
};

export default notificationEventHandler;