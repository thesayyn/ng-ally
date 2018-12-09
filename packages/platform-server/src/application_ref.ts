import { Injectable, Injector, APP_BOOTSTRAP_LISTENER } from "@angular/core";
import {
  HTTP_HOST,
  HTTP_PORT,
  HTTP_UNIX_SOCKET,
  EXPRESS_APP,
  HTTP_SERVER
} from "./application_tokens";

@Injectable()
export class ServerApplicationRef {
  constructor(private injector: Injector) {
    //Just for running dependency injection tree.
    injector.get(EXPRESS_APP);

    const host = injector.get(HTTP_HOST),
      port = injector.get(HTTP_PORT),
      unixSocket = injector.get(HTTP_UNIX_SOCKET),
      http = injector.get(HTTP_SERVER);

    const listenerCallback = () =>
      this.injector.get(APP_BOOTSTRAP_LISTENER, []).forEach(l => l(undefined));

    if (host && port) {
      http.listen({ host, port }, listenerCallback);
    } else if (unixSocket) {
      http.listen(unixSocket, listenerCallback);
    } else {
      throw new Error(
        "No way to listen http server because whether host-port or socket did not provided."
      );
    }
  }

  ngOnDestroy() {
    this.injector.get(HTTP_SERVER).close();
  }
}
