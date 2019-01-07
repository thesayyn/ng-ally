import * as socket from 'socket.io';

export interface Server extends socket.Server {}
export abstract class Server {}

export interface Namespace extends socket.Server {}
export abstract class Namespace {}

export interface Packet extends socket.Packet {}

export interface Socket extends socket.Socket {}


export interface OnConnect {
    onConnect(socket: Socket): void;
}

export interface OnPacket {
    onPacket(socket: Socket, packet: Packet): void;
}

export interface OnError {
    onError(socket: Socket, error: any): void;
}



export interface OnDisconnect {
    onDisconnect(socket: Socket, reason?: string): void;
}
