import {Socket} from "socket.io";

const onlineUsers = new Map<number, Set<Socket>>();

export {onlineUsers};