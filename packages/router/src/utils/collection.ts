import { ɵisObservable as isObservable, ɵisPromise as isPromise } from '@angular/core';
import { Observable, from, of} from "rxjs";
import { mergeAll, every } from "rxjs/operators";


/**
 * Flattens single-level nested arrays.
 */
export function flatten<T>(arr: T[][]): T[] {
  return Array.prototype.concat.apply([], arr);
}


/**
 * ANDs Observables by merging all input observables, reducing to an Observable verifying all
 * input Observables return `true`.
 */
export function andObservables(observables: Observable<Observable<any>>): Observable<boolean> {
  return observables.pipe(mergeAll(), every((result: any) => result === true));
}
 
export function wrapIntoObservable<T>(value: T |  Promise<T>| Observable<T>):
  Observable<T> {
if (isObservable(value)) {
  return value as Observable<T>;
}

if (isPromise(value)) {
  // Use `Promise.resolve()` to wrap promise-like instances.
  // Required ie when a Resolver returns a AngularJS `$q` promise to correctly trigger the
  // change detection.
  return from(Promise.resolve(value));
}

return of (value as T);
}