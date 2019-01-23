import { Injector } from '@angular/core';
import { NAMESPACE, Namespaces, SOCKET_SERVER } from './config';
import { getOnMetadata } from './metadata';

export class SocketInitializer {
	constructor(private injector: Injector) {}

	resetConfig(): void {
		const namespaces: Namespaces = Array.prototype.concat.apply([], this.injector.get(NAMESPACE, []));
		if (namespaces.length < 1) {
			return;
		}
		const socket = this.injector.get(SOCKET_SERVER);
		namespaces.forEach((ns) => {
			const nm = socket.of(ns.path);
			const handler = this.injector.get(ns.handler);
			const eventMap = getOnMetadata(handler);

			new Array(...eventMap['connection'])
				.filter((h) => typeof handler[h] == 'function')
				.map((h) => handler[h].bind(handler))
				.forEach((h) => nm.on('connection', h));

			nm.on('connection', (socket) => {
				for (const eventName in eventMap) {
					new Array(...eventMap[eventName])
						.filter((h) => typeof handler[h] == 'function' && h !== 'connection')
						.map((h) => (handler[h] as Function).bind(handler, socket))
						.forEach((h) => socket.on(eventName, h));
				}
			});
		});
	}

	initialize(): Promise<void> {
		this.resetConfig();
		return Promise.resolve(null);
	}
}
