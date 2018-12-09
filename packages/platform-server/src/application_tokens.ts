import { InjectionToken } from '@angular/core';
import { Express } from 'express';
import { Server } from 'http';


export const EXPRESS_APP = new InjectionToken<Express>('EXPRESS_APP');
export const HTTP_SERVER = new InjectionToken<Server>('HTTP_SERVER');

export const HTTP_HOST = new InjectionToken<string>('HTTP_HOST');
export const HTTP_PORT = new InjectionToken<number>('HTTP_PORT');
export const HTTP_UNIX_SOCKET = new InjectionToken<number>('HTTP_UNIX_SOCKET');