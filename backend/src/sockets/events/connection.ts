import {Socket, Server} from "socket.io";

const connectionHandler = (socket: Socket, io: Server) => {
    socket.on('disconnect', () => {
        console.log("Déconnexion: " + socket.id);
        // TODO Gérer la logique de déconnexion ici : status online/offline ?
    });

    // Ajouter d'autres événements liés à la connexion si nécessaire
};

export default connectionHandler;