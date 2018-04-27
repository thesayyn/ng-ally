import { NgModule, ApplicationRef, ErrorHandler, ApplicationInitStatus, PLATFORM_ID, Injector, Inject, Optional, ModuleWithProviders, APP_INITIALIZER } from '@angular/core'
import http from 'http'
import express from 'express'

import { ServerApplicationRef } from './application_ref';
import { PLATFORM_SERVER_ID } from './platform_tokens';
import { EXPRESS_APP, SOCKETIO_APP, HTTP_SERVER } from './application_tokens';


export function errorHandler(): ErrorHandler {
    return new ErrorHandler();
}

@NgModule({
    providers: [ 
        { provide: PLATFORM_ID, useValue: PLATFORM_SERVER_ID },
        { provide: ApplicationInitStatus, useClass : ApplicationInitStatus },
        { provide: ApplicationRef, useClass : ServerApplicationRef, deps : [Injector] },
        { provide: ServerApplicationRef, useExisting : ApplicationRef },
        { provide: ErrorHandler, useFactory : errorHandler, deps: [] },
        { provide: EXPRESS_APP, useFactory: () => express() , deps: [] },
        { provide: HTTP_SERVER, useFactory: (express: express.Express)=> http.createServer(express), deps: [[new Inject(EXPRESS_APP)]]}
    ]
})
export class ServerModule{

}

