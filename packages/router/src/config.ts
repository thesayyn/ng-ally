import { InjectionToken, Type } from "@angular/core";
import { RequestHandler, RequestHandlerFn } from './http';

export type Routes = Route[];

export const ROUTES = new InjectionToken<Route[][]>("ROUTES");

export interface Route {
  path: string;
  type?: Method;
  errorHandler?: Type<any>;
  request?: Type<RequestHandler> | RequestHandlerFn | any;
  redirectTo?: string;
  canActivate?: any[];
  canActivateChild?: any[];
  canDeactivate?: any[];
  children?: Route[];
  data?: any;
}

export type Method = "PUT" | "POST" | "GET" | "DELETE" | "OPTIONS" | "PATCH";

export function validateConfig(config: Routes, parentPath: string = ""): void {
  for (let i = 0; i < config.length; i++) {
    const route: Route = config[i];
    const fullPath: string = getFullPath(parentPath, route);
    validateNode(route, fullPath);
  }
}

function validateNode(route: Route, fullPath: string): void {
  if (!route) {
    throw new Error(`
      Invalid configuration of route '${fullPath}': Encountered undefined route.
      The reason might be an extra comma.
      Example:
      const routes: Routes = [
        { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
        { path: 'dashboard',  request: DashboardRequest },, << two commas
        { path: 'detail/:id', request: HeroDetailRequest }
      ];
    `);
  }
  if (Array.isArray(route)) {
    throw new Error(
      `Invalid configuration of route '${fullPath}': Array cannot be specified`
    );
  }

  if (route.redirectTo && route.request) {
    throw new Error(
      `Invalid configuration of route '${fullPath}': redirectTo and request cannot be used together`
    );
  }

  if (route.children && route.redirectTo) {
    throw new Error(
      `Invalid configuration of route '${fullPath}': children and redirectTo cannot be used together`
    );
  }

  if (route.redirectTo && route.request) {
    throw new Error(
      `Invalid configuration of route '${fullPath}': redirectTo and request cannot be used together`
    );
  }

  if (route.children && route.type) {
    throw new Error(
      `Invalid configuration of route '${fullPath}': children and type cannot be used together`
    );
  }

  if (!route.children && !route.redirectTo && !route.type) {
    throw new Error(
      `Invalid configuration of route '${fullPath}': routes must have a type`
    );
  }

  if (route.path === void 0) {
    throw new Error(
      `Invalid configuration of route '${fullPath}': routes must have a path`
    );
  }

  if (typeof route.path === "string" && route.path.charAt(0) === "/") {
    throw new Error(
      `Invalid configuration of route '${fullPath}': path cannot start with a slash`
    );
  }
}

function getFullPath(parentPath: string, currentRoute: Route): string {
  if (!currentRoute) {
    return parentPath;
  }
  if (!parentPath && !currentRoute.path) {
    return "";
  } else if (parentPath && !currentRoute.path) {
    return `${parentPath}/`;
  } else if (!parentPath && currentRoute.path) {
    return currentRoute.path;
  } else {
    return `${parentPath}/${currentRoute.path}`;
  }
}

// Adds slash to route path
export function normalizePath(route: Route) {
  return `/${route.path}`;
}

export function copyConfig(r: Route): Route {
  const children = r.children && r.children.map(copyConfig);
  return children ? { ...r, children } : { ...r };
}

export const EXTRA_OPTIONS = new InjectionToken("Router extra options.");

export interface ExtraOptions {
  /**
   * Configures  error handling strategy..
   */
  errorHandlingStrategy?: "sendThroughResponse" | "reportToErrorHandler";

  /**
   * Enable case sensitivity.
   */
  caseSensitive?: boolean;

  /**
   * Preserve the req.params values from the parent router.
   * If the parent and the child have conflicting param names, the child’s value take precedence.
   *
   * @default true
   * @since 4.5.0
   */
  mergeParams?: boolean;

  /**
   * Enable strict routing.
   */
  strict?: boolean;
}
