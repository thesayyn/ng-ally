import { Injectable, Injector, APP_BOOTSTRAP_LISTENER } from "@angular/core";
import {
  APP_PORT,
  APP_HOST,
  EXPRESS_APP,
  HTTP_SERVER
} from "./application_tokens";

@Injectable()
export class ServerApplicationRef {
  constructor(private injector: Injector) {
    //Just for running dependency injection tree.
    injector.get(EXPRESS_APP);

    const host = injector.get(APP_HOST, process.argv[2] || "0.0.0.0"),
          port = injector.get(APP_PORT, process.argv[3] || 4300);
    const http = injector.get(HTTP_SERVER);

    http.listen({ host, port }, () =>
      this.injector.get(APP_BOOTSTRAP_LISTENER, []).forEach(l => l(undefined))
    );
  }
}
