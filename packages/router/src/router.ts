import { Injector, NgZone, ReflectiveInjector } from "@angular/core";
import { from } from "rxjs";
import { first, map } from "rxjs/operators";
import { CheckFn, Checks, Guard, resolveChecks, swallowChecks } from "./checks";
import {
  copyConfig,
  ExtraOptions,
  normalizePath,
  Route,
  Routes,
  validateConfig
} from "./config";
import { Request, Response, RequestHandlerFn, RequestHandler } from "./http";
import { ExpressNextFunction, ExpressRouter } from "./private_export";
import { RouterErrorHandlingStrategy } from "./router_error_handler";
import { andObservables, wrapIntoObservable } from "./utils";
import { getZone } from "./zone";

export class Router {
  private _router: ExpressRouter;
  private _checks: Checks;

  constructor(
    private config: Routes,
    private _guards: Array<Guard>,
    private _injector: Injector,
    private _zone: NgZone,
    private _errorHandler: RouterErrorHandlingStrategy,
    private _options: ExtraOptions
  ) {
    this.resetConfig();
    this._router = this._createRouter();
    this.registerConfig();
  }

  resetConfig(): void {
    validateConfig(this.config);
    this.config = this.config.map(copyConfig);
    this.config.forEach(route => this._resolveChecks(route));
    this._checks = swallowChecks(
      this._injector,
      this._guards || [],
      "canActivate"
    );
  }

  registerConfig(): void {
    if (this._checks.canActivateChecks) {
      this._router.use((request, response, next) => {
        this._invokeChecks(
          { request, response, next, route: undefined },
          this._checks.canActivateChecks
        );
      });
    }
    this.config.forEach(child => this._registerRoutes(child, this._router));
    if (this._checks.canDeactivateChecks) {
      this._router.use((request, response, next) => {
        this._invokeChecks(
          { request, response, next, route: undefined },
          this._checks.canDeactivateChecks
        );
      });
    }
  }

  _resolveChecks(route: Route): void {
    route.canActivate = resolveChecks(
      this._injector,
      route.canActivate || [],
      "canActivate"
    );
    route.canActivateChild = resolveChecks(
      this._injector,
      route.canActivateChild || [],
      "canActivateChild"
    );
    route.canDeactivate = resolveChecks(
      this._injector,
      route.canDeactivate || [],
      "canDeactivate"
    );
    if (route.children) {
      route.children.forEach(cr => this._resolveChecks(cr));
    }
  }

  _createRouter(): ExpressRouter {
    return ExpressRouter(this._options);
  }

  _handleRoute(
    request: Request,
    response: Response,
    next: ExpressNextFunction
  ) {
    this._zone.runOutsideAngular(() => {
      const zone = getZone({ enableLongStackTrace: true });
      zone.onError.subscribe((error: any) => {
        this._errorHandler.handle(
          request.activatedRoute.route,
          request,
          response,
          error
        );
      });
      zone.runGuarded(() => {
        const injector = Injector.create(
          [
            { provide: NgZone, useValue: zone },
            { provide: Request, useValue: request },
            { provide: Response, useValue: response }
          ],
          this._injector
        );
        request.activatedRoute = <ActivatedRoute>{
          route: undefined,
          injector: injector,
          next,
          request,
          response,
          zone
        };
        this._router(request, response, next);
      });
    });
  }

  _registerRoutes(route: Route, parent: ExpressRouter) {
    if (route.children) {
      const router = this._createRouter();

      if (Array.isArray(route.canActivateChild)) {
        router.use((request, response, next) =>
          this._invokeChecks(
            { request, response, next, route },
            route.canActivateChild
          )
        );
      }

      route.children.forEach(child => this._registerRoutes(child, router));

      parent.use(normalizePath(route), router);
    } else {
      const router = this._createRouter();

      if (Array.isArray(route.canActivate)) {
        router.use((request, response, next) =>
          this._invokeChecks(
            { request, response, next, route },
            route.canActivateChild
          )
        );
      }

      router.use((request, response, next) => {
        if (route.redirectTo) {
          response.redirect(route.redirectTo);
        } else {
          const activatedRoute: ActivatedRoute = (<Request>request)
            .activatedRoute;
          this._invokeRequest({ ...activatedRoute, route });
          delete (<Request>request).activatedRoute;
        }
      });

      if (Array.isArray(route.canDeactivate)) {
        router.use((request, response, next) =>
          this._invokeChecks(
            { request, response, next, route },
            route.canActivateChild
          )
        );
      }
      parent[route.type!.toLowerCase()](normalizePath(route), router);
    }
  }

  _invokeChecks(activatedRoute: ActivatedRoute, checks: CheckFn[]) {
    andObservables(
      from([...checks]).pipe(
        map(check =>
          wrapIntoObservable(
            check(activatedRoute.request, activatedRoute.response)
          ).pipe(first())
        )
      )
    ).subscribe(() => activatedRoute.next());
  }

  _invokeRequest(activatedRoute: ActivatedRoute) {
    const parent: Injector = activatedRoute.injector;
    parent.get(NgZone).runGuarded(() => {
      const injector = ReflectiveInjector.resolveAndCreate(
        [activatedRoute.route.request!],
        parent
      );
      const instance = injector.get(activatedRoute.route.request, activatedRoute.route.request);
      
      if ( typeof instance == "function" ) {
        (<RequestHandlerFn>instance)(activatedRoute.request, activatedRoute.response);
      } else if ( typeof instance == "object" && typeof (<RequestHandler>instance).handle == "function" ) {
        (<RequestHandler>instance).handle(activatedRoute.request, activatedRoute.response);
      }
    });
  }
}

export interface ActivatedRoute {
  zone?: NgZone;
  injector?: Injector;
  route?: Route;
  request: Request;
  response: Response;
  next: ExpressNextFunction;
}
