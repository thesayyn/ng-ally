import { NgModule, ModuleWithProviders, APP_INITIALIZER, InjectionToken, APP_BOOTSTRAP_LISTENER, NgZone, Injector, Inject, Optional, Type, ɵConsole as Console } from '@angular/core'
import { Routes, Route, ROUTES, ROUTER_GUARDS, ExtraOptions, EXTRA_OPTIONS } from './config';
import { RouterInitializer } from './router_initializer';
import { RouterErrorHandlingStrategy, ROUTER_ERROR_HANDLER, DefaultRouterErrorHandler, SendThroughResponseStrategy, ReportToErrorHandlerStrategy } from "./router_error_handler";
import { Router } from './router';
import { flatten } from './utils';
import { APP_ENDPOINT_LISTENER } from '@tdadmin/platform-server';


@NgModule({})
export class RouterModule{
    static forRoot(routes: Routes, config: ExtraOptions = {}): ModuleWithProviders {
        return {
          ngModule: RouterModule,
          providers: [
            {
                provide: EXTRA_OPTIONS,
                useValue: config,
            },
            provideRoutes(routes),
            { 
                provide: Router, 
                useFactory: setupRouter, 
                deps: [ 
                    [new Inject(ROUTES)], [new Inject(ROUTER_GUARDS), new Optional()], Injector, NgZone, RouterErrorHandlingStrategy, Console, [new Inject(EXTRA_OPTIONS), new Optional()]
                ]
            },
            provideErrorHandlingStrategy(config),
            provideRouterInitializer(),
            provideDefaultErrorHandler()
          ]
        };
    }

    static forChild(routes: Routes): ModuleWithProviders {
        return {
          ngModule: RouterModule,
          providers: [
            provideRoutes(routes)
          ]
        };
    }
}

export const setupRouter = (routes: Route[][], interceptors: Type<any>[],injector: Injector, zone: NgZone, errorHandling: RouterErrorHandlingStrategy, console: Console, options: ExtraOptions): Router =>
{
    return (new Router(flatten(routes), interceptors || [] ,injector, zone, errorHandling, console, Object.assign({mergeParams: true},options)))
}

export function provideRoutes(routes: Routes): any
{
    return [
        { provide: ROUTES, multi: true, useValue: routes }
    ]
}


export function provideErrorHandlingStrategy(config: ExtraOptions )
{
    return [
        {
            provide: RouterErrorHandlingStrategy,
            useClass: config.errorHandlingStrategy == 'sendThroughResponse' ? SendThroughResponseStrategy : ReportToErrorHandlerStrategy,
            deps: [[new Inject(ROUTER_ERROR_HANDLER)], Injector]
        }
    ]
}




export function provideDefaultErrorHandler(): any
{
    return [
        { provide: ROUTER_ERROR_HANDLER, useFactory: ()=> new DefaultRouterErrorHandler(), deps: [] }
    ]
}



export function getAppInitializer(r: RouterInitializer) {
    return r.appInitializer.bind(r);
}
  
export function getBootstrapListener(r: RouterInitializer) {
    return r.bootstrapListener.bind(r);
}

export function getEndpointListener(r: RouterInitializer) {
    return r.endpointListener.bind(r);
}

export const ROUTER_INITIALIZER: InjectionToken<any> = new InjectionToken<any>('Router Initializer');

export function provideRouterInitializer(): any
{
    return [
        RouterInitializer,
        { provide: APP_ENDPOINT_LISTENER, multi: true, useFactory: getEndpointListener,  deps: [RouterInitializer] },
        { provide: APP_INITIALIZER, multi: true, useFactory: getAppInitializer, deps: [RouterInitializer] },
        { provide: ROUTER_INITIALIZER, useFactory: getBootstrapListener, deps: [RouterInitializer]},
        { provide: APP_BOOTSTRAP_LISTENER, multi: true, useExisting: ROUTER_INITIALIZER}
    ]
}