import { Injectable, Injector, NgModuleRef } from "@angular/core";
import { Router } from "./router";

@Injectable()
export class RouterInitializer {

  constructor(private injector: Injector){
  }

  appInitializer(): Promise<any> {
    return Promise.resolve(null);
  }

  bootstrapListener(): void {
  }

  endpointListener(req,res,next): void {
    this.injector.get(Router)._handleRoute(req,res,next);
  }
}