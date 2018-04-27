import { Injectable, Injector, NgModuleRef } from "@angular/core";
import { EXPRESS_APP } from "@tdadmin/platform-server";

import { Router } from "./router";

@Injectable()
export class RouterInitializer {


  constructor(private injector: Injector){

  }

  appInitializer(): Promise<any> {
    return new Promise((resolve,reject)=>{
      const app = this.injector.get(EXPRESS_APP)
      const router = this.injector.get(Router);
      app.use((request: any, response: any, next: any) =>{
        router._handleRoute(request as any, response as any, next as any);
      });
      resolve();
    })
  }

}
