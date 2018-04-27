import { Inject, Injector, ModuleWithProviders, NgModule, NgZone, Optional, Type, InjectionToken, APP_INITIALIZER, APP_BOOTSTRAP_LISTENER } from '@angular/core';
import { EXTRA_OPTIONS, ExtraOptions, ROUTER_GUARDS, ROUTES, Route, Routes } from './config';
import { Router } from './router';
import { DefaultRouterErrorHandler, ROUTER_ERROR_HANDLER, ReportToErrorHandlerStrategy, RouterErrorHandlingStrategy, SendThroughResponseStrategy } from "./router_error_handler";
import { RouterInitializer } from './router_initializer';
import { flatten } from './utils';




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
                    [new Inject(ROUTES)], 
                    [new Inject(ROUTER_GUARDS), new Optional()], 
                    Injector, 
                    NgZone, 
                    RouterErrorHandlingStrategy, 
                    [new Inject(EXTRA_OPTIONS), new Optional()]
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

export const setupRouter = (routes: Route[][], interceptors: Type<any>[],injector: Injector, zone: NgZone, errorHandling: RouterErrorHandlingStrategy, options: ExtraOptions): Router =>
{
    return (new Router(flatten(routes), interceptors || [] ,injector, zone, errorHandling, Object.assign({mergeParams: true},options)))
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

export function provideRouterInitializer(): any
{
    return [
        RouterInitializer,
        { provide: APP_INITIALIZER, multi: true, useFactory: getAppInitializer , deps: [ RouterInitializer ] },
    ]
}