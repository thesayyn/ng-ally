import { InjectionToken } from "@angular/core";
import { Server } from "socket.io";

export const SOCKET_APP = new InjectionToken<Server>('SOCKET_APP');