import { Injectable, Injector, NgModuleRef } from "@angular/core";
import { DatabaseService } from "./database_service";


@Injectable()
export class DatabaseInitializer {

  constructor(private injector: Injector){
  }

  bootstrapListener(): void
  { 
    this.injector.get(DatabaseService);
  }
 
}