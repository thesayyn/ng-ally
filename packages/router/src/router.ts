import { Injectable, NgZone, Injector, ReflectiveInjector, Type, ɵConsole as Console, InjectionToken } from '@angular/core'
import { concatMap, every, first, map, mergeMap, reduce, take } from 'rxjs/operators';
import { Observable, from } from 'rxjs';

import { Routes, Route, CanActivate,  CanDeactivate, validateConfig, copyConfig, normalizePath, ExtraOptions } from './config'
import { Request, Response } from './http';
import { ɵRouter, ɵNextFunction } from './private_export'
import { wrapIntoObservable, andObservables } from "./utils";
import { getZone } from "./zone";
import { RouterErrorHandlingStrategy } from "./router_error_handler";


export class Router{

    private rootRouter: ɵRouter;
    private _activateGuards: Array<Type<CanActivate>> = [];
    private _deactivateGuards: Array<Type<CanDeactivate>> = [];


    constructor(private config: Routes,
        private guards: Type<any>[],
        private _injector: Injector, 
        private _zone: NgZone,
        private _errorHandler: RouterErrorHandlingStrategy,
        private _options: ExtraOptions){

        this.resetConfig();
        this.rootRouter = this.createRouter();
        this.registerConfig();
    }

    resetConfig(): void
    {   
        validateConfig(this.config);
        this.config = this.config.map(copyConfig);
        this._activateGuards = this.guards.filter(guard => typeof (guard as any).canActivate == "function") || [];
        this._deactivateGuards = this.guards.filter(guard => typeof (guard as any).canDeactivate == "function") || [];
    }

    registerConfig(): void{
        this.rootRouter.use(this._beforeRoute.bind(this));
        this.config.forEach(child => this._registerRoutes(child, this.rootRouter));
        this.rootRouter.use(this._afterRoute.bind(this));
    }


    createRouter(): ɵRouter{
       return ɵRouter(this._options);
    }


    /**
     * @internal
     */
    _handleRoute(request: Request, response: Response, next: ɵNextFunction)
    {
        /**
         * @experimental
         */
        this._zone.runOutsideAngular(()=>{
            const zone = getZone({enableLongStackTrace: true});
            zone.onError.subscribe((error:any)=>{
                this._errorHandler.handle((request as any)._config, request,response, error)
            });
            zone.runGuarded(()=>{
                const injector = Injector.create([
                    { provide: NgZone, useValue: zone },
                    { provide: Request, useValue: request},
                    { provide: Response, useValue: response }], this._injector);
                (request as any)._injector = injector;
                this.rootRouter(request,response,next);
            })
        })

    }
    

    private _beforeRoute = (request: Request, response: Response, next: ɵNextFunction) => this._callGuard(request,response,next, 'canActivate', this._activateGuards);
    private _afterRoute = (request: Request, response: Response, next: ɵNextFunction) => this._callGuard(request,response,next, 'canDeactivate', this._deactivateGuards);


    /**
     * @experimental
     */
    private _registerRoutes(config: Route, parent: ɵRouter)
    {
       
        if(config.children)
        {  
            const router = this.createRouter();

            if(Array.isArray(config.canActivateChild))
            {
                router.use((request: any, response: any, next) => this._callGuard(request, response, next, 'canActivateChild', config.canActivateChild, config))
            }
        
            config.children.forEach(child => this._registerRoutes(child, router));

            parent.use(normalizePath(config), router)
        }
        else
        {
            const subRouter = this.createRouter();


            if(Array.isArray(config.canActivate))
            {
                subRouter.use((request: any, response: any, next) => this._callGuard(request,response, next, 'canActivate', config.canActivate, config))
            }

            subRouter.use((request: Request, response: Response) => {
                if(config.redirectTo){
                    response.redirect(config.redirectTo);
                } else{
                    this._callRequest(config, request, response);
                }
            })

            if(Array.isArray(config.canDeactivate))
            {
                subRouter.use((request:any, response: any, next) => this._callGuard(request,response, next, 'canDeactivate', config.canActivateChild, config))
            }
            (parent as any)[config.type!.toLowerCase()]( normalizePath(config), subRouter);
        }
    }

    getToken(guard: any): any 
    {
        if(guard.constructor.name != "Function" && !(guard instanceof InjectionToken) ) return guard;
        return this._injector.get(guard);
    }


    private _callGuard(request: Request, response: Response, next: ɵNextFunction, method : string, guards: any, config?: Route){
        (request as any)._config = config;
        const injector = (request as any)._injector as Injector
        const zone = injector.get(NgZone)
        const obs = andObservables(from([...guards]).pipe(map((c: any) => {
            const guard = this.getToken(c);
            let observable: Observable<boolean>;
            if(guard[method])
            {
                observable = wrapIntoObservable(guard[method](request,response));
            }
            else{
                observable = wrapIntoObservable(guard(request,response));
            }
            return observable.pipe(first());
        })));

        obs.subscribe(()=>{
            next();
        })
    }

    private _callRequest(config: Route, request: Request, response: Response)
    {
        const parent: Injector = (request as  any)._injector;
        parent.get(NgZone).runGuarded(()=>{
            const injector = ReflectiveInjector.resolveAndCreate([config.request!],  parent);
            injector.get(config.request);
        })
    }


}