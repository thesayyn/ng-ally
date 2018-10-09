import { Injectable, InjectionToken, Injector } from "@angular/core";
import { Request, Response } from "./http";
import { Route } from "./config";

export interface RouterErrorHandler {
  handle(error: any, request: Request, response: Response, route?: Route): void;
}

export class DefaultRouterErrorHandler implements RouterErrorHandler {
  handle(
    error: any,
    request: Request,
    response: Response,
    route?: Route
  ): void {
    throw error;
  }
}

export const ROUTER_ERROR_HANDLER = new InjectionToken<RouterErrorHandler>(
  "ROUTER_ERROR_HANDLER"
);

export function noHandleMethodError() {
  return new Error("The handle doesn't exists in type.");
}

export function noErrorHandlerError() {
  return new Error("No error handler specified.");
}

export abstract class RouterErrorHandlingStrategy
  implements RouterErrorHandler {
  abstract handle(
    error: any,
    request: Request,
    response: Response,
    route?: Route
  ): void;
}

@Injectable()
export class SendThroughResponseStrategy
  implements RouterErrorHandlingStrategy {
  handle(error: any, request: Request, response: Response, route: Route) {
    response.send({
      code: 500,
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}

@Injectable()
export class ReportToErrorHandlerStrategy
  implements RouterErrorHandlingStrategy {
  constructor(private injector: Injector) {}

  handle(error: any, request: Request, response: Response, route?: Route) {
    const routeHandler =
      route && route.errorHandler ? route.errorHandler : ROUTER_ERROR_HANDLER;
    const handler = this.injector.get(routeHandler);
    handler.handle(error, request, response);
  }
}
