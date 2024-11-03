import {Socket} from "socket.io";

// Map pour associer les userId aux ensembles de sockets
const onlineUsers = new Map<number, Set<Socket>>();

export {onlineUsers};
6