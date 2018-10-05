import { InjectionToken } from '@angular/core';
import { Express } from 'express';
import { Server } from 'http';


export const EXPRESS_APP = new InjectionToken<Express>('EXPRESS_APP');
export const SOCKETIO_APP = new InjectionToken<Express>('SOCKETIO_APP');
export const HTTP_SERVER = new InjectionToken<Server>('HTTP_SERVER');

export const APP_HOST = new InjectionToken<string>('Application Host');
export const APP_PORT = new InjectionToken<number>('Application Port');
