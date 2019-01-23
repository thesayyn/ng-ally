import * as socket from 'socket.io';

export interface Server extends socket.Server {}
export abstract class Server {}

export interface Namespace extends socket.Namespace {}
export abstract class Namespace {}

export interface Socket extends socket.Socket {}
export abstract class Socket {}
