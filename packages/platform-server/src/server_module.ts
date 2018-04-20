import { NgModule, ApplicationRef, ErrorHandler, ApplicationInitStatus, PLATFORM_ID, Injector } from '@angular/core'
import { ServerApplicationRef } from './application_ref';
import { PLATFORM_SERVER_ID } from './platform_tokens';


export function errorHandler(): ErrorHandler {
    return new ErrorHandler();
}

@NgModule({
    providers: [ 
        { provide: PLATFORM_ID, useValue: PLATFORM_SERVER_ID },
        { provide: ApplicationInitStatus, useClass : ApplicationInitStatus , deps: [] },
        { provide: ApplicationRef, useClass : ServerApplicationRef, deps : [Injector] },
        { provide: ServerApplicationRef, useExisting : ApplicationRef },
        { provide: ErrorHandler, useFactory : errorHandler, deps: [] }
    ]
})
export class ServerModule{

}