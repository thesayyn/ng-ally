import { Injector } from '@angular/core';
import { NAMESPACE, Namespaces, SOCKET_SERVER } from './config';
import { Namespace, Server } from './types';

export class SocketInitializer {
	constructor(private injector: Injector) {}

	resetConfig(): void {
        const namespaces: Namespaces = Array.prototype.concat.apply([], this.injector.get(NAMESPACE, []));
        if ( namespaces.length < 1 ) {
            return;
        }
		const socket = this.injector.get(SOCKET_SERVER);
		namespaces.forEach((ns) => {
			const namespace = socket.of(ns.path);
			const injector = Injector.create({
				providers: [
					{ provide: Namespace, useValue: namespace },
					{ provide: Server, useValue: namespace.server }
				],
				parent: this.injector,
				name: `socket${ns.path}`
			});
			namespace.on('connection', (socket) => {
				const handler = injector.get(ns.handler);
              
                if (typeof handler.onConnect === 'function') {
                    handler.onConnect(socket);
                }
                
				if (typeof handler.onPacket === 'function') {
					socket.use((packet) => handler.onPacket(socket, packet));
				}

				if (typeof handler.onError === 'function') {
					socket.on('error', (error) => handler.onError(socket, error));
				}

				if (typeof handler.onDisconnect === 'function') {
					socket.on('disconnect', (reason) => handler.onDisconnect(socket, reason));
				}
			});
		});
	}

	initialize(): Promise<void> {
        this.resetConfig();
		return Promise.resolve(null);
	}
}
