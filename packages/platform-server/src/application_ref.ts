import { Injectable, Injector, APP_BOOTSTRAP_LISTENER } from "@angular/core";
import { APP_PORT, APP_HOST, EXPRESS_APP, HTTP_SERVER } from "./application_tokens";

@Injectable()
export class ServerApplicationRef {

  constructor(private injector: Injector) {

    const app = injector.get(EXPRESS_APP);

    
    const port = injector.get(APP_PORT, 3100),
          host = injector.get(APP_HOST, '0.0.0.0')
    const http = injector.get(HTTP_SERVER);

    http.listen({host,port},()=>{

      this.injector.get(APP_BOOTSTRAP_LISTENER as any, []).forEach( l => l());
      console.log(`Application started running on ${host}:${port} `);
    });
    http.on("error", e => {
      throw e;
    })
  }
}