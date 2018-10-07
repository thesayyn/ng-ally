import { enableProdMode } from "@angular/core";
import { platformServer } from "@ng-ally/platform-server";

import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";

if (environment.production) {
  enableProdMode();
}

platformServer()
  .bootstrapModule(AppModule)
  .catch(err => console.log(err));
