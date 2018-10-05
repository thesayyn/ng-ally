import { Response as ExpressResponse } from "express";

export abstract class Response {
  [key: string]: any;
}

export interface Response extends ExpressResponse {}
