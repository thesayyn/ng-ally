import { Injector, NgZone, ReflectiveInjector } from "@angular/core";
import { from, Subject } from "rxjs";
import { filter, first, map } from "rxjs/operators";
import { CheckFn, Checks, Guard, resolveChecks, swallowChecks } from "./checks";
import {
  copyConfig,
  ExtraOptions,
  normalizePath,
  Route,
  Routes,
  validateConfig
} from "./config";
import { Request, RequestHandler, RequestHandlerFn, Response } from "./http";
import { ExpressNextFunction, ExpressRouter } from "./private_export";
import { RouterErrorHandlingStrategy } from "./router_error_handler";
import { andObservables, wrapIntoObservable } from "./utils";
import { getZone } from "./zone";

export class Router {
  private _router: ExpressRouter;
  private _checks: Checks;
  private _error: Subject<ErrorContext> = new Subject<ErrorContext>();

  constructor(
    private config: Routes,
    private _guards: Array<Guard>,
    private _injector: Injector,
    private _zone: NgZone,
    private _errorHandler: RouterErrorHandlingStrategy,
    private _options: ExtraOptions
  ) {
    this._error.subscribe(context =>
      this._errorHandler.handle(
        context.error,
        context.request,
        context.response,
        context.route
      )
    );
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
    if (
      this._checks.canActivateChecks &&
      this._checks.canActivateChecks.length > 0
    ) {
      this._router.use((request, response, next) => {
        const zone = getZone({ enableLongStackTrace: true });
        zone.onError.subscribe(error =>
          this._error.next({ error, request, response })
        );

        this._invokeChecks(
          { request, response, next, zone },
          this._checks.canActivateChecks
        );
      });
    }
    this.config.forEach(child => this._registerRoutes(child, this._router));
    if (
      this._checks.canDeactivateChecks &&
      this._checks.canDeactivateChecks.length > 0
    ) {
      this._router.use((request, response, next) => {
        const zone = getZone({ enableLongStackTrace: true });
        zone.onError.subscribe(error =>
          this._error.next({ error, request, response })
        );

        this._invokeChecks(
          { request, response, next, zone },
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
      zone.onError.subscribe(error =>
        this._error.next({
          error,
          request,
          response,
          route: (<Request>request).activatedRoute.route
        })
      );
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
          injector,
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

      if (
        Array.isArray(route.canActivateChild) &&
        route.canActivateChild.length > 0
      ) {
        router.use(request => {
          ((<Request>request).activatedRoute as ActivatedRoute).route = route;

          this._invokeChecks(
            (<Request>request).activatedRoute,
            route.canActivateChild
          );
        });
      }

      route.children.forEach(child => this._registerRoutes(child, router));

      parent.use(normalizePath(route), router);
    } else {
      const router = this._createRouter();

      if (Array.isArray(route.canActivate) && route.canActivate.length > 0) {
        router.use(request => {
          ((<Request>request).activatedRoute as ActivatedRoute).route = route;

          this._invokeChecks(
            (<Request>request).activatedRoute,
            route.canActivate
          );
        });
      }

      router.use((request, response) => {
        if (route.redirectTo) {
          response.redirect(route.redirectTo);
        } else {
          ((<Request>request).activatedRoute as ActivatedRoute).route = route;
          (<Request>request).data = route.data;

          this._invokeRequest((<Request>request).activatedRoute);
        }
      });

      if (
        Array.isArray(route.canDeactivate) &&
        route.canDeactivate.length > 0
      ) {
        router.use(request => {
          this._invokeChecks(
            (<Request>request).activatedRoute,
            route.canDeactivate
          );
        });
      }
      parent[route.type!.toLowerCase()](normalizePath(route), router);
    }
  }

  _invokeChecks(activatedRoute: ActivatedRoute, checks: CheckFn[]) {
    activatedRoute.zone.runGuarded(() => {
      andObservables(
        from(checks).pipe(
          map(check =>
            wrapIntoObservable(
              check(activatedRoute.request, activatedRoute.response)
            ).pipe(first())
          )
        )
      )
        .pipe(filter(r => r))
        .subscribe(() => activatedRoute.next());
    });
  }

  _invokeRequest(activatedRoute: ActivatedRoute) {
    activatedRoute.zone.runGuarded(() => {
      const injector = ReflectiveInjector.resolveAndCreate(
        [activatedRoute.route.request!],
        activatedRoute.injector
      );
      const instance = injector.get(
        activatedRoute.route.request,
        activatedRoute.route.request
      );

      if (typeof instance == "function") {
        (<RequestHandlerFn>instance)(
          activatedRoute.request,
          activatedRoute.response
        );
      } else if (
        typeof instance == "object" &&
        typeof (<RequestHandler>instance).handle == "function"
      ) {
        (<RequestHandler>instance).handle(
          activatedRoute.request,
          activatedRoute.response
        );
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

export interface ErrorContext {
  error: any;
  request: Request;
  response: Response;
  route?: Route;
}
