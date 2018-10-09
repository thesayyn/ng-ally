import {
  APP_INITIALIZER,
  Inject,
  Injector,
  ModuleWithProviders,
  NgModule,
  NgZone,
  Optional
} from "@angular/core";
import { Guard, ROUTER_GUARDS } from "./checks";
import { ExtraOptions, EXTRA_OPTIONS, ROUTES, Routes } from "./config";
import { Router } from "./router";
import {
  DefaultRouterErrorHandler,
  ReportToErrorHandlerStrategy,
  RouterErrorHandlingStrategy,
  ROUTER_ERROR_HANDLER,
  SendThroughResponseStrategy
} from "./router_error_handler";
import { RouterInitializer } from "./router_initializer";
import { flatten } from "./utils";

@NgModule({})
export class RouterModule {
  static forRoot(
    routes: Routes,
    config: ExtraOptions = {}
  ): ModuleWithProviders {
    return {
      ngModule: RouterModule,
      providers: [
        {
          provide: EXTRA_OPTIONS,
          useValue: config
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
      providers: [provideRoutes(routes)]
    };
  }
}

export const setupRouter = (
  routes: Routes[],
  guards: Array<Guard>,
  injector: Injector,
  zone: NgZone,
  errorHandling: RouterErrorHandlingStrategy,
  options: ExtraOptions
): Router => {
  return new Router(flatten(routes), guards, injector, zone, errorHandling, {
    ...options,
    mergeParams: true
  });
};

export function provideRoutes(routes: Routes): any {
  return [{ provide: ROUTES, multi: true, useValue: routes }];
}

export function provideErrorHandlingStrategy(config: ExtraOptions) {
  return [
    {
      provide: RouterErrorHandlingStrategy,
      useClass:
        config.errorHandlingStrategy == "sendThroughResponse"
          ? SendThroughResponseStrategy
          : ReportToErrorHandlerStrategy,
      deps: [Injector]
    }
  ];
}

export function provideDefaultErrorHandler(): any {
  return [
    {
      provide: ROUTER_ERROR_HANDLER,
      useClass: DefaultRouterErrorHandler,
      deps: []
    }
  ];
}

export function getAppInitializer(r: RouterInitializer) {
  return r.appInitializer.bind(r);
}

export function provideRouterInitializer(): any {
  return [
    RouterInitializer,
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: getAppInitializer,
      deps: [RouterInitializer]
    }
  ];
}
