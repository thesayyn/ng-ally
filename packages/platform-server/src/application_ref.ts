import { Injectable, APP_BOOTSTRAP_LISTENER, Injector } from "@angular/core";
import express from 'express'
import { APP_PORT, APP_ENDPOINT_LISTENER, APP_HOST } from "./application_tokens";

@Injectable()
export class ServerApplicationRef {

  app : express.Express; 

  constructor(private _injector: Injector) {
    this.app = express();
    this.app.use((req,res,next) => _injector.get(APP_ENDPOINT_LISTENER, []).forEach( listener => listener(req,res,next)));
    this.app.listen(_injector.get<number>(APP_PORT, 3100), _injector.get<string>(APP_HOST, 'localhost'));

    this._injector.get(APP_BOOTSTRAP_LISTENER, []).forEach(listener => {
      listener.call(listener,null);
    });
   

    

  }



}