import {
  Request as ExpressRequest,
  Response as ExpressResponse
} from "express";

export abstract class Request {
  [key: string]: any;
}

export abstract class Response {
  [key: string]: any;
}

export interface Request extends ExpressRequest {}
export interface Response extends ExpressResponse {}

export interface RequestHandler {
  handle: RequestHandlerFn;
}

export type RequestHandlerFn = (request: Request, response: Response) => void;
