import { Observable } from "rxjs";
import { InjectionToken, Injector, Type } from "@angular/core";
import { Request, Response } from "./http";

export interface CanActivate {
  canActivate: CheckFn;
}

export interface CanActivateChild {
  canActivateChild: CheckFn;
}

export interface CanDeactivate {
  canDeactivate: CheckFn;
}

export type CheckFn = (
  request: Request,
  response: Response
) => Promise<boolean> | Observable<boolean> | boolean;

export type Guard = CanActivate | CanActivateChild | CanDeactivate | CheckFn;

export interface Checks {
  canActivateChecks: Array<CheckFn>;
  canDeactivateChecks: Array<CheckFn>;
}

export function swallowChecks(
  injector: Injector,
  guards: Guard[],
  forceFnTo: string = "canActivate"
): Checks {
  const checks: Checks = {
    canActivateChecks: [],
    canDeactivateChecks: []
  };

  guards.forEach(guard => {
    const instanceOrFn = injector.get(guard, guard);

    if (typeof instanceOrFn != "function") {
      if ((<CanActivate>instanceOrFn).canActivate) {
        checks.canActivateChecks.push(
          (<CheckFn>instanceOrFn.canActivate).bind(instanceOrFn)
        );
      }
      if ((<CanDeactivate>instanceOrFn).canDeactivate) {
        checks.canDeactivateChecks.push(
          (<CheckFn>instanceOrFn.canDeactivate).bind(instanceOrFn)
        );
      }
    } else {
      checks[`${forceFnTo}Checks`].push(instanceOrFn);
    }
  });

  return checks;
}

export function resolveChecks(
  injector: Injector,
  guards: Guard[],
  checkFn: string
): CheckFn[] {
  return guards.map(guard => {
    const instanceOrFn = injector.get(guard, guard);
    return typeof instanceOrFn != "function" && instanceOrFn[checkFn]
      ? (<CheckFn>instanceOrFn[checkFn]).bind(instanceOrFn)
      : instanceOrFn;
  });
}

export const ROUTER_GUARDS = new InjectionToken<Guard>("ROUTER_GUARDS");
