import {
  ApplicationInitStatus,
  ApplicationRef,
  ErrorHandler,
  Inject,
  Injector,
  NgModule,
  PLATFORM_ID
} from "@angular/core";
import * as express from "express";
import * as http from "http";
import { ServerApplicationRef } from "./application_ref";
import { EXPRESS_APP, HTTP_SERVER } from "./application_tokens";
import { PLATFORM_SERVER_ID } from "./platform_tokens";

export function errorHandler(): ErrorHandler {
  return new ErrorHandler();
}

@NgModule({
  providers: [
    { provide: PLATFORM_ID, useValue: PLATFORM_SERVER_ID },
    { provide: ApplicationInitStatus, useClass: ApplicationInitStatus },
    {
      provide: ApplicationRef,
      useClass: ServerApplicationRef,
      deps: [Injector]
    },
    { provide: ServerApplicationRef, useExisting: ApplicationRef },
    { provide: ErrorHandler, useFactory: errorHandler, deps: [] },
    { provide: EXPRESS_APP, useFactory: provideExpress, deps: [] },
    {
      provide: HTTP_SERVER,
      useFactory: provideHttpServer,
      deps: [[new Inject(EXPRESS_APP)]]
    }
  ]
})
export class ServerModule {}

export function provideExpress() {
  return express();
} 

export function provideHttpServer(express: express.Express) {
  return http.createServer(express);
}