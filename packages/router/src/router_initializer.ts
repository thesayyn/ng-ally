import { Injectable, Injector } from "@angular/core";
import { EXPRESS_APP } from "@ng-ally/platform-server";
import { Router } from "./router";

@Injectable()
export class RouterInitializer {
  constructor(private injector: Injector) {}

  appInitializer(): Promise<void> {
    return new Promise(resolve => {
      const app = this.injector.get(EXPRESS_APP);
      const router = this.injector.get(Router);
      app.use((request, response, next) =>
        router._handleRoute(request, response, next)
      );
      resolve();
    });
  }
}
