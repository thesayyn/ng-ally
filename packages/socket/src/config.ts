import { InjectionToken } from '@angular/core';
import * as socket from 'socket.io';

export const SOCKET_SERVER = new InjectionToken<socket.Server>('SOCKET_SERVER');

export const NAMESPACE = new InjectionToken<NamespaceConfig>('SOCKET_NAMESPACE');

export interface NamespaceConfig {
	path: string | RegExp | Function;
	handler: any;
}

export type Namespaces = Array<NamespaceConfig>;

