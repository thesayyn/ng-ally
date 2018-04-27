import { NgModule, ModuleWithProviders, APP_INITIALIZER, Inject } from '@angular/core'
import { SOCKETIO_APP, HTTP_SERVER } from './application_tokens'
import socket, { Server } from 'socket.io'

@NgModule({})
export class SocketIOModule{

    static forRoot(options?: socket.ServerOptions): ModuleWithProviders{
        return { 
            ngModule: this,
            providers: [
                {
                    provide: SOCKETIO_APP,
                    useFactory: (server)=>{
                        console.log('Socket created!');
                        return socket.listen(server, Object.assign(options || {}, { serveClient: false }) )
                    },
                    deps: [
                        [new Inject(HTTP_SERVER)]
                    ]
                },
                { 
                    provide: APP_INITIALIZER,
                    multi: true,
                    useFactory: ()=> ()=> Promise.resolve(null),
                    deps: [
                        [new Inject(SOCKETIO_APP)]
                    ]
                },
                {
                    provide: SocketIO,
                    useExisting: SOCKETIO_APP
                }
            ]
        }
    }
}

export abstract class SocketIO implements Server {
    engine: { ws: any; };
    nsps: { [namespace: string]: socket.Namespace; };
    sockets: socket.Namespace;
    json: socket.Server;
    volatile: socket.Server;
    local: socket.Server;
    abstract checkRequest(req: any, fn: (err: any, success: boolean) => void): void 
    abstract serveClient(): boolean;
    abstract serveClient(v: boolean): socket.Server;
    abstract serveClient(v?: any)
    abstract path(): string;
    abstract path(v: string): socket.Server;
    abstract path(v?: any) 
    abstract adapter();
    abstract adapter(v: any): socket.Server;
    abstract adapter(v?: any)
    abstract origins(): string;
    abstract origins(v: string): socket.Server;
    abstract origins(v?: any)
    abstract attach(srv: any, opts?: socket.ServerOptions): socket.Server;
    abstract attach(port: number, opts?: socket.ServerOptions): socket.Server;
    abstract attach(port: any, opts?: any) 
    abstract listen(srv: any, opts?: socket.ServerOptions): socket.Server;
    abstract listen(port: number, opts?: socket.ServerOptions): socket.Server;
    abstract listen(port: any, opts?: any) 
    abstract bind(srv: any): socket.Server 
    abstract onconnection(socket: any): socket.Server 
    abstract of(nsp: string): socket.Namespace 
    abstract close(fn?: () => void): void
    abstract on(event: "connection", listener: (socket: socket.Socket) => void): socket.Namespace;
    abstract on(event: "connect", listener: (socket: socket.Socket) => void): socket.Namespace;
    abstract on(event: string, listener: Function): socket.Namespace;
    abstract on(event: any, listener: any) 
    abstract to(room: string): socket.Namespace 
    abstract in(room: string): socket.Namespace 
    abstract use(fn: (socket: socket.Socket, fn: (err?: any) => void) => void): socket.Namespace 
    abstract emit(event: string, ...args: any[]): socket.Namespace
    abstract send(...args: any[]): socket.Namespace 
    abstract write(...args: any[]): socket.Namespace
    abstract clients(...args: any[]): socket.Namespace 
    abstract compress(...args: any[]): socket.Namespace
}