import {
  NgModule,
  ModuleWithProviders,
  APP_INITIALIZER,
  Inject
} from "@angular/core";
import { HTTP_SERVER } from "@ng-ally/platform-server";
import { listen } from "socket.io";
import { SOCKET_APP } from "./config";
import { Socket } from "./socket.service";

@NgModule({})
export class SocketModule {
  static forRoot(options?: any): ModuleWithProviders {
    return {
      ngModule: this,
      providers: [
        {
          provide: SOCKET_APP,
          useFactory: server => {
            return listen(server, { ...options, serveClient: false });
          },
          deps: [[new Inject(HTTP_SERVER)]]
        },
        {
          provide: APP_INITIALIZER,
          multi: true,
          useFactory: () => () => Promise.resolve(null),
          deps: [[new Inject(SOCKET_APP)]]
        },
        {
          provide: Socket,
          useExisting: SOCKET_APP
        }
      ]
    };
  }
}
