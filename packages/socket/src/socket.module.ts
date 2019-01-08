import { APP_INITIALIZER, Inject, Injector, ModuleWithProviders, NgModule } from '@angular/core';
import { HTTP_SERVER } from '@ng-ally/platform-server';
import * as socket from 'socket.io';
import { NAMESPACE, Namespaces, SOCKET_SERVER } from './config';
import { SocketInitializer } from './socket.initializer';
import { Server } from './types';

@NgModule({})
export class SocketModule {
	static forRoot(namespaces: Namespaces, options?: Partial<socket.ServerOptions>): ModuleWithProviders<SocketModule> {
		return {
			ngModule: this,
			providers: [
				{ provide: NAMESPACE, multi: true, useValue: namespaces },
				{
					provide: SOCKET_SERVER,
					useFactory: (server) => {
						return socket(server, {
							...options,
							transports: [ 'websocket' ],
							serveClient: false
						});
					},
					deps: [ [ new Inject(HTTP_SERVER) ] ]
				},
				{
					provide: Server,
					useExisting: SOCKET_SERVER
				},
				{ provide: SocketInitializer, useClass: SocketInitializer, deps: [ Injector ] },
				{
					provide: APP_INITIALIZER,
					multi: true,
					useFactory: provideSocketInitializer,
					deps: [ SocketInitializer ]
				}
			]
		};
	}
	static forChild(namespaces: Namespaces): ModuleWithProviders<SocketModule> {
		return {
			ngModule: SocketModule,
			providers: [
				{
					provide: NAMESPACE,
					useValue: namespaces
				}
			]
		};
	}
}

export function provideSocketInitializer(initializer: SocketInitializer) {
	return initializer.initialize.bind(initializer);
}
