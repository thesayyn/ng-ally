import {
  Request as ExpressRequest,
  Response as ExpressResponse
} from 'express';

export abstract class Request<USERT = any, DATAT = any> {
  data?: DATAT;
  user?: USERT
  [key: string]: any;
}

export abstract class Response {
  [key: string]: any;
}

export interface Request extends ExpressRequest {}
export interface Response extends ExpressResponse {}

export interface RequestHandler {
  handle(request: Request, response: Response): void;
}

export type RequestHandlerFn = (request: Request, response: Response) => void;
