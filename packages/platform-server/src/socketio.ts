import {
  NgModule,
  ModuleWithProviders,
  APP_INITIALIZER,
  Inject
} from "@angular/core";
import { SOCKETIO_APP, HTTP_SERVER } from "./application_tokens";
import socket from "socket.io";

@NgModule({})
export class SocketIOModule {
  static forRoot(options?: any): ModuleWithProviders {
    return {
      ngModule: this,
      providers: [
        {
          provide: SOCKETIO_APP,
          useFactory: server => {
            return socket.listen(server, { ...options, serveClient: false });
          },
          deps: [[new Inject(HTTP_SERVER)]]
        },
        {
          provide: APP_INITIALIZER,
          multi: true,
          useFactory: () => () => Promise.resolve(null),
          deps: [[new Inject(SOCKETIO_APP)]]
        },
        {
          provide: SocketIO,
          useExisting: SOCKETIO_APP
        }
      ]
    };
  }
}

export abstract class SocketIO {
  [key: string]: any;
}
