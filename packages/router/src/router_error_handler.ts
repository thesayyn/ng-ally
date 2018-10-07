import { Injectable, InjectionToken, Injector } from "@angular/core";
import { Request, Response } from "./http";
import { Route } from "./config";

export abstract class RouterErrorHandler {
  abstract handle(error: any): void;
  abstract handle(error: any, response: Response);
  abstract handle(error: any, request: Request, response: Response): void;
  abstract handle(error: any, request: Request, response: Response, route: Route | undefined): void;
}

export class DefaultRouterErrorHandler implements RouterErrorHandler {
  handle(error: any): void {}
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

export abstract class RouterErrorHandlingStrategy {
  abstract handle(
    route: Route,
    request: Request,
    response: Response,
    error: any
  );
}

@Injectable()
export class SendThroughResponseStrategy implements RouterErrorHandlingStrategy {
  handle(route: Route, request: Request, response: Response, error: any) {
    response.send({
      code: 500,
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}

@Injectable()
export class ReportToErrorHandlerStrategy implements RouterErrorHandlingStrategy {
  constructor(
    private defaultErrorHandler: RouterErrorHandler,
    private injector: Injector
  ) {}

  handle(config: Route, request: Request, response: Response, error: any) {
    const handler: RouterErrorHandler =
      config && config.errorHandler
        ? this.injector.get(config.errorHandler)
        : this.defaultErrorHandler;
    handler.handle(error, request, response);
  }
}
