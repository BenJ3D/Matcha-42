import {Socket, Server} from "socket.io";
import {CreateMessageDto} from "../../DTOs/chat/MessageDto";

const messageEventHandler = (socket: Socket, io: Server) => {

    socket.on('message', (data: CreateMessageDto) => {

        console.log(`DBG MESSAGE EVENT\n${JSON.stringify(data)}\n`)
        // Traiter les données reçues et éventuellement émettre des événements
        socket.emit<string>('blabla', {message: 'Événement reçu et traité'});
    });
};

export default messageEventHandler;