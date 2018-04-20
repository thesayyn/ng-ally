import { InjectionToken } from '@angular/core'

export const APP_HOST = new InjectionToken<string>('Application Host');
export const APP_PORT = new InjectionToken<number>('Application Port');
export const APP_ENDPOINT_LISTENER = new InjectionToken<Function[]>('Application Endpoint Listener');