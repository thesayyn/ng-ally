import { Request as ExpressRequest } from "express";

export abstract class Request {
  [key: string]: any;
}

export interface Request extends ExpressRequest {}
